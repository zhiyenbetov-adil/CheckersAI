// Game state management for Checkers AI

import type { 
  GameState, 
  GameSettings, 
  Piece, 
  Position, 
  PlayerColor,
  Move,
  MoveRecord,
  CaptureStep
} from "./types"
import {
  getPieceAt,
  getCaptureMoves,
  getValidMovesForPiece,
  hasMoreCaptures,
  shouldPromote,
  generateMoveNotation,
  hasAvailableCaptures
} from "./moveValidation"

/**
 * Create initial piece setup
 */
export function createInitialPieces(): Piece[] {
  const pieces: Piece[] = []
  
  // Dark pieces (top - rows 0-2)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        pieces.push({
          id: `dark-${row}-${col}`,
          position: { row, col },
          isKing: false,
          color: "dark"
        })
      }
    }
  }
  
  // Light pieces (bottom - rows 5-7)
  for (let row = 5; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        pieces.push({
          id: `light-${row}-${col}`,
          position: { row, col },
          isKing: false,
          color: "light"
        })
      }
    }
  }
  
  return pieces
}

/**
 * Create default game settings
 */
export function createDefaultSettings(): GameSettings {
  return {
    forcedCapture: true,
    allowManualStop: false,
    timeControl: 600 // 10 minutes
  }
}

/**
 * Create initial game state
 */
export function createInitialGameState(settings?: Partial<GameSettings>): GameState {
  const finalSettings = { ...createDefaultSettings(), ...settings }
  
  return {
    pieces: createInitialPieces(),
    currentPlayer: "light",
    selectedPiece: null,
    multiCaptureInProgress: false,
    activePieceId: null,
    validMoves: [],
    capturedPieces: { light: 0, dark: 0 },
    moveHistory: [],
    gameStatus: "playing",
    winner: null,
    settings: finalSettings
  }
}

/**
 * Select a piece and calculate valid moves
 */
export function selectPiece(state: GameState, pieceId: string): GameState {
  // During multi-capture, can only select the active piece
  if (state.multiCaptureInProgress && state.activePieceId !== pieceId) {
    return state
  }
  
  const piece = state.pieces.find(p => p.id === pieceId)
  if (!piece || piece.color !== state.currentPlayer) {
    return state
  }
  
  // During multi-capture, only capture moves are valid
  const validMoves = state.multiCaptureInProgress
    ? getCaptureMoves(piece, state.pieces).map(c => c.to)
    : getValidMovesForPiece(piece, state.pieces, state.settings.forcedCapture)
  
  return {
    ...state,
    selectedPiece: piece,
    validMoves
  }
}

/**
 * Deselect current piece
 */
export function deselectPiece(state: GameState): GameState {
  // Can't deselect during multi-capture
  if (state.multiCaptureInProgress) {
    return state
  }
  
  return {
    ...state,
    selectedPiece: null,
    validMoves: []
  }
}

/**
 * Execute a single capture step (part of multi-capture)
 */
