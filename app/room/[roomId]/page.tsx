"use client"

import { useState, useEffect, use } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { GameBoard } from "@/components/game-board"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  Copy, 
  Check, 
  ArrowLeft,
  Wifi,
  WifiOff,
  Clock,
  RefreshCw
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getSocketClient } from "@/lib/socket"
import { createInitialGameState } from "@/lib/checkers"
import type { RoomState, GameState, PlayerColor } from "@/lib/checkers/types"

interface PageProps {
  params: Promise<{ roomId: string }>
}

export default function RoomPage({ params }: PageProps) {
  const { roomId } = use(params)
  const router = useRouter()
  const [roomState, setRoomState] = useState<RoomState | null>(null)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [playerColor, setPlayerColor] = useState<PlayerColor | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showWaitingOverlay, setShowWaitingOverlay] = useState(true)
  const [opponentDisconnected, setOpponentDisconnected] = useState(false)

  useEffect(() => {
    const socket = getSocketClient()
    
    // Set up event listeners
    const unsubscribeJoined = socket.on<RoomState>("room:joined", (room) => {
      setRoomState(room)
      setIsConnected(true)
      
      // Determine player color
      const playerId = socket.getPlayerId()
      if (room.players.light?.id === playerId) {
        setPlayerColor("light")
      } else if (room.players.dark?.id === playerId) {
        setPlayerColor("dark")
      }
      
      // Check if both players are present
      if (room.players.light && room.players.dark) {
        setShowWaitingOverlay(false)
        // Initialize game if not already
        if (!room.gameState) {
          setGameState(createInitialGameState())
        } else {
          setGameState(room.gameState)
        }
      }
    })

    const unsubscribeSync = socket.on<{ gameState: GameState } | GameState>("game:state", (payload) => {
      const state = "gameState" in (payload as Record<string, unknown>)
        ? (payload as { gameState: GameState }).gameState
        : (payload as GameState)
      setGameState(state)
    })

    const unsubscribeLegacySync = socket.on<{ gameState: GameState } | GameState>("game:sync", (payload) => {
      const state = "gameState" in (payload as Record<string, unknown>)
        ? (payload as { gameState: GameState }).gameState
        : (payload as GameState)
      setGameState(state)
    })

    const unsubscribeDisconnect = socket.on<{ playerId: string }>("player:disconnect", () => {
      setOpponentDisconnected(true)
    })

    const unsubscribeReconnect = socket.on<{ playerId: string }>("player:reconnect", () => {
      setOpponentDisconnected(false)
    })

    const unsubscribeConnected = socket.on("connected", () => {
      setIsConnected(true)
      socket.rejoinRoom(roomId, "Player")
    })

    const unsubscribeSocketDisconnected = socket.on("disconnected", () => {
      setIsConnected(false)
    })

    // Connect to socket
    socket.connect()

    return () => {
      unsubscribeJoined()
      unsubscribeSync()
      unsubscribeLegacySync()
      unsubscribeDisconnect()
      unsubscribeReconnect()
      unsubscribeConnected()
      unsubscribeSocketDisconnected()
    }
  }, [roomId])

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const copyInviteLink = () => {
    const link = `${window.location.origin}/room/${roomId}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleMove = (_to: { row: number; col: number }, _captureSteps: unknown[], nextState: GameState) => {
    const socket = getSocketClient()
    socket.syncGameState(roomId, nextState)
    setGameState(nextState)
  }

  const handleLeaveRoom = () => {
    router.push("/play/friend")
  }

  // Waiting for opponent overlay
  if (showWaitingOverlay) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-primary" />
            </div>
            
            <h2 className="text-xl font-semibold mb-2">Waiting for opponent...</h2>
            <p className="text-muted-foreground mb-6">
              Share this code with a friend to start the game
            </p>

            {/* Room Code */}
            <div className="p-6 rounded-xl bg-muted/50 border border-border mb-6">
              <label className="text-sm text-muted-foreground block mb-2">Room Code</label>
              <div className="flex items-center justify-center gap-3">
                <span className="text-4xl font-mono font-bold tracking-widest">
                  {roomId.toUpperCase()}
                </span>
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-lg"
                  onClick={copyRoomCode}
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Copy invite link */}
            <Button
              variant="outline"
              className="rounded-xl w-full mb-4"
              onClick={copyInviteLink}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Invite Link
            </Button>

            <Button
              variant="ghost"
              className="rounded-xl w-full"
              onClick={handleLeaveRoom}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Leave Room
            </Button>

            {/* Connection status */}
            <div className="mt-6 flex items-center justify-center gap-2 text-sm">
              {isConnected ? (
                <>
                  <Wifi className="w-4 h-4 text-green-500" />
                  <span className="text-muted-foreground">Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-red-500" />
                  <span className="text-muted-foreground">Connecting...</span>
                </>
              )}
            </div>

            {/* Waiting animation */}
            <div className="mt-4 flex justify-center gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-primary"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Opponent disconnected overlay */}
      <AnimatePresence>
        {opponentDisconnected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="bg-card border border-border rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center"
            >
              <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
                <WifiOff className="w-6 h-6 text-yellow-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Opponent Disconnected</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Waiting for your opponent to reconnect...
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Reconnecting...</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game info header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 hidden lg:flex items-center justify-between bg-gradient-to-b from-background to-transparent pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto">
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg"
            onClick={handleLeaveRoom}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Leave
          </Button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/80 backdrop-blur-sm">
            <span className="text-sm text-muted-foreground">Room:</span>
            <span className="font-mono font-semibold">{roomId.toUpperCase()}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={copyRoomCode}
            >
              {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
            </Button>
          </div>
        </div>
        
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg pointer-events-auto",
          isConnected ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
        )}>
          {isConnected ? (
            <>
              <Wifi className="w-4 h-4" />
              <span className="text-sm font-medium">Online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4" />
              <span className="text-sm font-medium">Offline</span>
            </>
          )}
        </div>
      </div>

      {/* Game Board */}
      <GameBoard 
        mode="online" 
        onMove={handleMove}
        settings={gameState?.settings}
        onlinePlayerColor={playerColor}
        syncedGameState={gameState}
      />
    </div>
  )
}
