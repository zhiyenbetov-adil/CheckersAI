"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Trophy, Medal, Search, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

type LeaderboardRow = {
  id: string
  name: string
  email: string
  elo: number
  totalGames: number
  wins: number
  losses: number
  draws: number
  winRate: number
  trend: number
  rank: number
}

export default function LeaderboardsPage() {
  const [rows, setRows] = useState<LeaderboardRow[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/leaderboard/live")
      if (!res.ok) return
      const payload = (await res.json()) as { leaderboard: LeaderboardRow[] }
      setRows(payload.leaderboard || [])
    }
    void load()
  }, [])

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return rows
    return rows.filter((r) => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [rows, searchQuery])

  const podium = filtered.slice(0, 3)

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Trophy className="w-4 h-4" />
              Live Rankings
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Leaderboards</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">Real rating table from registered users and their game history.</p>
          </motion.div>

          {podium.length >= 3 && (
            <div className="flex justify-center items-end gap-4 mb-12">
              <div className="text-center">
                <div className="w-24 h-24 rounded-2xl bg-slate-400/20 flex items-center justify-center mb-3 mx-auto"><span className="text-4xl font-bold text-slate-400">2</span></div>
                <div className="font-semibold">{podium[1].name}</div>
                <div className="text-sm text-muted-foreground">{podium[1].elo}</div>
              </div>
              <div className="text-center">
                <div className="w-32 h-32 rounded-2xl bg-yellow-500/20 flex items-center justify-center mb-3 mx-auto relative">
                  <span className="text-5xl font-bold text-yellow-500">1</span>
                  <Medal className="absolute -top-3 -right-3 w-8 h-8 text-yellow-500" />
                </div>
                <div className="font-semibold text-lg">{podium[0].name}</div>
                <div className="text-sm text-muted-foreground">{podium[0].elo}</div>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 rounded-2xl bg-amber-600/20 flex items-center justify-center mb-3 mx-auto"><span className="text-4xl font-bold text-amber-600">3</span></div>
                <div className="font-semibold">{podium[2].name}</div>
                <div className="text-sm text-muted-foreground">{podium[2].elo}</div>
              </div>
            </div>
          )}

          <div className="relative w-full sm:w-64 ml-auto mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="hidden sm:grid grid-cols-12 gap-4 p-4 border-b border-border bg-muted/50 text-sm font-medium text-muted-foreground">
              <div className="col-span-1">Rank</div>
              <div className="col-span-4">Player</div>
              <div className="col-span-2 text-right">Rating</div>
              <div className="col-span-2 text-right">Win Rate</div>
              <div className="col-span-2 text-right">Games</div>
              <div className="col-span-1 text-right">Trend</div>
            </div>
            <div className="divide-y divide-border">
              {filtered.map((player) => (
                <div key={player.id} className="grid grid-cols-2 sm:grid-cols-12 gap-4 p-4 items-center hover:bg-muted/30 transition-colors">
                  <div className="sm:col-span-1"><div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center font-bold text-sm">{player.rank}</div></div>
                  <div className="sm:col-span-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-semibold text-primary">{player.name.slice(0, 2).toUpperCase()}</div>
                    <div><div className="font-medium">{player.name}</div><div className="text-xs text-muted-foreground">{player.email}</div></div>
                  </div>
                  <div className="sm:col-span-2 text-right"><span className="font-semibold">{player.elo}</span></div>
                  <div className="hidden sm:block sm:col-span-2 text-right"><span className="text-muted-foreground">{player.winRate.toFixed(1)}%</span></div>
                  <div className="hidden sm:block sm:col-span-2 text-right"><span className="text-muted-foreground">{player.totalGames}</span></div>
                  <div className="sm:col-span-1 text-right">
                    <div className={cn("inline-flex items-center gap-1 text-sm font-medium", player.trend > 0 ? "text-green-500" : player.trend < 0 ? "text-red-500" : "text-muted-foreground")}>
                      {player.trend > 0 ? <TrendingUp className="w-4 h-4" /> : player.trend < 0 ? <TrendingDown className="w-4 h-4" /> : null}
                      {player.trend > 0 ? `+${player.trend}` : player.trend}
                    </div>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && <div className="p-6 text-muted-foreground">No players found yet.</div>}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}

