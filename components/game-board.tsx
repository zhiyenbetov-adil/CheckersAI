"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Clock, 
  MessageSquare, 
  Flag, 
  RotateCcw, 
  Settings,
  ChevronLeft,
  Bot,
  Lightbulb,
  BarChart3,
  Send,
  X,
  Menu,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  createInitialGameState,
  selectPiece,
  deselectPiece,
  makeMove,
  checkGameOver,
  getMovablePieces,
  getCaptureMoves,
  type GameState,
  type Position,
  type Piece,
  type CaptureStep,
  type GameSettings,
  type PlayerColor
} from "@/lib/checkers"

interface GameBoardProps {
  mode?: "local" | "ai" | "online"
  aiLevel?: "beginner" | "easy" | "medium" | "hard" | "expert"
  settings?: Partial<GameSettings>
  roomId?: string
  onlinePlayerColor?: PlayerColor | null
  syncedGameState?: GameState | null
  onMove?: (move: Position, captureSteps: CaptureStep[], nextState: GameState) => void
}

interface StoredGameSummary {
  id: string
  mode: "local" | "ai" | "online"
  winner: GameState["winner"]
  finishedAt: number
  moveCount: number
  capturedPieces: GameState["capturedPieces"]
  moveHistory: GameState["moveHistory"]
}

type BoardTheme = "classic" | "emerald" | "pearl"
type CoachAnalysis = {
  strengths?: string[]
  improvements?: string[]
  recommendation?: string
  highlights?: string[]
}

