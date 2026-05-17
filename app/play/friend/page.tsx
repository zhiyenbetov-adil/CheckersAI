"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  Bot,
  Globe, 
  Play,
  ArrowRight,
  Copy,
  Check,
  Plus,
  Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getSocketClient } from "@/lib/socket"
import type { RoomState } from "@/lib/checkers/types"

const otherPlayModes = [
  { id: "local", title: "Play Locally", description: "Play on the same device with a friend", href: "/play?mode=local", icon: Users },
  { id: "ai", title: "Play vs AI", description: "Challenge our AI at various difficulty levels", href: "/play?mode=ai", icon: Bot },
  { id: "play", title: "Open Play Hub", description: "Return to the main play screen", href: "/play", icon: Play },
]

const timeControls = [
  { id: "bullet", label: "Bullet", time: 180, description: "3 minutes" },
  { id: "blitz", label: "Blitz", time: 300, description: "5 minutes" },
  { id: "rapid", label: "Rapid", time: 600, description: "10 minutes" },
  { id: "classical", label: "Classical", time: 1800, description: "30 minutes" },
  { id: "unlimited", label: "Unlimited", time: 0, description: "No time limit" },
]

export default function PlayFriendPage() {
  const router = useRouter()
  const [showCreateRoom, setShowCreateRoom] = useState(false)
  const [showJoinRoom, setShowJoinRoom] = useState(false)
  const [roomCode, setRoomCode] = useState("")
  const [joinCode, setJoinCode] = useState("")
  const [copied, setCopied] = useState(false)
  const [selectedTimeControl, setSelectedTimeControl] = useState("rapid")
  const [isConnecting, setIsConnecting] = useState(false)
  const [roomState, setRoomState] = useState<RoomState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [playerName, setPlayerName] = useState("Guest")

  useEffect(() => {
    try {
      const raw = localStorage.getItem("checkers_auth_user")
      if (raw) {
        const user = JSON.parse(raw) as { name?: string }
        if (user.name?.trim()) setPlayerName(user.name.trim())
      }
    } catch {}

    const socket = getSocketClient()
    
    // Set up event listeners
    const unsubscribeJoined = socket.on<RoomState>("room:joined", (room) => {
      setRoomState(room)
      setRoomCode(room.roomCode)
      setIsConnecting(false)
      
      // If both players are ready, navigate to game
      if (room.players.light && room.players.dark) {
        router.push(`/room/${room.roomCode}`)
      }
    })

    const unsubscribePlayerJoined = socket.on<RoomState>("room:playerJoined", (room) => {
      setRoomState(room)
      if (room.players.light && room.players.dark) {
        router.push(`/room/${room.roomCode}`)
      }
    })

    const unsubscribeError = socket.on<{ message: string }>("error", (data) => {
      setError(data.message)
      setIsConnecting(false)
    })

    const unsubscribeRoomError = socket.on<{ message: string }>("room:error", (data) => {
      setError(data.message)
      setIsConnecting(false)
    })

    // Connect to socket
    socket.connect()

    return () => {
      unsubscribeJoined()
      unsubscribePlayerJoined()
      unsubscribeError()
      unsubscribeRoomError()
    }
  }, [router])

  const handleCreateRoom = async () => {
    setIsConnecting(true)
    setError(null)
    const socket = getSocketClient()
    if ((process.env.NEXT_PUBLIC_WS_URL || "").includes("example.com")) {
      setError("Realtime server is not configured. Set NEXT_PUBLIC_WS_URL to your backend URL.")
      setIsConnecting(false)
      return
    }
    try {
      await socket.connect()
    } catch {}
    socket.createRoom()
  }

  const handleJoinRoom = async () => {
    if (!joinCode.trim()) {
      setError("Please enter a room code")
      return
    }
    setIsConnecting(true)
    setError(null)
    const socket = getSocketClient()
    if ((process.env.NEXT_PUBLIC_WS_URL || "").includes("example.com")) {
      setError("Realtime server is not configured. Set NEXT_PUBLIC_WS_URL to your backend URL.")
      setIsConnecting(false)
      return
    }
    try {
      await socket.connect()
    } catch {}
    socket.joinRoom(joinCode.toUpperCase(), playerName)
  }

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const copyInviteLink = () => {
    const link = `${window.location.origin}/room/${roomCode}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Globe className="w-4 h-4" />
              Online Multiplayer
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Play with a Friend</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Create a room and share the code with a friend, or join an existing room to start playing.
            </p>
          </motion.div>

          {/* Mode Selection or Room Setup */}
          {!showCreateRoom && !showJoinRoom && !roomState && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto"
            >
              <button
                onClick={() => setShowCreateRoom(true)}
                className="group p-8 rounded-2xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all text-left"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Plus className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Create Room</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Start a new game and invite a friend with a unique room code
                </p>
                <span className="text-primary text-sm font-medium flex items-center gap-1">
                  Create <ArrowRight className="w-4 h-4" />
                </span>
              </button>

              <button
                onClick={() => setShowJoinRoom(true)}
                className="group p-8 rounded-2xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all text-left"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Users className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Join Room</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Enter a room code shared by a friend to join their game
                </p>
                <span className="text-primary text-sm font-medium flex items-center gap-1">
                  Join <ArrowRight className="w-4 h-4" />
                </span>
              </button>
            </motion.div>
          )}

          {/* Create Room Flow */}
          {showCreateRoom && !roomState && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-lg mx-auto"
            >
              <div className="rounded-2xl border border-border bg-card p-8">
                <h2 className="text-xl font-semibold mb-6">Create a Room</h2>
                
                {/* Time Control Selection */}
                <div className="mb-6">
                  <label className="text-sm font-medium mb-3 block">Time Control</label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {timeControls.map((tc) => (
                      <button
                        key={tc.id}
                        onClick={() => setSelectedTimeControl(tc.id)}
                        className={cn(
                          "p-3 rounded-xl border text-center transition-all",
                          selectedTimeControl === tc.id
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <div className="font-medium text-sm">{tc.label}</div>
                        <div className="text-xs text-muted-foreground">{tc.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => setShowCreateRoom(false)}
                  >
                    Back
                  </Button>
                  <Button
                    className="flex-1 rounded-xl bg-primary hover:bg-primary/90"
                    onClick={handleCreateRoom}
                    disabled={isConnecting}
                  >
                    {isConnecting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Create Room
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Join Room Flow */}
          {showJoinRoom && !roomState && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-lg mx-auto"
            >
              <div className="rounded-2xl border border-border bg-card p-8">
                <h2 className="text-xl font-semibold mb-6">Join a Room</h2>
                
                <div className="mb-6">
                  <label className="text-sm font-medium mb-2 block">Room Code</label>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="Enter 6-character code"
                    maxLength={6}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-center text-2xl font-mono tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => setShowJoinRoom(false)}
                  >
                    Back
                  </Button>
                  <Button
                    className="flex-1 rounded-xl bg-primary hover:bg-primary/90"
                    onClick={handleJoinRoom}
                    disabled={isConnecting || joinCode.length < 6}
                  >
                    {isConnecting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                        Joining...
                      </>
                    ) : (
                      <>
                        <Users className="w-4 h-4 mr-2" />
                        Join Room
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Waiting Room */}
          {roomState && roomState.status === "waiting" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-lg mx-auto"
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
                      {roomCode}
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

                {/* Or share link */}
                <Button
                  variant="outline"
                  className="rounded-xl w-full"
                  onClick={copyInviteLink}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Invite Link
                </Button>

                {/* Waiting animation */}
                <div className="mt-6 flex justify-center gap-1">
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
          )}

          {/* Other Play Modes */}
          {!showCreateRoom && !showJoinRoom && !roomState && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-12"
            >
              <h3 className="text-center text-muted-foreground mb-6">Or try other play modes</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
                {otherPlayModes.map((mode) => (
                  <Link
                    key={mode.id}
                    href={mode.href}
                    className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <mode.icon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{mode.title}</div>
                        <div className="text-xs text-muted-foreground">{mode.description}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  )
}
