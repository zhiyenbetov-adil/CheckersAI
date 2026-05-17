"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Bot,
  Brain,
  CheckCircle,
  ChevronRight,
  Crown,
  Lock,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface StoredGameSummary {
  id: string
  mode: "local" | "ai" | "online"
  winner: "light" | "dark" | "draw" | null
  finishedAt: number
  moveCount: number
  capturedPieces: { light: number; dark: number }
  moveHistory: Array<{ notation: string; move: { isCapture: boolean } }>
}

interface CoachAnalysis {
  strengths: string[]
  improvements: string[]
  recommendation: string
  highlights: string[]
  meta?: {
    moveCount?: number
    captures?: number
    captureRate?: number
    result?: string
  }
}

const FREE_ANALYSES_LIMIT = 3

export default function AICoachPage() {
  const [lastGame, setLastGame] = useState<StoredGameSummary | null>(null)
  const [analysis, setAnalysis] = useState<CoachAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [analysesUsed, setAnalysesUsed] = useState(0)
  const [showPaywall, setShowPaywall] = useState(false)
  const [watchedLessons, setWatchedLessons] = useState<number[]>([])
  const [totalGames, setTotalGames] = useState(0)
  const [analyzedGameIds, setAnalyzedGameIds] = useState<string[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [isPremiumUser, setIsPremiumUser] = useState(false)

  useEffect(() => {
    const gameRaw = localStorage.getItem("checkers_last_game")
    if (gameRaw) {
      try {
        setLastGame(JSON.parse(gameRaw))
      } catch {
        setLastGame(null)
      }
    }

    const used = Number(localStorage.getItem("checkers_ai_analyses_used") || "0")
    setAnalysesUsed(used)

    const watchedRaw = localStorage.getItem("checkers_watched_lessons")
    if (watchedRaw) {
      try {
        setWatchedLessons(JSON.parse(watchedRaw))
      } catch {
        setWatchedLessons([])
      }
    }

    setTotalGames(Number(localStorage.getItem("checkers_total_games") || "0"))

    const analyzedRaw = localStorage.getItem("checkers_ai_analyzed_game_ids")
    if (analyzedRaw) {
      try {
        const parsed = JSON.parse(analyzedRaw) as string[]
        setAnalyzedGameIds(Array.isArray(parsed) ? parsed : [])
      } catch {
        setAnalyzedGameIds([])
      }
    }
    const userRaw = localStorage.getItem("checkers_auth_user")
    if (userRaw) {
      try {
        const user = JSON.parse(userRaw) as {
          premiumUntil?: number | null
          subscriptionTier?: "free" | "premium" | "pro"
        }
        const hasPremiumWindow = Boolean(user.premiumUntil && user.premiumUntil > Date.now())
        const hasTier = user.subscriptionTier === "premium" || user.subscriptionTier === "pro"
        setIsPremiumUser(hasPremiumWindow || hasTier)
      } catch {}
    }
    setHydrated(true)
  }, [])

  const freeAnalysesLeft = isPremiumUser ? Infinity : Math.max(0, FREE_ANALYSES_LIMIT - analysesUsed)
  const progressPercent = useMemo(() => {
    const lessonsScore = Math.min(100, watchedLessons.length * 25)
    const gamesScore = Math.min(100, totalGames * 8)
    return Math.round((lessonsScore * 0.6 + gamesScore * 0.4))
  }, [watchedLessons.length, totalGames])

  const trainingModules = [
    { id: 1, title: "Foundations", completed: Math.min(4, watchedLessons.length), total: 4, icon: Brain, locked: false },
    { id: 2, title: "Practical Tactics", completed: totalGames >= 2 ? 2 : 1, total: 3, icon: Target, locked: false },
    { id: 3, title: "Game Review", completed: analysesUsed >= 1 ? 1 : 0, total: 2, icon: TrendingUp, locked: false },
    { id: 4, title: "Advanced AI Drills", completed: isPremiumUser ? 1 : 0, total: 5, icon: isPremiumUser ? Brain : Lock, locked: !isPremiumUser },
  ]

  const runAnalysis = async (game: StoredGameSummary, countAsUsage: boolean) => {
    setLoading(true)
    try {
      const response = await fetch("/api/coach/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game }),
      })
      const data = await response.json()
      if (data?.analysis) {
        setAnalysis(data.analysis as CoachAnalysis)
      }

      if (countAsUsage && !isPremiumUser) {
        const nextUsed = analysesUsed + 1
        setAnalysesUsed(nextUsed)
        localStorage.setItem("checkers_ai_analyses_used", String(nextUsed))

        const nextIds = [...analyzedGameIds, game.id]
        setAnalyzedGameIds(nextIds)
        localStorage.setItem("checkers_ai_analyzed_game_ids", JSON.stringify(nextIds))

        if (nextUsed >= FREE_ANALYSES_LIMIT) setShowPaywall(true)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!hydrated) return
    if (!lastGame) return
    if (!isPremiumUser && analysesUsed >= FREE_ANALYSES_LIMIT) return
    if (analyzedGameIds.includes(lastGame.id)) return
    runAnalysis(lastGame, true)
  }, [hydrated, lastGame, analysesUsed, analyzedGameIds, isPremiumUser])

  const handleAnalyzeLastGame = async () => {
    if (!lastGame) return
    if (!isPremiumUser && analysesUsed >= FREE_ANALYSES_LIMIT) {
      setShowPaywall(true)
      return
    }
    await runAnalysis(lastGame, true)
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Bot className="h-4 w-4" />
              AI-Powered Coach
            </div>
            <h1 className="mb-3 text-3xl font-bold sm:text-4xl">Your Checkers Training Center</h1>
            <p className="mb-8 text-muted-foreground">
              Real progress, real game reviews, and practical recommendations after each finished match.
            </p>

            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold">Training Progress</h2>
                <span className="text-2xl font-bold text-primary">{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
              <p className="mt-3 text-sm text-muted-foreground">
                Lessons watched: {watchedLessons.length} · Games completed: {totalGames} · Free analyses left: {Number.isFinite(freeAnalysesLeft) ? freeAnalysesLeft : "Unlimited"}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="pb-12">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="mb-3 text-xl font-semibold">Latest Game Analysis</h3>
            {!lastGame && (
              <p className="mb-4 text-sm text-muted-foreground">
                No finished games found yet. Play a game first, then come back for AI analysis.
              </p>
            )}
            {lastGame && (
              <div className="mb-4 rounded-xl bg-muted/40 p-4 text-sm text-muted-foreground">
                Last game: {new Date(lastGame.finishedAt).toLocaleString()} · Moves: {lastGame.moveCount} · Result:{" "}
                {lastGame.winner ?? "n/a"}
              </div>
            )}
            <Button
              className="mb-5 rounded-xl bg-primary"
              onClick={handleAnalyzeLastGame}
              disabled={!lastGame || loading}
            >
              {loading ? "Analyzing..." : "Analyze Last Game"}
            </Button>

            {analysis && (
              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 font-medium">Strengths</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {analysis.strengths?.map((s, i) => (
                      <li key={i} className="flex gap-2">
                        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="mb-2 font-medium">Improvements</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {analysis.improvements?.map((s, i) => (
                      <li key={i} className="flex gap-2">
                        <Target className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
                  <div className="mb-1 flex items-center gap-2 font-medium">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Recommendation
                  </div>
                  <p className="text-muted-foreground">{analysis.recommendation}</p>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="mb-4 text-xl font-semibold">Training Modules</h3>
            <div className="space-y-4">
              {trainingModules.map((module) => (
                <div
                  key={module.id}
                  className={cn(
                    "rounded-xl border p-4",
                    module.locked ? "border-border bg-muted/30 opacity-75" : "border-border bg-card"
                  )}
                >
                  <div className="mb-2 flex items-center gap-2 font-medium">
                    <module.icon className={cn("h-4 w-4", module.locked ? "text-muted-foreground" : "text-primary")} />
                    <span>{module.title}</span>
                    {module.locked && (
                      <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                        <Crown className="h-3 w-3" />
                        Premium
                      </span>
                    )}
                  </div>
                  <div className="mb-2 flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>
                      {module.completed}/{module.total}
                    </span>
                  </div>
                  <Progress value={(module.completed / module.total) * 100} className="h-1.5" />
                </div>
              ))}
            </div>
            <div className="mt-6 flex gap-3">
              <Link href="/learn">
                <Button variant="outline" className="rounded-xl">
                  Continue Lessons
                </Button>
              </Link>
              <Link href="/play">
                <Button className="rounded-xl bg-primary">
                  Play and Improve
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {showPaywall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowPaywall(false)} />
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-2xl">
            <div className="mb-4 text-center">
              <Crown className="mx-auto mb-3 h-10 w-10 text-primary" />
              <h3 className="text-2xl font-bold">Free Analyses Limit Reached</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                You used {FREE_ANALYSES_LIMIT} free game analyses. Upgrade to Premium for unlimited AI coach reviews.
              </p>
            </div>
            <div className="space-y-3">
              <Link href="/premium" onClick={() => setShowPaywall(false)}>
                <Button className="h-11 w-full rounded-xl bg-primary">Upgrade to Premium</Button>
              </Link>
              <Button variant="ghost" className="h-11 w-full rounded-xl" onClick={() => setShowPaywall(false)}>
                Maybe Later
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
