"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  Trophy,
  Users,
  Calendar,
  TrendingUp,
  Medal,
  Globe,
  Flame,
  ChevronRight,
  Star
} from "lucide-react"
import { cn } from "@/lib/utils"

const leaderboardData = [
  { rank: 1, name: "GrandMaster_X", rating: 2847, country: "US", trend: "+15" },
  { rank: 2, name: "CheckersPro99", rating: 2823, country: "RU", trend: "+8" },
  { rank: 3, name: "DraughtsKing", rating: 2801, country: "NL", trend: "-3" },
  { rank: 4, name: "TacticalGenius", rating: 2789, country: "UK", trend: "+12" },
  { rank: 5, name: "BoardMaster", rating: 2776, country: "DE", trend: "+5" },
]

const tournaments = [
  {
    id: 1,
    name: "Weekly Blitz Championship",
    prize: "$500",
    players: "128/256",
    startsIn: "2h 30m",
    type: "Blitz",
  },
  {
    id: 2,
    name: "Monthly Grand Prix",
    prize: "$2,000",
    players: "64/128",
    startsIn: "2 days",
    type: "Classical",
  },
  {
    id: 3,
    name: "AI Challenge Cup",
    prize: "$1,000",
    players: "89/100",
    startsIn: "5h 15m",
    type: "Rapid",
  },
]

const dailyChallenges = [
  { id: 1, name: "Win 3 games", progress: 2, total: 3, xp: 50 },
  { id: 2, name: "Complete 5 puzzles", progress: 3, total: 5, xp: 30 },
  { id: 3, name: "Play a rated game", progress: 1, total: 1, xp: 20, completed: true },
]

export function CommunitySection() {
  const [gamesCompleted, setGamesCompleted] = useState(0)
  const [lessonsWatched, setLessonsWatched] = useState(0)
  const [analysesUsed, setAnalysesUsed] = useState(0)

  useEffect(() => {
    const games = Number(localStorage.getItem("checkers_total_games") || "0")
    const analyses = Number(localStorage.getItem("checkers_ai_analyses_used") || "0")
    const lessonsRaw = localStorage.getItem("checkers_watched_lessons")
    let lessons = 0
    if (lessonsRaw) {
      try {
        const parsed = JSON.parse(lessonsRaw) as unknown[]
        lessons = Array.isArray(parsed) ? parsed.length : 0
      } catch {
        lessons = 0
      }
    }
    setGamesCompleted(games)
    setAnalysesUsed(analyses)
    setLessonsWatched(lessons)
  }, [])

  const stats = useMemo(
    () => [
      { icon: Users, label: "Profiles Created", value: String(Math.max(1, lessonsWatched + analysesUsed)) },
      { icon: Globe, label: "Online Rooms Played", value: String(Math.max(0, gamesCompleted)) },
      { icon: Trophy, label: "Lessons Completed", value: String(lessonsWatched) },
      { icon: Star, label: "Coach Reviews", value: String(analysesUsed) },
    ],
    [gamesCompleted, lessonsWatched, analysesUsed]
  )

  return (
    <section className="py-24 lg:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Users className="w-4 h-4" />
            Global Community
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-balance">
            Compete with Players Worldwide
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Join tournaments, climb the leaderboards, and become part of our thriving checkers community.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Leaderboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2"
          >
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10">
                      <Trophy className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Global Leaderboard</h3>
                      <p className="text-sm text-muted-foreground">Top players this month</p>
                    </div>
                  </div>
                  <Link href="/leaderboards">
                    <Button variant="ghost" size="sm" className="rounded-lg">
                      View All
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="divide-y divide-border">
                {leaderboardData.map((player, index) => (
                  <div
                    key={player.rank}
                    className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm",
                      player.rank === 1 && "bg-yellow-500/20 text-yellow-500",
                      player.rank === 2 && "bg-slate-400/20 text-slate-400",
                      player.rank === 3 && "bg-amber-600/20 text-amber-600",
                      player.rank > 3 && "bg-muted text-muted-foreground"
                    )}>
                      {player.rank <= 3 ? (
                        <Medal className="w-5 h-5" />
                      ) : (
                        player.rank
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{player.name}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          {player.country}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{player.rating}</div>
                      <div className={cn(
                        "text-xs",
                        player.trend.startsWith("+") ? "text-green-500" : "text-red-500"
                      )}>
                        {player.trend}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Tournaments & Challenges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
          >
            {/* Daily Challenges */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="p-5 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Flame className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Daily Challenges</h3>
                    <p className="text-xs text-muted-foreground">Earn XP & rewards</p>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {dailyChallenges.map((challenge) => (
                  <div
                    key={challenge.id}
                    className={cn(
                      "p-3 rounded-xl border",
                      challenge.completed 
                        ? "border-green-500/30 bg-green-500/5" 
                        : "border-border bg-muted/30"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{challenge.name}</span>
                      <span className="text-xs text-primary">+{challenge.xp} XP</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all",
                            challenge.completed ? "bg-green-500" : "bg-primary"
                          )}
                          style={{ width: `${(challenge.progress / challenge.total) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {challenge.progress}/{challenge.total}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tournaments */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="p-5 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Tournaments</h3>
                      <p className="text-xs text-muted-foreground">Join & compete</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-border">
                {tournaments.map((tournament) => (
                  <div key={tournament.id} className="p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium truncate">{tournament.name}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {tournament.players}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-muted">
                            {tournament.type}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-semibold text-primary">{tournament.prize}</div>
                        <div className="text-xs text-muted-foreground">in {tournament.startsIn}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-border">
                <Link href="/play/friend">
                  <Button variant="outline" className="w-full rounded-xl" size="sm">
                    Join Next Event
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12"
        >
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-2xl border border-border bg-card"
            >
              <stat.icon className="w-6 h-6 text-primary mx-auto mb-3" />
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
