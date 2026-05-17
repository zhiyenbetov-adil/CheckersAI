// Move validation and calculation for Checkers AI

import type { 
  Position, 
  Piece, 
  PlayerColor, 
  Move, 
  CaptureStep 
} from "./types"

/**
 * Check if a position is within the board bounds
 */
export function isValidPosition(pos: Position): boolean {
  return pos.row >= 0 && pos.row < 8 && pos.col >= 0 && pos.col < 8
}

/**
 * Check if a square is playable (dark squares only in checkers)
 */
export function isPlayableSquare(row: number, col: number): boolean {
  return (row + col) % 2 === 1
}

/**
 * Get the piece at a specific position
 */
export function getPieceAt(pieces: Piece[], pos: Position): Piece | undefined {
  return pieces.find(p => p.position.row === pos.row && p.position.col === pos.col)
}

/**
 * Get all possible capture moves for a piece (single step)
 * Returns array of { to: Position, captured: Position }
 */
export function getCaptureMoves(
  piece: Piece, 
  pieces: Piece[]
): { to: Position; captured: Position }[] {
  const captures: { to: Position; captured: Position }[] = []
  const directions = [-1, 1]

  if (!piece.isKing) {
    // Men can capture in both directions.
    for (const rowDir of directions) {
      for (const colDir of [-1, 1]) {
        const midPos: Position = {
          row: piece.position.row + rowDir,
          col: piece.position.col + colDir,
        }
        const jumpPos: Position = {
          row: piece.position.row + rowDir * 2,
          col: piece.position.col + colDir * 2,
        }

        if (!isValidPosition(midPos) || !isValidPosition(jumpPos)) continue

        const midPiece = getPieceAt(pieces, midPos)
        const jumpSquare = getPieceAt(pieces, jumpPos)

        if (midPiece && midPiece.color !== piece.color && !jumpSquare) {
          captures.push({ to: jumpPos, captured: midPos })
        }
      }
    }
    return captures
  }

  // Kings are flying for movement, but for captures they must land on the
  // first empty square immediately after the captured piece.
  for (const rowDir of directions) {
    for (const colDir of [-1, 1]) {
      let row = piece.position.row + rowDir
      let col = piece.position.col + colDir
      let captured: Position | null = null

      while (isValidPosition({ row, col })) {
        const onSquare = getPieceAt(pieces, { row, col })
        if (!captured) {
          if (!onSquare) {
            row += rowDir
            col += colDir
            continue
          }
          if (onSquare.color === piece.color) {
            break
          }
          captured = { row, col }
          row += rowDir
          col += colDir
          continue
        }

        if (onSquare) break
        captures.push({
          to: { row, col },
          captured,
        })
        // Stop after the first landing square right after captured piece.
        break
      }
    }
  }
  
  return captures
}

/**
 * Get all possible regular (non-capture) moves for a piece
 */
export function getRegularMoves(
  piece: Piece, 
  pieces: Piece[]
): Position[] {
  const moves: Position[] = []
  if (!piece.isKing) {
    const rowDir = piece.color === "light" ? -1 : 1
    for (const colDir of [-1, 1]) {
      const newPos: Position = {
        row: piece.position.row + rowDir,
        col: piece.position.col + colDir,
      }
      if (isValidPosition(newPos) && !getPieceAt(pieces, newPos)) {
        moves.push(newPos)
      }
    }
    return moves
  }

  for (const rowDir of [-1, 1]) {
    for (const colDir of [-1, 1]) {
      let row = piece.position.row + rowDir
      let col = piece.position.col + colDir
      while (isValidPosition({ row, col }) && !getPieceAt(pieces, { row, col })) {
        moves.push({ row, col })
        row += rowDir
        col += colDir
      }
    }
  }
  
  return moves
}

/**
 * Check if any piece of a color has available capture moves
 */
export function hasAvailableCaptures(pieces: Piece[], color: PlayerColor): boolean {
  return pieces
    .filter(p => p.color === color)
    .some(p => getCaptureMoves(p, pieces).length > 0)
}

/**
 * Get all valid moves for a piece considering forced capture rules
 * If forcedCapture is true and captures are available, only capture moves are valid
 */
export function getValidMovesForPiece(
  piece: Piece,
  pieces: Piece[],
  forcedCapture: boolean = true
): Position[] {
  const captures = getCaptureMoves(piece, pieces)
  
  if (captures.length > 0) {
    return captures.map(c => c.to)
  }
  
  // If forced capture is enabled and any piece has a capture, return empty
  if (forcedCapture && hasAvailableCaptures(pieces, piece.color)) {
    return []
  }
  
  return getRegularMoves(piece, pieces)
}

/**
 * Get all capture sequences from a starting position
 * Used for multi-capture chains
 */
export function getCaptureSequences(
  piece: Piece,
  pieces: Piece[],
  currentSequence: CaptureStep[] = []
): CaptureStep[][] {
  const captures = getCaptureMoves(piece, pieces)
  
  if (captures.length === 0) {
    return currentSequence.length > 0 ? [currentSequence] : []
  }
  
  const sequences: CaptureStep[][] = []
  
  for (const capture of captures) {
    const step: CaptureStep = {
      from: piece.position,
      to: capture.to,
      captured: capture.captured
    }
    
    // Simulate the capture
    const newPieces = pieces
      .filter(p => p.position.row !== capture.captured.row || p.position.col !== capture.captured.col)
      .map(p => {
        if (p.id === piece.id) {
          return {
            ...p,
            position: capture.to,
            isKing: p.isKing || (p.color === "light" && capture.to.row === 0) || (p.color === "dark" && capture.to.row === 7)
          }
        }
        return p
      })
    
    const movedPiece = newPieces.find(p => p.id === piece.id)!
    const subSequences = getCaptureSequences(movedPiece, newPieces, [...currentSequence, step])
    
    if (subSequences.length > 0) {
      sequences.push(...subSequences)
    } else {
      sequences.push([...currentSequence, step])
    }
  }
  
  return sequences
}

/**
 * Check if a move results in promotion
 */
export function shouldPromote(piece: Piece, toRow: number): boolean {
  if (piece.isKing) return false
  return (piece.color === "light" && toRow === 0) || (piece.color === "dark" && toRow === 7)
}

/**
 * Validate a move
 */
export function isValidMove(
  piece: Piece,
  to: Position,
  pieces: Piece[],
  forcedCapture: boolean = true
): boolean {
  const validMoves = getValidMovesForPiece(piece, pieces, forcedCapture)
  return validMoves.some(m => m.row === to.row && m.col === to.col)
}

/**
 * Check if a piece has more captures available after a capture
 */
export function hasMoreCaptures(piece: Piece, pieces: Piece[]): boolean {
  return getCaptureMoves(piece, pieces).length > 0
}

/**
 * Convert position to standard checkers notation (1-32 for playable squares)
 */
export function positionToNotation(pos: Position): string {
  const file = String.fromCharCode(97 + pos.col) // a-h
  const rank = String(8 - pos.row) // 1-8 from light perspective
  return `${file}${rank}`
}

/**
 * Generate move notation string
 */
export function generateMoveNotation(move: Move): string {
  const fromNotation = positionToNotation(move.from)
  const toNotation = positionToNotation(move.to)
  
  if (move.isCapture && move.captureSteps && move.captureSteps.length > 1) {
    // Multi-capture notation: c3xe5xg7
    const positions = [fromNotation, ...move.captureSteps.map(s => positionToNotation(s.to))]
    return positions.join("x")
  } else if (move.isCapture) {
    return `${fromNotation}x${toNotation}`
  } else {
    return `${fromNotation}-${toNotation}`
  }
}
