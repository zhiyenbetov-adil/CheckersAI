// Core game types for Checkers AI

export type PlayerColor = "light" | "dark"

export interface Position {
  row: number
  col: number
}

export interface Piece {
  id: string
  position: Position
  isKing: boolean
  color: PlayerColor
}

export interface CaptureStep {
  from: Position
  to: Position
  captured: Position
}

export interface Move {
  pieceId: string
  from: Position
  to: Position
  isCapture: boolean
  captureSteps?: CaptureStep[]
  promotedToKing?: boolean
}

export interface MoveRecord {
  move: Move
  notation: string
  timestamp: number
}

export interface GameSettings {
  forcedCapture: boolean // Must continue capturing if possible
  allowManualStop: boolean // Can stop mid-capture chain (if forcedCapture is false)
  timeControl: number // seconds per player, 0 for unlimited
}

export interface GameState {
  pieces: Piece[]
  currentPlayer: PlayerColor
  selectedPiece: Piece | null
  multiCaptureInProgress: boolean
  activePieceId: string | null // piece in mid-capture chain
  validMoves: Position[]
  capturedPieces: { light: number; dark: number }
  moveHistory: MoveRecord[]
  gameStatus: "waiting" | "playing" | "finished"
  winner: PlayerColor | "draw" | null
  settings: GameSettings
}

export interface RoomState {
  roomId: string
  roomCode: string
  players: {
    light: PlayerInfo | null
    dark: PlayerInfo | null
  }
  gameState: GameState | null
  status: "waiting" | "ready" | "playing" | "finished"
  createdAt: number
}

export interface PlayerInfo {
  id: string
  name: string
  rating: number
  isConnected: boolean
}

// WebSocket event types
export type SocketEvent =
  | { type: "room:create"; payload: { roomCode: string } }
  | { type: "room:join"; payload: { roomCode: string; playerId: string; playerName: string } }
  | { type: "room:joined"; payload: RoomState }
  | { type: "room:error"; payload: { message: string } }
  | { type: "game:start"; payload: GameState }
  | { type: "move:make"; payload: { move: Move } }
  | { type: "move:multiCaptureStep"; payload: { step: CaptureStep } }
  | { type: "move:complete"; payload: { move: Move } }
  | { type: "game:sync"; payload: GameState }
  | { type: "player:disconnect"; payload: { playerId: string } }
  | { type: "player:reconnect"; payload: { playerId: string } }
  | { type: "game:over"; payload: { winner: PlayerColor | "draw" } }
