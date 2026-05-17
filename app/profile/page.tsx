"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Trophy,
  Target,
  TrendingUp,
  Clock,
  BarChart3,
  Calendar,
  Settings,
  Medal,
  Flame,
  Zap,
  Crown,
  Star,
  ChevronRight,
  Edit2
} from "lucide-react"
import { cn } from "@/lib/utils"

const stats = [
  { label: "Total Games", value: "1,247", icon: Trophy, change: "+23 this week" },
  { label: "Win Rate", value: "62.4%", icon: Target, change: "+2.1% this month" },
  { label: "Current Streak", value: "5", icon: Flame, change: "Best: 12" },
  { label: "Time Played", value: "142h", icon: Clock, change: "This month: 18h" },
]

const achievements = [
  { id: 1, name: "First Victory", description: "Win your first game", icon: Trophy, unlocked: true, date: "Jan 2024" },
  { id: 2, name: "Tactical Genius", description: "Complete 100 puzzles", icon: Zap, unlocked: true, date: "Feb 2024" },
  { id: 3, name: "Rising Star", description: "Reach 1500 ELO", icon: Star, unlocked: true, date: "Mar 2024" },
  { id: 4, name: "King Maker", description: "Promote 50 pieces to kings", icon: Crown, unlocked: true, date: "Mar 2024" },
  { id: 5, name: "Marathon Runner", description: "Play 1000 games", icon: Medal, unlocked: false, progress: 82 },
  { id: 6, name: "Grandmaster", description: "Reach 2000 ELO", icon: Trophy, unlocked: false, progress: 45 },
]

const recentGames = [
  { id: 1, opponent: "DraughtsKing", result: "win", ratingChange: "+12", duration: "8:45", date: "2h ago" },
  { id: 2, opponent: "CheckersPro", result: "win", ratingChange: "+8", duration: "12:30", date: "5h ago" },
  { id: 3, opponent: "TacticalMaster", result: "loss", ratingChange: "-10", duration: "6:20", date: "1d ago" },
  { id: 4, opponent: "BoardWizard", result: "win", ratingChange: "+15", duration: "10:15", date: "1d ago" },
  { id: 5, opponent: "GrandMaster_X", result: "draw", ratingChange: "+2", duration: "14:50", date: "2d ago" },
]