export function GameBoard({ mode = "local", aiLevel = "medium", settings, onlinePlayerColor = null, syncedGameState, onMove }: GameBoardProps) {
  const [gameState, setGameState] = useState<GameState>(() => 
    createInitialGameState(settings)
  )
  const [captureStepsInProgress, setCaptureStepsInProgress] = useState<CaptureStep[]>([])
  const [lightTime, setLightTime] = useState(gameState.settings.timeControl || 600)
  const [darkTime, setDarkTime] = useState(gameState.settings.timeControl || 600)
  const [showChat, setShowChat] = useState(false)
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string }[]>([
    { sender: "system", text: "Game started. Good luck!" },
  ])
  const [newMessage, setNewMessage] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showGameOverModal, setShowGameOverModal] = useState(false)
  const [hasDismissedGameOverModal, setHasDismissedGameOverModal] = useState(false)
  const [hasPersistedResult, setHasPersistedResult] = useState(false)
  const [postGameAnalysis, setPostGameAnalysis] = useState<string | null>(null)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [coachAnalysis, setCoachAnalysis] = useState<CoachAnalysis | null>(null)
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false)
  const [aiThinking, setAiThinking] = useState(false)
  const [hasPremium, setHasPremium] = useState(false)
  const [subscriptionTier, setSubscriptionTier] = useState<"free" | "premium" | "pro">("free")
  const [boardTheme, setBoardTheme] = useState<BoardTheme>("classic")

  const themeStyles: Record<BoardTheme, {
    darkSquare: string
    lightSquare: string
    lightPiece: string
    darkPiece: string
    panel: string
  }> = {
    classic: {
      darkSquare: "bg-orange-600",
      lightSquare: "bg-orange-50",
      lightPiece: "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200",
      darkPiece: "bg-gradient-to-br from-stone-800 to-stone-900 border-stone-700",
      panel: "bg-background",
    },
    emerald: {
      darkSquare: "bg-emerald-700",
      lightSquare: "bg-emerald-100",
      lightPiece: "bg-gradient-to-br from-emerald-50 to-lime-100 border-emerald-300",
      darkPiece: "bg-gradient-to-br from-emerald-900 to-teal-950 border-emerald-700",
      panel: "bg-emerald-50/40",
    },
    pearl: {
      darkSquare: "bg-slate-700",
      lightSquare: "bg-zinc-100",
      lightPiece: "bg-gradient-to-br from-white to-slate-100 border-slate-300",
      darkPiece: "bg-gradient-to-br from-slate-800 to-zinc-900 border-slate-600",
      panel: "bg-slate-50/40",
    },
  }

  useEffect(() => {
    const raw = localStorage.getItem("checkers_auth_user")
    if (!raw) return
    try {
      const user = JSON.parse(raw) as { premiumUntil?: number | null; subscriptionTier?: "free" | "premium" | "pro" }
      setHasPremium(Boolean(user.premiumUntil && user.premiumUntil > Date.now()))
      setSubscriptionTier(user.subscriptionTier ?? (user.premiumUntil && user.premiumUntil > Date.now() ? "premium" : "free"))
    } catch {
      setHasPremium(false)
      setSubscriptionTier("free")
    }
  }, [])

  useEffect(() => {
    const canUseTheme =
      boardTheme === "classic" ||
      (boardTheme === "emerald" && (hasPremium || subscriptionTier === "premium" || subscriptionTier === "pro")) ||
      (boardTheme === "pearl" && subscriptionTier === "pro")
    if (!canUseTheme) {
      setBoardTheme("classic")
    }
  }, [hasPremium, boardTheme, subscriptionTier])

  const canUseEmerald = hasPremium || subscriptionTier === "premium" || subscriptionTier === "pro"
  const canUsePearl = subscriptionTier === "pro"
  const currentTheme =
    boardTheme === "classic"
      ? "classic"
      : boardTheme === "emerald"
        ? (canUseEmerald ? "emerald" : "classic")
        : (canUsePearl ? "pearl" : "classic")
  const styles = themeStyles[currentTheme]
  const premiumScore = useMemo(() => {
    const balance = gameState.capturedPieces.dark - gameState.capturedPieces.light
    return Math.max(0, 1000 + balance * 12 + gameState.moveHistory.length * 2)
  }, [gameState.capturedPieces.dark, gameState.capturedPieces.light, gameState.moveHistory.length])

  const boardPerspective: PlayerColor = mode === "online" && onlinePlayerColor === "dark" ? "dark" : "light"
  const topColor: PlayerColor = boardPerspective === "light" ? "dark" : "light"
  const bottomColor: PlayerColor = boardPerspective === "light" ? "light" : "dark"
  const isOnlinePlayerTurn =
    mode !== "online" || !onlinePlayerColor ? true : gameState.currentPlayer === onlinePlayerColor

  const bestMoveNotation = useMemo(() => {
    const captureMoves = gameState.moveHistory.filter((record) => record.move.isCapture)
    const bestCapture = [...captureMoves].sort((a, b) => {
      const aCaptures = a.move.captureSteps?.length ?? 1
      const bCaptures = b.move.captureSteps?.length ?? 1
      return bCaptures - aCaptures
    })[0]
    return bestCapture?.notation || gameState.moveHistory[0]?.notation || null
  }, [gameState.moveHistory])

  const persistFinishedGame = useCallback((state: GameState) => {
    if (typeof window === "undefined") return
    const rawUser = localStorage.getItem("checkers_auth_user")
    const authUser = rawUser ? (JSON.parse(rawUser) as { id?: string; email?: string; name?: string }) : null
    const ratingDelta = state.winner === "light" ? 12 : state.winner === "dark" ? -10 : 2
    const summary: StoredGameSummary = {
      id: `game_${Date.now()}`,
      mode,
      winner: state.winner,
      finishedAt: Date.now(),
      moveCount: state.moveHistory.length,
      capturedPieces: state.capturedPieces,
      moveHistory: state.moveHistory,
    }
    localStorage.setItem("checkers_last_game", JSON.stringify(summary))
    const historyRaw = localStorage.getItem("checkers_game_history")
    const history = historyRaw ? (JSON.parse(historyRaw) as StoredGameSummary[]) : []
    const nextHistory = [summary, ...history].slice(0, 20)
    localStorage.setItem("checkers_game_history", JSON.stringify(nextHistory))
    const totalGames = Number(localStorage.getItem("checkers_total_games") || "0")
    localStorage.setItem("checkers_total_games", String(totalGames + 1))
    void fetch("/api/log/client", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: authUser?.id ?? null,
        email: authUser?.email ?? null,
        action: "game.finished",
        details: {
          mode,
          winner: state.winner ?? "draw",
          moveCount: state.moveHistory.length,
          ratingDelta,
          opponent: mode === "ai" ? "AI" : mode === "local" ? "Local Player" : "Online Opponent",
        },
      }),
    })
  }, [mode])

  const isCaptureTarget = useCallback((piece: Piece, pieces: Piece[], to: Position) => {
    return getCaptureMoves(piece, pieces).some((c) => c.to.row === to.row && c.to.col === to.col)
  }, [])

  useEffect(() => {
    if (!syncedGameState) return
    setGameState(syncedGameState)
  }, [syncedGameState])

  // Timer
  useEffect(() => {
    if (gameState.gameStatus !== "playing" || gameState.settings.timeControl === 0) return
    
    const interval = setInterval(() => {
      if (gameState.currentPlayer === "light") {
        setLightTime((t) => Math.max(0, t - 1))
      } else {
        setDarkTime((t) => Math.max(0, t - 1))
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [gameState.currentPlayer, gameState.gameStatus, gameState.settings.timeControl])

  // Check for game over
  useEffect(() => {
    const { isOver, winner } = checkGameOver(gameState)
    if (isOver && gameState.gameStatus !== "finished") {
      setGameState(prev => ({
        ...prev,
        gameStatus: "finished",
        winner
      }))
      setShowGameOverModal(true)
      setHasDismissedGameOverModal(false)
      setShowDetailedAnalysis(false)
      setHasPersistedResult(false)
    }
  }, [gameState])

  useEffect(() => {
    if (gameState.gameStatus !== "finished") return
    if (showGameOverModal || hasDismissedGameOverModal) return
    setShowGameOverModal(true)
    setShowDetailedAnalysis(false)
  }, [gameState.gameStatus, hasDismissedGameOverModal, showGameOverModal])

  useEffect(() => {
    if (gameState.gameStatus !== "finished" || hasPersistedResult) return
    persistFinishedGame(gameState)
    setHasPersistedResult(true)
  }, [gameState, hasPersistedResult, persistFinishedGame])

  useEffect(() => {
    if (!showGameOverModal || showDetailedAnalysis) return
    const timer = setTimeout(() => {
      setShowDetailedAnalysis(true)
    }, 1400)
    return () => clearTimeout(timer)
  }, [showDetailedAnalysis, showGameOverModal])

  useEffect(() => {
    if (gameState.gameStatus !== "finished") return
    let cancelled = false
    const run = async () => {
      setAnalysisLoading(true)
      setPostGameAnalysis(null)
      setCoachAnalysis(null)
      try {
        const payload: StoredGameSummary = {
          id: `live_${Date.now()}`,
          mode,
          winner: gameState.winner,
          finishedAt: Date.now(),
          moveCount: gameState.moveHistory.length,
          capturedPieces: gameState.capturedPieces,
          moveHistory: gameState.moveHistory,
        }
        const response = await fetch("/api/coach/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ game: payload }),
        })
        if (!response.ok) throw new Error("analysis_failed")
        const data = await response.json()
        const recommendation = data?.analysis?.recommendation as string | undefined
        const improvements = Array.isArray(data?.analysis?.improvements)
          ? (data.analysis.improvements as string[])
          : []
        const strengths = Array.isArray(data?.analysis?.strengths)
          ? (data.analysis.strengths as string[])
          : []
        const highlights = Array.isArray(data?.analysis?.highlights)
          ? (data.analysis.highlights as string[])
          : []
        const lines = [recommendation, ...improvements.slice(0, 2)].filter(Boolean)
        if (!cancelled) {
          setPostGameAnalysis(lines.join(" "))
          setCoachAnalysis({ strengths, improvements, recommendation, highlights })
          setChatMessages((prev) => [
            ...prev,
            {
              sender: "system",
              text: recommendation ? `AI analysis ready: ${recommendation}` : "AI analysis is ready.",
            },
          ])
        }
      } catch {
        if (!cancelled) {
          setPostGameAnalysis("Post-game analysis is temporarily unavailable.")
          setCoachAnalysis(null)
        }
      } finally {
        if (!cancelled) setAnalysisLoading(false)
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [gameState.capturedPieces, gameState.gameStatus, gameState.moveHistory, gameState.winner, mode])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const pickMoveByDifficulty = useCallback((
    state: GameState,
    piece: Piece,
    options: Position[],
    level: "beginner" | "easy" | "medium" | "hard" | "expert"
  ): Position => {
    if (options.length === 1) return options[0]
    const scored = options.map((to) => {
      const isCapture = isCaptureTarget(piece, state.pieces, to)
      const promotes = !piece.isKing && piece.color === "dark" && to.row === 7
      const centerControl = 3.5 - Math.abs(3.5 - to.col)
      const advancement = to.row - piece.position.row
      const score = (isCapture ? 10 : 0) + (promotes ? 8 : 0) + centerControl + advancement
      return { to, score, isCapture }
    })

    if (level === "beginner") {
      return scored[Math.floor(Math.random() * scored.length)].to
    }

    if (level === "easy") {
      const captures = scored.filter((m) => m.isCapture)
      const pool = captures.length > 0 ? captures : scored
      return pool[Math.floor(Math.random() * pool.length)].to
    }

    const sorted = [...scored].sort((a, b) => b.score - a.score)
    if (level === "medium") return sorted[0].to
    if (level === "hard") return sorted[Math.floor(Math.random() * Math.min(2, sorted.length))].to
    return sorted[0].to
  }, [isCaptureTarget])

  const getMoveScore = useCallback((piece: Piece, to: Position) => {
    const isCapture = isCaptureTarget(piece, gameState.pieces, to)
    const promotes = !piece.isKing && piece.color === "dark" && to.row === 7
    const centerControl = 3.5 - Math.abs(3.5 - to.col)
    const advancement = to.row - piece.position.row
    return (isCapture ? 10 : 0) + (promotes ? 8 : 0) + centerControl + advancement
  }, [gameState.pieces, isCaptureTarget])

  const performAiTurn = useCallback((state: GameState): GameState => {
    let nextState = state
    let carrySteps: CaptureStep[] = []
    let guard = 12

    while (nextState.currentPlayer === "dark" && nextState.gameStatus === "playing" && guard > 0) {
      guard -= 1

      if (!nextState.selectedPiece) {
        const pieces = getMovablePieces(nextState).filter((p) => p.color === "dark")
        if (pieces.length === 0) break
        const candidates = pieces.flatMap((piece) => {
          const selectedState = selectPiece(nextState, piece.id)
          return selectedState.validMoves.map((to) => ({
            piece,
            to,
            selectedState,
            score: getMoveScore(piece, to),
            isCapture: isCaptureTarget(piece, selectedState.pieces, to),
          }))
        })
        if (candidates.length === 0) break

        let chosen = candidates[0]
        if (aiLevel === "beginner") {
          chosen = candidates[Math.floor(Math.random() * candidates.length)]
        } else if (aiLevel === "easy") {
          const captures = candidates.filter((c) => c.isCapture)
          const pool = captures.length ? captures : candidates
          chosen = pool[Math.floor(Math.random() * pool.length)]
        } else if (aiLevel === "medium") {
          chosen = [...candidates].sort((a, b) => b.score - a.score)[0]
        } else if (aiLevel === "hard") {
          const sorted = [...candidates].sort((a, b) => b.score - a.score)
          chosen = sorted[Math.floor(Math.random() * Math.min(2, sorted.length))]
        } else {
          chosen = [...candidates].sort((a, b) => b.score - a.score)[0]
        }

        const selected = chosen.selectedState
        if (!selected.selectedPiece || selected.validMoves.length === 0) break
        const target = chosen.to
        const isCapture = isCaptureTarget(selected.selectedPiece, selected.pieces, target)
        let currentStep: CaptureStep | null = null
        if (isCapture) {
          const capture = getCaptureMoves(selected.selectedPiece, selected.pieces).find(
            (c) => c.to.row === target.row && c.to.col === target.col
          )
          if (capture) {
            currentStep = { from: selected.selectedPiece.position, to: capture.to, captured: capture.captured }
          }
        }

        const { newState, move } = makeMove(selected, target, carrySteps)
        if (currentStep) carrySteps = [...carrySteps, currentStep]
        nextState = newState
        if (move) {
          carrySteps = []
          break
        }
        continue
      }

      if (nextState.validMoves.length === 0) break
      const selectedPiece = nextState.selectedPiece
      if (!selectedPiece) break
      const target = pickMoveByDifficulty(nextState, selectedPiece, nextState.validMoves, aiLevel)
      const isCapture = isCaptureTarget(selectedPiece, nextState.pieces, target)
      let currentStep: CaptureStep | null = null
      if (isCapture) {
        const capture = getCaptureMoves(selectedPiece, nextState.pieces).find(
          (c) => c.to.row === target.row && c.to.col === target.col
        )
        if (capture) {
          currentStep = { from: selectedPiece.position, to: capture.to, captured: capture.captured }
        }
      }

      const { newState, move } = makeMove(nextState, target, carrySteps)
      if (currentStep) carrySteps = [...carrySteps, currentStep]
      nextState = newState
      if (move) {
        carrySteps = []
        break
      }
    }

    return nextState
  }, [aiLevel, getMoveScore, isCaptureTarget, pickMoveByDifficulty])

  useEffect(() => {
    if (mode !== "ai") return
    if (gameState.gameStatus !== "playing") return
    if (gameState.currentPlayer !== "dark") return

    setAiThinking(true)
    const timer = setTimeout(() => {
      setGameState((prev) => performAiTurn(prev))
      setCaptureStepsInProgress([])
      setAiThinking(false)
    }, 450)

    return () => clearTimeout(timer)
  }, [gameState.currentPlayer, gameState.gameStatus, mode, performAiTurn])

  // Get pieces that can currently move
  const movablePieces = useMemo(() => getMovablePieces(gameState), [gameState])
  
  // Check if piece can be selected
  const canSelectPiece = useCallback((piece: Piece) => {
    if (gameState.gameStatus !== "playing") return false
    if (piece.color !== gameState.currentPlayer) return false
    if (mode === "online" && onlinePlayerColor && piece.color !== onlinePlayerColor) return false
    if (gameState.multiCaptureInProgress && piece.id !== gameState.activePieceId) return false
    return movablePieces.some(p => p.id === piece.id)
  }, [gameState, mode, movablePieces, onlinePlayerColor])

  const handleSquareClick = useCallback((row: number, col: number) => {
    if (gameState.gameStatus !== "playing") return
    if (mode === "ai" && gameState.currentPlayer === "dark") return
    if (mode === "online" && !isOnlinePlayerTurn) return
    
    const clickedPiece = gameState.pieces.find(
      (p) => p.position.row === row && p.position.col === col
    )
    const targetPos: Position = { row, col }

    if (gameState.selectedPiece) {
      const isValidMove = gameState.validMoves.some(
        (m) => m.row === row && m.col === col
      )

      if (isValidMove) {
        // Check if this is a capture move
        const isCapture = isCaptureTarget(gameState.selectedPiece, gameState.pieces, targetPos)
        
        if (isCapture) {
          // Execute capture step
          const captures = getCaptureMoves(gameState.selectedPiece, gameState.pieces)
          const capture = captures.find(c => c.to.row === row && c.to.col === col)
          
          if (capture) {
            const captureStep: CaptureStep = {
              from: gameState.selectedPiece.position,
              to: capture.to,
              captured: capture.captured
            }
            
            const newCaptureSteps = [...captureStepsInProgress, captureStep]
            
            const { newState, move } = makeMove(gameState, targetPos, captureStepsInProgress)
            setGameState(newState)
            
            if (move) {
              // Move complete
              setCaptureStepsInProgress([])
              onMove?.(targetPos, newCaptureSteps, newState)
            } else if (newState.multiCaptureInProgress) {
              // Multi-capture continues
              setCaptureStepsInProgress(newCaptureSteps)
            }
          }
        } else {
          // Regular move
          const { newState, move } = makeMove(gameState, targetPos)
          setGameState(newState)
          if (move) {
            onMove?.(targetPos, [], newState)
          }
        }
      } else if (clickedPiece && canSelectPiece(clickedPiece)) {
        // Select different piece (only if not in multi-capture)
        if (!gameState.multiCaptureInProgress) {
          setGameState(selectPiece(gameState, clickedPiece.id))
        }
      } else if (!gameState.multiCaptureInProgress) {
        // Deselect
        setGameState(deselectPiece(gameState))
      }
    } else if (clickedPiece && canSelectPiece(clickedPiece)) {
      setGameState(selectPiece(gameState, clickedPiece.id))
    }
  }, [gameState, captureStepsInProgress, canSelectPiece, isCaptureTarget, isOnlinePlayerTurn, mode, onMove])

  const sendMessage = () => {
    const message = newMessage.trim()
    if (!message) return
    setChatMessages((prev) => [...prev, { sender: "you", text: message }])
    setNewMessage("")

    if (mode !== "ai") return
    const aiReplies = [
      "Do not waste too much energy. I am still winning this.",
      "You are trying, I respect that. But this board is mine.",
      "Bold move. I will punish that if you leave one diagonal weak.",
      "Good idea, but you gave me counterplay. That is exactly what I wanted.",
      "Keep pushing. I am still in control.",
      "Do not overthink it. You are still not at my level.",
      "You can try, but I already see the next trap.",
      "I like your confidence. It will not save this position.",
    ]
    const lower = message.toLowerCase()
    let reply = aiReplies[Math.floor(Math.random() * aiReplies.length)]
    const isQuestion = message.includes("?") || /^(how|what|why|which|where|can|should)\b/i.test(lower)
    if (isQuestion) {
      const tips = [
        "1. First check all forced captures.",
        "2. Keep control of long diagonals before trading.",
        "3. In the endgame, activate kings instead of defending passively.",
      ]
      if (lower.includes("best move") || lower.includes("hint")) {
        reply = [
          "Best practical plan:",
          `1. Best recorded move so far: ${bestMoveNotation || "not enough moves yet"}.`,
          "2. Look for forcing captures before quiet moves.",
          "3. Trade only when it improves your king race.",
        ].join("\n")
      } else if (lower.includes("analysis")) {
        reply = postGameAnalysis || "I’ll provide full analysis as soon as the game finishes."
      } else {
        reply = ["Structured answer:", ...tips].join("\n")
      }
    } else if (lower.includes("analysis")) {
      reply = postGameAnalysis || "I’ll provide full analysis as soon as the game finishes."
    } else if (lower.includes("gg")) {
      reply = "GG. Finish strong and we’ll review your critical mistakes."
    }
    setTimeout(() => {
      setChatMessages((prev) => [...prev, { sender: "opponent", text: reply }])
    }, 450)
  }

  const handleNewGame = () => {
    setGameState(createInitialGameState(settings))
    setCaptureStepsInProgress([])
    setLightTime(gameState.settings.timeControl || 600)
    setDarkTime(gameState.settings.timeControl || 600)
    setPostGameAnalysis(null)
    setAnalysisLoading(false)
    setCoachAnalysis(null)
    setShowDetailedAnalysis(false)
    setShowGameOverModal(false)
    setHasDismissedGameOverModal(false)
    setHasPersistedResult(false)
    setChatMessages([{ sender: "system", text: "New game started. Good luck!" }])
  }

  const handleResign = () => {
    if (gameState.gameStatus !== "playing") return
    const winner = gameState.currentPlayer === "light" ? "dark" : "light"
    setGameState((prev) => ({
      ...prev,
      gameStatus: "finished",
      winner,
    }))
    setShowGameOverModal(true)
    setHasDismissedGameOverModal(false)
    setHasPersistedResult(false)
  }

  const handleDraw = () => {
    if (gameState.gameStatus !== "playing") return
    setGameState((prev) => ({
      ...prev,
      gameStatus: "finished",
      winner: "draw",
    }))
    setShowGameOverModal(true)
    setHasDismissedGameOverModal(false)
    setHasPersistedResult(false)
  }

  return (
    <div className={cn("min-h-screen bg-background", styles.panel)}>
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <span className="font-semibold">Game</span>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row lg:h-screen">
        {/* Left Sidebar - Analysis (Desktop) */}
        <div className="hidden lg:flex w-80 border-r border-border flex-col">
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              <span className="font-semibold">AI Analysis</span>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-4">
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Best Move</span>
              </div>
              <p className="text-sm text-muted-foreground">Analyzing...</p>
              <p className="text-xs text-muted-foreground mt-1">
                {analysisLoading
                  ? "Running post-game analysis..."
                  : coachAnalysis?.recommendation || "Finish the game to get AI verdict."}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Evaluation</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-300" 
                  style={{ 
                    width: `${50 + (gameState.capturedPieces.dark - gameState.capturedPieces.light) * 4}%` 
                  }}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                <span>Light: {12 - gameState.capturedPieces.light} pieces</span>
                <span>Dark: {12 - gameState.capturedPieces.dark} pieces</span>
              </div>
            </div>
            
            {/* Game Settings Display */}
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Game Rules</span>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>Forced capture: {gameState.settings.forcedCapture ? "Yes" : "No"}</p>
                <p>Manual stop: {gameState.settings.allowManualStop ? "Allowed" : "Not allowed"}</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Bot className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Game Analysis</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {coachAnalysis?.improvements?.[0] || "No analysis yet. It appears automatically after game over."}
              </p>
            </div>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="flex-1 flex flex-col">
          {/* Multi-capture message */}
          <AnimatePresence>
            {gameState.multiCaptureInProgress && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mx-4 mt-2 p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-2"
              >
                <AlertCircle className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-primary">
                  Continue capture! Click on the next valid square.
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Top Player Info */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-full border-2", styles.darkPiece)} />
                <div>
                  <div className="font-medium">Opponent</div>
                  <div className="text-sm text-muted-foreground">
                    {mode === "ai"
                      ? `${aiLevel[0].toUpperCase()}${aiLevel.slice(1)} AI`
                      : topColor === "light"
                        ? "Light"
                        : "Dark"}
                  </div>
                  {mode === "ai" && aiThinking && <div className="text-xs text-primary">Thinking...</div>}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {Array.from({ length: gameState.capturedPieces[topColor] }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-4 h-4 rounded-full border",
                        topColor === "light" ? "bg-amber-100 border-amber-200" : "bg-stone-800 border-stone-700"
                      )}
                    />
                  ))}
                </div>
                <div className={cn(
                  "px-3 py-1.5 rounded-lg font-mono text-lg",
                  gameState.currentPlayer === topColor ? "bg-primary text-primary-foreground" : "bg-muted"
                )}>
                  <Clock className="w-4 h-4 inline mr-1" />
                  {formatTime(topColor === "light" ? lightTime : darkTime)}
                </div>
              </div>
            </div>
            {hasPremium && (
              <div className="mt-3 flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-sm">
                <span className="font-medium">Premium scoreboard</span>
                <span className="font-mono text-primary">{premiumScore} pts</span>
              </div>
            )}
          </div>

          {/* Board Container */}
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
              <div className="relative rounded-xl overflow-hidden shadow-2xl border border-border">
                <div className="grid grid-cols-8 aspect-square">
                  {Array.from({ length: 64 }).map((_, index) => {
                    const displayRow = Math.floor(index / 8)
                    const displayCol = index % 8
                    const row = boardPerspective === "light" ? displayRow : 7 - displayRow
                    const col = boardPerspective === "light" ? displayCol : 7 - displayCol
                    const isDark = (row + col) % 2 === 1
                    const piece = gameState.pieces.find(
                      (p) => p.position.row === row && p.position.col === col
                    )
                    const isSelected = 
                      gameState.selectedPiece?.position.row === row && 
                      gameState.selectedPiece?.position.col === col
                    const isValidMove = gameState.validMoves.some(
                      (m) => m.row === row && m.col === col
                    )
                    const isActivePiece = gameState.multiCaptureInProgress && 
                      gameState.activePieceId === piece?.id
                    const canMove = piece && canSelectPiece(piece)

                    return (
                      <button
                        key={index}
                        onClick={() => handleSquareClick(row, col)}
                        disabled={
                          gameState.gameStatus !== "playing" ||
                          (mode === "ai" && gameState.currentPlayer === "dark") ||
                          (mode === "online" && !isOnlinePlayerTurn)
                        }
                        className={cn(
                          "aspect-square relative transition-all",
                          isDark ? styles.darkSquare : styles.lightSquare,
                          isSelected && "ring-2 ring-primary ring-inset",
                          isActivePiece && "ring-2 ring-yellow-400 ring-inset animate-pulse",
                          isValidMove && "cursor-pointer"
                        )}
                      >
                        {/* Valid move indicator */}
                        {isValidMove && (
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute inset-0 flex items-center justify-center z-10"
                          >
                            <div className="w-1/3 h-1/3 rounded-full bg-primary/50 shadow-lg" />
                          </motion.div>
                        )}

                        {/* Piece */}
                        {piece && (
                          <div
                            key={`${piece.id}-${piece.position.row}-${piece.position.col}`}
                            className="absolute inset-1.5 sm:inset-2"
                          >
                            <div
                              className={cn(
                                "w-full h-full rounded-full border-2 shadow-lg transition-all",
                                piece.color === "light"
                                  ? styles.lightPiece
                                  : styles.darkPiece,
                                isSelected && "ring-2 ring-primary ring-offset-2",
                                isActivePiece && "ring-2 ring-yellow-400 ring-offset-2",
                                canMove && !isSelected && "cursor-pointer hover:scale-105"
                              )}
                            >
                              <div className="absolute top-0.5 left-0.5 w-1/3 h-1/3 bg-white/30 rounded-full blur-sm" />
                              {piece.isKing && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-yellow-400 text-xs sm:text-sm font-bold drop-shadow">
                                    ♔
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Player Info */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-full border-2", styles.lightPiece)} />
                <div>
                  <div className="font-medium">You</div>
                  <div className="text-sm text-muted-foreground">{bottomColor === "light" ? "Light" : "Dark"}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {Array.from({ length: gameState.capturedPieces[bottomColor] }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-4 h-4 rounded-full border",
                        bottomColor === "light" ? "bg-amber-100 border-amber-200" : "bg-stone-800 border-stone-700"
                      )}
                    />
                  ))}
                </div>
                <div className={cn(
                  "px-3 py-1.5 rounded-lg font-mono text-lg",
                  gameState.currentPlayer === bottomColor ? "bg-primary text-primary-foreground" : "bg-muted"
                )}>
                  <Clock className="w-4 h-4 inline mr-1" />
                  {formatTime(bottomColor === "light" ? lightTime : darkTime)}
                </div>
              </div>
            </div>
            {hasPremium && (
              <div className="mt-3 flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-sm">
                <span className="font-medium">Style active</span>
                <span className="font-semibold capitalize text-primary">{currentTheme}</span>
              </div>
            )}
          </div>

          {/* Game Controls */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" className="rounded-lg" onClick={handleResign}>
                <Flag className="w-4 h-4 mr-1" />
                Resign
              </Button>
              <Button variant="outline" size="sm" className="rounded-lg" onClick={handleDraw}>
                <RotateCcw className="w-4 h-4 mr-1" />
                Draw
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-lg lg:hidden" 
                onClick={() => setShowChat(!showChat)}
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                Chat
              </Button>
              <Button variant="outline" size="sm" className="rounded-lg" onClick={handleNewGame}>
                <Settings className="w-4 h-4" />
              </Button>
            </div>
            <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">Board style:</span>
              {(["classic", "emerald", "pearl"] as const).map((theme) => (
                (() => {
                  const isLocked = theme === "emerald" ? !canUseEmerald : theme === "pearl" ? !canUsePearl : false
                  const lockLabel = theme === "emerald" ? "PREMIUM" : theme === "pearl" ? "PRO" : ""
                  return (
                <Button
                  key={theme}
                  size="sm"
                  variant={currentTheme === theme ? "default" : "outline"}
                  className="h-8 rounded-lg capitalize"
                  disabled={isLocked}
                  onClick={() => setBoardTheme(theme)}
                  title={isLocked ? `${lockLabel} required` : undefined}
                >
                  {theme}
                  {isLocked && <span className="ml-1 text-[10px]">{lockLabel}</span>}
                </Button>
                  )
                })()
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Move History & Chat (Desktop) */}
        <div className="hidden lg:flex w-80 border-l border-border flex-col">
          {/* Move History */}
          <div className="flex-1 border-b border-border overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border">
              <span className="font-semibold">Move History</span>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <div className="space-y-1">
                {gameState.moveHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No moves yet</p>
                ) : (
                  gameState.moveHistory.map((record, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-2 py-1 rounded hover:bg-muted text-sm"
                    >
                      <span className="w-6 text-muted-foreground">{index + 1}.</span>
                      <span className={cn(
                        "font-mono",
                        record.move.isCapture && "text-primary font-semibold"
                      )}>
                        {record.notation}
                      </span>
                      {record.move.captureSteps && record.move.captureSteps.length > 1 && (
                        <span className="text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                          x{record.move.captureSteps.length}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Chat */}
          <div className="h-72 flex flex-col">
            <div className="p-4 border-b border-border">
              <span className="font-semibold">Chat</span>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-2">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={cn(
                    "text-sm p-2 rounded-lg whitespace-pre-line",
                    msg.sender === "you" 
                      ? "bg-primary text-primary-foreground ml-4" 
                      : msg.sender === "system"
                        ? "bg-muted text-muted-foreground text-center text-xs"
                        : "bg-muted mr-4 border border-primary/20"
                  )}
                >
                  {msg.text}
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-border flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 rounded-lg bg-muted text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Button size="icon" onClick={sendMessage}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Chat Panel */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="fixed inset-x-0 bottom-0 h-1/2 bg-background border-t border-border lg:hidden z-50"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="font-semibold">Chat</span>
              <Button variant="ghost" size="icon" onClick={() => setShowChat(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-2 h-[calc(100%-8rem)]">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={cn(
                    "text-sm p-2 rounded-lg whitespace-pre-line",
                    msg.sender === "you" 
                      ? "bg-primary text-primary-foreground ml-4" 
                      : msg.sender === "system"
                        ? "bg-muted text-muted-foreground text-center text-xs"
                        : "bg-muted mr-4 border border-primary/20"
                  )}
                >
                  {msg.text}
                </div>
              ))}
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-background flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 rounded-lg bg-muted text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Button size="icon" onClick={sendMessage}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over Modal */}
      <AnimatePresence>
        {showGameOverModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-2xl p-8 max-w-md w-full shadow-2xl text-center"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">
                  {gameState.winner === "light" ? "🏆" : gameState.winner === "dark" ? "💀" : "🤝"}
                </span>
              </div>
              <h2 className="text-2xl font-bold mb-2">
                {gameState.winner === "light" 
                  ? "You Win!" 
                  : gameState.winner === "dark" 
                    ? "You Lose" 
                    : "Draw"}
              </h2>
              <p className="text-muted-foreground mb-6">
                {gameState.winner 
                  ? `${gameState.winner === "light" ? "Light" : "Dark"} pieces won the game!`
                  : "The game ended in a draw."}
              </p>
              {!showDetailedAnalysis ? (
                <div className="mb-6 rounded-xl border border-border bg-muted/50 p-3 text-left">
                  <p className="text-sm text-foreground">
                    {gameState.winner === "light"
                      ? "Congratulations! You won this game."
                      : gameState.winner === "dark"
                        ? "You lost this one. Let’s review it and bounce back stronger."
                        : "Draw game. A few precise improvements can convert this into a win next time."}
                  </p>
                </div>
              ) : (
                <div className="mb-6 rounded-xl border border-border bg-muted/50 p-3 text-left space-y-2">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    AI Coach Verdict
                  </p>
                  <p className="text-sm text-foreground">
                    {analysisLoading ? "Analyzing your game..." : coachAnalysis?.recommendation || postGameAnalysis || "No analysis yet."}
                  </p>
                  <p className="text-sm text-foreground">
                    Best move: {bestMoveNotation || "No completed move was recorded."}
                  </p>
                  {coachAnalysis?.highlights?.[0] && (
                    <p className="text-sm text-foreground">
                      Key moment: {coachAnalysis.highlights[0]}
                    </p>
                  )}
                  {(coachAnalysis?.improvements?.length
                    ? coachAnalysis.improvements.slice(0, 2)
                    : ["Practice endgame conversion with kings.", "Before every quiet move, scan for double-capture threats."]
                  ).map((item, idx) => (
                    <p key={idx} className="text-sm text-foreground">
                      • {item}
                    </p>
                  ))}
                </div>
              )}
              <div className="flex gap-3 justify-center">
                {!showDetailedAnalysis ? (
                  <Button variant="outline" className="rounded-xl" onClick={() => setShowDetailedAnalysis(true)}>
                    Show Analysis
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => {
                      setHasDismissedGameOverModal(true)
                      setShowGameOverModal(false)
                    }}
                  >
                    Review Game
                  </Button>
                )}
                <Button className="rounded-xl bg-primary hover:bg-primary/90" onClick={handleNewGame}>
                  New Game
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
