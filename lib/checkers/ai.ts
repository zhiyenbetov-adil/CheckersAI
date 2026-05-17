import { checkGameOver, getMovablePieces, makeMove, selectPiece, type GameState } from "./gameState"
import { getCaptureMoves } from "./moveValidation"
import type { CaptureStep, Piece, PlayerColor, Position } from "./types"

type AiLevel = "beginner" | "easy" | "medium" | "hard" | "expert"

interface MoveOutcome {
  state: GameState
}

const PIECE_VALUE = 100
const KING_BONUS = 80
const CENTER_BONUS = 6
const MOBILITY_BONUS = 2

function evaluatePosition(state: GameState, aiColor: PlayerColor): number {
  const opponent: PlayerColor = aiColor === "dark" ? "light" : "dark"
  const gameOver = checkGameOver(state)
  if (gameOver.isOver) {
    if (gameOver.winner === aiColor) return 1_000_000
    if (gameOver.winner === opponent) return -1_000_000
    return 0
  }

  const materialScore = state.pieces.reduce((acc, piece) => {
    const base = PIECE_VALUE + (piece.isKing ? KING_BONUS : 0)
    const centerDistance = Math.abs(3.5 - piece.position.col) + Math.abs(3.5 - piece.position.row)
    const center = Math.max(0, 10 - centerDistance) * CENTER_BONUS
    const score = base + center
    return acc + (piece.color === aiColor ? score : -score)
  }, 0)

  const currentPlayer = state.currentPlayer
  const myMobility = getMovablePieces({ ...state, currentPlayer: aiColor }).length
  const opponentMobility = getMovablePieces({ ...state, currentPlayer: opponent }).length
  const mobilityScore = (myMobility - opponentMobility) * MOBILITY_BONUS

  const tempoScore = currentPlayer === aiColor ? 4 : -4

  return materialScore + mobilityScore + tempoScore
}

function buildCaptureStep(piece: Piece, to: Position, pieces: Piece[]): CaptureStep | null {
  const capture = getCaptureMoves(piece, pieces).find((c) => c.to.row === to.row && c.to.col === to.col)
  if (!capture) return null
  return { from: piece.position, to: capture.to, captured: capture.captured }
}

function expandFromSelectedState(
  selectedState: GameState,
  captureSteps: CaptureStep[] = [],
): MoveOutcome[] {
  const outcomes: MoveOutcome[] = []

  for (const target of selectedState.validMoves) {
    const currentPiece = selectedState.selectedPiece
    const step = currentPiece ? buildCaptureStep(currentPiece, target, selectedState.pieces) : null
    const chainedSteps = step ? [...captureSteps, step] : captureSteps
    const { newState, move } = makeMove(selectedState, target, chainedSteps)

    if (move) {
      outcomes.push({ state: newState })
      continue
    }

    if (newState.multiCaptureInProgress && newState.selectedPiece) {
      outcomes.push(...expandFromSelectedState(newState, chainedSteps))
    }
  }

  return outcomes
}

function generateMoveOutcomes(state: GameState): MoveOutcome[] {
  if (state.gameStatus !== "playing") return []
  const movablePieces = getMovablePieces(state)
  const outcomes: MoveOutcome[] = []

  for (const piece of movablePieces) {
    const selected = selectPiece(state, piece.id)
    if (!selected.selectedPiece || selected.validMoves.length === 0) continue
    outcomes.push(...expandFromSelectedState(selected))
  }

  return outcomes
}

function minimax(
  state: GameState,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
  aiColor: PlayerColor,
): number {
  const gameOver = checkGameOver(state)
  if (depth === 0 || gameOver.isOver || state.gameStatus !== "playing") {
    return evaluatePosition(state, aiColor)
  }

  const outcomes = generateMoveOutcomes(state)
  if (outcomes.length === 0) {
    return evaluatePosition(state, aiColor)
  }

  if (maximizing) {
    let best = -Infinity
    for (const outcome of outcomes) {
      const score = minimax(outcome.state, depth - 1, alpha, beta, false, aiColor)
      best = Math.max(best, score)
      alpha = Math.max(alpha, best)
      if (beta <= alpha) break
    }
    return best
  }

  let best = Infinity
  for (const outcome of outcomes) {
    const score = minimax(outcome.state, depth - 1, alpha, beta, true, aiColor)
    best = Math.min(best, score)
    beta = Math.min(beta, best)
    if (beta <= alpha) break
  }
  return best
}

function depthByLevel(level: AiLevel): number {
  switch (level) {
    case "beginner":
      return 1
    case "easy":
      return 2
    case "medium":
      return 4
    case "hard":
      return 6
    case "expert":
      return 8
    default:
      return 4
  }
}

export function chooseAiMoveState(state: GameState, level: AiLevel, aiColor: PlayerColor = "dark"): GameState {
  const outcomes = generateMoveOutcomes(state)
  if (outcomes.length === 0) return state

  if (level === "beginner") {
    return outcomes[Math.floor(Math.random() * outcomes.length)].state
  }

  const depth = depthByLevel(level)
  const scored = outcomes.map((outcome) => ({
    outcome,
    score: minimax(
      outcome.state,
      depth - 1,
      -Infinity,
      Infinity,
      false,
      aiColor,
    ),
  }))

  scored.sort((a, b) => b.score - a.score)

  if (level === "easy") {
    const pool = scored.slice(0, Math.min(3, scored.length))
    return pool[Math.floor(Math.random() * pool.length)].outcome.state
  }

  if (level === "medium") {
    const pool = scored.slice(0, Math.min(2, scored.length))
    return pool[Math.floor(Math.random() * pool.length)].outcome.state
  }

  return scored[0].outcome.state
}