export function executeCaptureStep(
  state: GameState,
  to: Position
): { newState: GameState; captureStep: CaptureStep | null; moveComplete: boolean } {
  if (!state.selectedPiece) {
    return { newState: state, captureStep: null, moveComplete: false }
  }
  
  const captures = getCaptureMoves(state.selectedPiece, state.pieces)
  const capture = captures.find(c => c.to.row === to.row && c.to.col === to.col)
  
  if (!capture) {
    return { newState: state, captureStep: null, moveComplete: false }
  }
  
  const captureStep: CaptureStep = {
    from: state.selectedPiece.position,
    to: capture.to,
    captured: capture.captured
  }
  
  // Remove captured piece and move the capturing piece
  const capturedPiece = getPieceAt(state.pieces, capture.captured)!
  const willPromote = shouldPromote(state.selectedPiece, to.row)
  
  const newPieces = state.pieces
    .filter(p => p.id !== capturedPiece.id)
    .map(p => {
      if (p.id === state.selectedPiece!.id) {
        return {
          ...p,
          position: to,
          isKing: p.isKing || willPromote
        }
      }
      return p
    })
  
  const movedPiece = newPieces.find(p => p.id === state.selectedPiece!.id)!
  const canContinue = hasMoreCaptures(movedPiece, newPieces)
  
  // Update captured count
  const newCapturedPieces = {
    ...state.capturedPieces,
    [capturedPiece.color]: state.capturedPieces[capturedPiece.color] + 1
  }
  
  // Check if must continue or turn is complete
  const mustContinue = canContinue && state.settings.forcedCapture
  const moveComplete = !canContinue || (!state.settings.forcedCapture && state.settings.allowManualStop)
  
  // Calculate valid moves for potential next capture
  const nextValidMoves = canContinue 
    ? getCaptureMoves(movedPiece, newPieces).map(c => c.to)
    : []
  
  return {
    newState: {
      ...state,
      pieces: newPieces,
      selectedPiece: canContinue ? movedPiece : null,
      multiCaptureInProgress: mustContinue,
      activePieceId: mustContinue ? movedPiece.id : null,
      validMoves: nextValidMoves,
      capturedPieces: newCapturedPieces
    },
    captureStep,
    moveComplete: !mustContinue
  }
}

/**
 * Execute a regular (non-capture) move
 */
export function executeRegularMove(state: GameState, to: Position): GameState {
  if (!state.selectedPiece || state.multiCaptureInProgress) {
    return state
  }
  
  // Check if this is a valid regular move
  const isCapture = getCaptureMoves(state.selectedPiece, state.pieces).some(
    (c) => c.to.row === to.row && c.to.col === to.col
  )
  
  if (isCapture) {
    // This should go through capture flow
    return state
  }
  
  const willPromote = shouldPromote(state.selectedPiece, to.row)
  
  const newPieces = state.pieces.map(p => {
    if (p.id === state.selectedPiece!.id) {
      return {
        ...p,
        position: to,
        isKing: p.isKing || willPromote
      }
    }
    return p
  })
  
  const move: Move = {
    pieceId: state.selectedPiece.id,
    from: state.selectedPiece.position,
    to,
    isCapture: false,
    promotedToKing: willPromote
  }
  
  const moveRecord: MoveRecord = {
    move,
    notation: generateMoveNotation(move),
    timestamp: Date.now()
  }
  
  return {
    ...state,
    pieces: newPieces,
    selectedPiece: null,
    validMoves: [],
    currentPlayer: state.currentPlayer === "light" ? "dark" : "light",
    moveHistory: [...state.moveHistory, moveRecord]
  }
}

/**
 * Make a complete move (handles both regular and capture moves)
 */
export function makeMove(
  state: GameState, 
  to: Position,
  captureSteps: CaptureStep[] = []
): { newState: GameState; move: Move | null } {
  if (!state.selectedPiece) {
    return { newState: state, move: null }
  }
  
  // Check if target is in valid moves
  if (!state.validMoves.some(m => m.row === to.row && m.col === to.col)) {
    return { newState: state, move: null }
  }
  
  const isCapture = getCaptureMoves(state.selectedPiece, state.pieces).some(
    (c) => c.to.row === to.row && c.to.col === to.col
  )
  
  if (!isCapture) {
    const newState = executeRegularMove(state, to)
    const move = newState.moveHistory[newState.moveHistory.length - 1]?.move || null
    return { newState, move }
  }
  
  // Execute capture step
  const { newState, captureStep, moveComplete } = executeCaptureStep(state, to)
  
  if (!captureStep) {
    return { newState: state, move: null }
  }
  
  const allCaptureSteps = [...captureSteps, captureStep]
  
  if (moveComplete) {
    // Complete the move
    const move: Move = {
      pieceId: state.selectedPiece.id,
      from: captureSteps.length > 0 ? captureSteps[0].from : captureStep.from,
      to: captureStep.to,
      isCapture: true,
      captureSteps: allCaptureSteps,
      promotedToKing: newState.pieces.find(p => p.id === state.selectedPiece!.id)?.isKing && !state.selectedPiece.isKing
    }
    
    const moveRecord: MoveRecord = {
      move,
      notation: generateMoveNotation(move),
      timestamp: Date.now()
    }
    
    // Check for game over
    const nextPlayer = state.currentPlayer === "light" ? "dark" : "light"
    const nextPlayerPieces = newState.pieces.filter(p => p.color === nextPlayer)
    const hasValidMoves = nextPlayerPieces.some(p => 
      getValidMovesForPiece(p, newState.pieces, newState.settings.forcedCapture).length > 0
    )
    
    const gameOver = nextPlayerPieces.length === 0 || !hasValidMoves
    
    return {
      newState: {
        ...newState,
        currentPlayer: nextPlayer,
        selectedPiece: null,
        validMoves: [],
        multiCaptureInProgress: false,
        activePieceId: null,
        moveHistory: [...state.moveHistory, moveRecord],
        gameStatus: gameOver ? "finished" : "playing",
        winner: gameOver ? state.currentPlayer : null
      },
      move
    }
  }
  
  // Multi-capture in progress - return intermediate state
  return { 
    newState: {
      ...newState,
      // Store partial capture steps for the ongoing move
    }, 
    move: null 
  }
}