const ratingHistory = [
  { month: "Oct", rating: 1280 },
  { month: "Nov", rating: 1320 },
  { month: "Dec", rating: 1350 },
  { month: "Jan", rating: 1380 },
  { month: "Feb", rating: 1420 },
  { month: "Mar", rating: 1485 },
]

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"overview" | "games" | "achievements">("overview")

  const maxRating = Math.max(...ratingHistory.map(r => r.rating))
  const minRating = Math.min(...ratingHistory.map(r => r.rating))
  const ratingRange = maxRating - minRating

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      {/* Profile Header */}
      <section className="pt-24 pb-8 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-4xl font-bold text-primary">
                JD
              </div>
              <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-card border border-border shadow-sm flex items-center justify-center hover:bg-muted transition-colors">
                <Edit2 className="w-4 h-4" />
              </button>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-background" />
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold">JohnDoe123</h1>
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center gap-1">
                  <Crown className="w-4 h-4" />
                  Premium
                </span>
              </div>
              <p className="text-muted-foreground mb-4">Strategy enthusiast since 2023. Always looking to improve!</p>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="font-semibold">1,485</span>
                  <span className="text-muted-foreground">ELO Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Joined January 2024</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Link href="/settings">
                <Button variant="outline" size="icon" className="rounded-xl">
                  <Settings className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/play">
                <Button className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground">
                  Play Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
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
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {activeTab === "overview" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Stats Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-5 rounded-2xl border border-border bg-card"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 rounded-xl bg-primary/10">
                        <stat.icon className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                    <div className="text-xs text-primary mt-2">{stat.change}</div>
                  </motion.div>
                ))}
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Rating Chart */}
                <div className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold">Rating History</h3>
                    <span className="text-sm text-muted-foreground">Last 6 months</span>
                  </div>
                  <div className="h-48 flex items-end justify-between gap-2">
                    {ratingHistory.map((data, index) => {
                      const height = ((data.rating - minRating) / ratingRange) * 100 + 20
                      return (
                        <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${height}%` }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            className="w-full bg-primary/20 rounded-t-lg relative group"
                          >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-foreground text-background text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              {data.rating}
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-primary rounded-t-lg" />
                          </motion.div>
                          <span className="text-xs text-muted-foreground">{data.month}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Recent Games */}
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                  <div className="p-6 border-b border-border">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Recent Games</h3>
                      <Link href="/games" className="text-sm text-primary hover:underline">
                        View all
                      </Link>
                    </div>
                  </div>
                  <div className="divide-y divide-border">
                    {recentGames.slice(0, 4).map((game) => (
                      <div key={game.id} className="p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              game.result === "win" && "bg-green-500",
                              game.result === "loss" && "bg-red-500",
                              game.result === "draw" && "bg-yellow-500"
                            )} />
                            <div>
                              <div className="font-medium">{game.opponent}</div>
                              <div className="text-xs text-muted-foreground">{game.duration} • {game.date}</div>
                            </div>
                          </div>
                          <div className={cn(
                            "text-sm font-medium",
                            game.ratingChange.startsWith("+") ? "text-green-500" : game.ratingChange.startsWith("-") ? "text-red-500" : "text-muted-foreground"
                          )}>
                            {game.ratingChange}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Achievements Preview */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold">Recent Achievements</h3>
                  <button onClick={() => setActiveTab("achievements")} className="text-sm text-primary hover:underline flex items-center">
                    View all <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {achievements.filter(a => a.unlocked).slice(0, 4).map((achievement) => (
                    <div key={achievement.id} className="p-4 rounded-xl bg-muted/50 border border-border">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                        <achievement.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="font-medium text-sm mb-1">{achievement.name}</div>
                      <div className="text-xs text-muted-foreground">{achievement.date}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "games" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border border-border bg-card overflow-hidden"
            >
              <div className="p-6 border-b border-border">
                <h3 className="font-semibold">Game History</h3>
              </div>
              <div className="divide-y divide-border">
                {recentGames.map((game) => (
                  <div key={game.id} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-16 text-center py-1 rounded-lg text-sm font-medium",
                          game.result === "win" && "bg-green-500/10 text-green-500",
                          game.result === "loss" && "bg-red-500/10 text-red-500",
                          game.result === "draw" && "bg-yellow-500/10 text-yellow-500"
                        )}>
                          {game.result.toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium">vs {game.opponent}</div>
                          <div className="text-sm text-muted-foreground">{game.duration} • {game.date}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "text-sm font-medium",
                          game.ratingChange.startsWith("+") ? "text-green-500" : game.ratingChange.startsWith("-") ? "text-red-500" : "text-muted-foreground"
                        )}>
                          {game.ratingChange}
                        </div>
                        <Button variant="ghost" size="sm" className="rounded-lg">
                          Review
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "achievements" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "p-5 rounded-2xl border bg-card",
                    achievement.unlocked ? "border-border" : "border-border/50 opacity-60"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      achievement.unlocked ? "bg-primary/10" : "bg-muted"
                    )}>
                      <achievement.icon className={cn(
                        "w-6 h-6",
                        achievement.unlocked ? "text-primary" : "text-muted-foreground"
                      )} />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold mb-1">{achievement.name}</div>
                      <div className="text-sm text-muted-foreground mb-2">{achievement.description}</div>
                      {achievement.unlocked ? (
                        <div className="text-xs text-primary">Unlocked {achievement.date}</div>
                      ) : (
                        <div className="space-y-1">
                          <Progress value={achievement.progress} className="h-1.5" />
                          <div className="text-xs text-muted-foreground">{achievement.progress}% complete</div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
