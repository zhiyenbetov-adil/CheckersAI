"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Crown, TrendingUp, Calendar, Trophy, Target, Flame, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

type ProfileResponse = {
  user: {
    id: string
    name: string
    email: string
    joinedAt: number
    subscriptionTier: "free" | "premium" | "pro"
    premiumActive: boolean
    elo: number
  }
  stats: {
    totalGames: number
    wins: number
    losses: number
    draws: number
    winRate: number
    currentStreak: number
  }
  games: Array<{
    id: string
    result: "win" | "loss" | "draw"
    ratingDelta: number
    moveCount: number
    opponent: string
    timestamp: number
  }>
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"overview" | "games" | "achievements">("overview")
  const [data, setData] = useState<ProfileResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const raw = localStorage.getItem("checkers_auth_user")
        if (!raw) {
          setLoading(false)
          return
        }
        const user = JSON.parse(raw) as { id?: string; email?: string; name?: string }
        const query = user.id ? `userId=${encodeURIComponent(user.id)}` : `email=${encodeURIComponent(user.email || "")}`
        const res = await fetch(`/api/profile/summary?${query}`)
        if (!res.ok) throw new Error("profile_fetch_failed")
        const payload = (await res.json()) as ProfileResponse
        setData(payload)
        localStorage.setItem("checkers_auth_user", JSON.stringify({
          ...user,
          id: payload.user.id,
          email: payload.user.email,
          name: payload.user.name,
          subscriptionTier: payload.user.subscriptionTier,
          premiumUntil: payload.user.premiumActive ? Date.now() + 24 * 60 * 60 * 1000 : null,
        }))
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const stats = useMemo(() => {
    if (!data) return null
    return [
      { label: "Total Games", value: String(data.stats.totalGames), icon: Trophy },
      { label: "Win Rate", value: `${data.stats.winRate.toFixed(1)}%`, icon: Target },
      { label: "Current Streak", value: String(data.stats.currentStreak), icon: Flame },
      { label: "ELO", value: String(data.user.elo), icon: Clock },
    ]
  }, [data])

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-28 text-center text-muted-foreground">Loading profile...</div>
      </main>
    )
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-28 max-w-2xl mx-auto text-center px-4">
          <h1 className="text-2xl font-semibold mb-3">Profile is unavailable</h1>
          <p className="text-muted-foreground mb-6">Please sign in first to view real profile data.</p>
          <Link href="/login">
            <Button>Go to Login</Button>
          </Link>
        </div>
      </main>
    )
  }

  const initials = data.user.name
    .split(" ")
    .map((p) => p[0]?.toUpperCase())
    .join("")
    .slice(0, 2)

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-24 pb-8 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-4xl font-bold text-primary">
                {initials || "U"}
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-background" />
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold">{data.user.name}</h1>
                {(data.user.subscriptionTier === "premium" || data.user.subscriptionTier === "pro") && (
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center gap-1">
                    <Crown className="w-4 h-4" />
                    {data.user.subscriptionTier === "pro" ? "Pro" : "Premium"}
                  </span>
                )}
              </div>
              <p className="text-muted-foreground mb-4">{data.user.email}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="font-semibold">{data.user.elo}</span>
                  <span className="text-muted-foreground">ELO Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Joined {new Date(data.user.joinedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Link href="/play">
                <Button className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground">Play Now</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border sticky top-16 lg:top-20 bg-background z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            {[
              { id: "overview", label: "Overview" },
              { id: "games", label: "Games" },
              { id: "achievements", label: "Achievements" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={cn(
                  "px-4 py-4 text-sm font-medium border-b-2 transition-colors",
                  activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {activeTab === "overview" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats?.map((stat) => (
                  <div key={stat.label} className="p-5 rounded-2xl border border-border bg-card">
                    <div className="text-2xl font-bold mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "games" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="p-6 border-b border-border">
                <h3 className="font-semibold">Game History</h3>
              </div>
              <div className="divide-y divide-border">
                {data.games.length === 0 && <div className="p-6 text-muted-foreground">No real games yet.</div>}
                {data.games.map((game) => (
                  <div key={game.id} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "w-16 text-center py-1 rounded-lg text-sm font-medium",
                            game.result === "win" && "bg-green-500/10 text-green-500",
                            game.result === "loss" && "bg-red-500/10 text-red-500",
                            game.result === "draw" && "bg-yellow-500/10 text-yellow-500"
                          )}
                        >
                          {game.result.toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium">vs {game.opponent}</div>
                          <div className="text-sm text-muted-foreground">{new Date(game.timestamp).toLocaleString()} • {game.moveCount} moves</div>
                        </div>
                      </div>
                      <div className={cn("text-sm font-medium", game.ratingDelta >= 0 ? "text-green-500" : "text-red-500")}>
                        {game.ratingDelta >= 0 ? `+${game.ratingDelta}` : game.ratingDelta}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "achievements" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: "First Victory", unlocked: data.stats.wins >= 1, description: "Win your first game" },
                { name: "Rising Star", unlocked: data.user.elo >= 1000, description: "Reach 1000 ELO" },
                { name: "Marathon Runner", unlocked: data.stats.totalGames >= 100, description: "Play 100 games" },
              ].map((achievement) => (
                <div key={achievement.name} className={cn("p-5 rounded-2xl border bg-card", achievement.unlocked ? "border-border" : "border-border/50 opacity-60")}>
                  <div className="font-semibold mb-1">{achievement.name}</div>
                  <div className="text-sm text-muted-foreground">{achievement.description}</div>
                  <div className="text-xs mt-2">{achievement.unlocked ? "Unlocked" : "Locked"}</div>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}