/**
 * End a multi-capture chain manually (when allowed)
 */
export function endMultiCapture(state: GameState, captureSteps: CaptureStep[]): GameState {
  if (!state.multiCaptureInProgress || !state.settings.allowManualStop) {
    return state
  }
  
  if (captureSteps.length === 0) {
    return state
  }
  
  const firstStep = captureSteps[0]
  const lastStep = captureSteps[captureSteps.length - 1]
  
  const move: Move = {
    pieceId: state.activePieceId!,
    from: firstStep.from,
    to: lastStep.to,
    isCapture: true,
    captureSteps
  }
  
  const moveRecord: MoveRecord = {
    move,
    notation: generateMoveNotation(move),
    timestamp: Date.now()
  }
  
  const nextPlayer = state.currentPlayer === "light" ? "dark" : "light"
  
  return {
    ...state,
    currentPlayer: nextPlayer,
    selectedPiece: null,
    validMoves: [],
    multiCaptureInProgress: false,
    activePieceId: null,
    moveHistory: [...state.moveHistory, moveRecord]
  }
}

/**
 * Check if game is over
 */
export function checkGameOver(state: GameState): { isOver: boolean; winner: PlayerColor | "draw" | null } {
  const lightPieces = state.pieces.filter(p => p.color === "light")
  const darkPieces = state.pieces.filter(p => p.color === "dark")
  
  if (lightPieces.length === 0) {
    return { isOver: true, winner: "dark" }
  }
  
  if (darkPieces.length === 0) {
    return { isOver: true, winner: "light" }
  }
  
  // Check if current player has any valid moves
  const currentPieces = state.pieces.filter(p => p.color === state.currentPlayer)
  const hasValidMoves = currentPieces.some(p => 
    getValidMovesForPiece(p, state.pieces, state.settings.forcedCapture).length > 0
  )
  
  if (!hasValidMoves) {
    // Current player has no moves - opponent wins
    return { 
      isOver: true, 
      winner: state.currentPlayer === "light" ? "dark" : "light" 
    }
  }
  
  return { isOver: false, winner: null }
}

/**
 * Get pieces that can move for current player
 */
export function getMovablePieces(state: GameState): Piece[] {
  if (state.multiCaptureInProgress) {
    const activePiece = state.pieces.find(p => p.id === state.activePieceId)
    return activePiece ? [activePiece] : []
  }
  
  // If forced capture and captures are available, only those pieces can move
  if (state.settings.forcedCapture && hasAvailableCaptures(state.pieces, state.currentPlayer)) {
    return state.pieces.filter(p => 
      p.color === state.currentPlayer && 
      getCaptureMoves(p, state.pieces).length > 0
    )
  }
  
  return state.pieces.filter(p => 
    p.color === state.currentPlayer && 
    getValidMovesForPiece(p, state.pieces, state.settings.forcedCapture).length > 0
  )
}
