import { io, type Socket } from "socket.io-client"
import type { CaptureStep, GameState, Move, RoomState } from "@/lib/checkers/types"

type EventHandler<T = unknown> = (data: T) => void

interface SocketClientConfig {
  url?: string
  autoReconnect?: boolean
}

interface SocketEnvelope<T = unknown> {
  type: string
  payload: T
}

export class SocketClient {
  private socket: Socket | null = null
  private readonly config: Required<SocketClientConfig>
  private readonly handlers = new Map<string, EventHandler[]>()
  private playerId: string
  private isConnected = false

  constructor(config: SocketClientConfig = {}) {
    this.config = {
      url: config.url || process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001",
      autoReconnect: config.autoReconnect ?? true,
    }
    this.playerId = this.loadOrCreatePlayerId()
  }

  private loadOrCreatePlayerId(): string {
    if (typeof window === "undefined") {
      return `player_${Math.random().toString(36).slice(2, 9)}`
    }
    const key = "checkers_player_id"
    const existing = localStorage.getItem(key)
    if (existing) return existing
    const created = `player_${Math.random().toString(36).slice(2, 9)}`
    localStorage.setItem(key, created)
    return created
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        this.isConnected = true
        resolve()
        return
      }

      this.socket = io(this.config.url, {
        autoConnect: true,
        reconnection: this.config.autoReconnect,
        transports: ["websocket", "polling"],
      })

      this.socket.on("connect", () => {
        this.isConnected = true
        this.emit("connected", { playerId: this.playerId, socketId: this.socket?.id })
        resolve()
      })

      this.socket.on("disconnect", () => {
        this.isConnected = false
        this.emit("disconnected", {})
      })

      this.socket.on("connect_error", (error) => {
        this.emit("error", { message: error.message })
        reject(error)
      })

      this.socket.onAny((type: string, payload: unknown) => {
        this.emit(type, payload)
      })
    })
  }

  disconnect(): void {
    this.socket?.disconnect()
    this.socket = null
    this.isConnected = false
  }

  on<T = unknown>(eventType: string, handler: EventHandler<T>): () => void {
    const handlers = this.handlers.get(eventType) || []
    handlers.push(handler as EventHandler)
    this.handlers.set(eventType, handlers)
    return () => {
      const list = this.handlers.get(eventType) || []
      const idx = list.indexOf(handler as EventHandler)
      if (idx >= 0) list.splice(idx, 1)
      this.handlers.set(eventType, list)
    }
  }

  private emit<T>(eventType: string, payload: T): void {
    const handlers = this.handlers.get(eventType) || []
    handlers.forEach((handler) => handler(payload))
  }

  private send<T>(type: string, payload: T): void {
    if (!this.socket) return
    this.socket.emit(type, payload)
  }

  createRoom(): void {
    this.send("room:create", { playerId: this.playerId })
  }

  joinRoom(roomCode: string, playerName = "Guest"): void {
    this.send("room:join", { roomCode, playerId: this.playerId, playerName })
  }

  rejoinRoom(roomCode: string, playerName = "Player"): void {
    this.send("player:reconnect", { roomCode, playerId: this.playerId, playerName })
  }

  startGame(gameState: GameState, roomCode: string): void {
    this.send("game:start", { roomCode, playerId: this.playerId, gameState })
  }

  makeMove(roomCode: string, move: Move): void {
    this.send("move:make", { roomCode, playerId: this.playerId, move })
  }

  sendCaptureStep(roomCode: string, step: CaptureStep): void {
    this.send("move:multiCaptureStep", { roomCode, playerId: this.playerId, step })
  }

  completeMove(roomCode: string, move: Move): void {
    this.send("move:complete", { roomCode, playerId: this.playerId, move })
  }

  syncGameState(roomCode: string, gameState: GameState): void {
    this.send("game:sync", { roomCode, playerId: this.playerId, gameState })
  }

  getConnectionStatus(): boolean {
    return this.isConnected
  }

  getPlayerId(): string {
    return this.playerId
  }
}

let socketClientInstance: SocketClient | null = null

export function getSocketClient(config?: SocketClientConfig): SocketClient {
  if (!socketClientInstance) {
    socketClientInstance = new SocketClient(config)
  }
  return socketClientInstance
}

export function resetSocketClient(): void {
  if (socketClientInstance) {
    socketClientInstance.disconnect()
    socketClientInstance = null
  }
}
