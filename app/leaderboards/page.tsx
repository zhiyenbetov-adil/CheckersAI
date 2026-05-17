"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { 
  Trophy,
  Medal,
  Globe,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Search,
  Filter
} from "lucide-react"
import { cn } from "@/lib/utils"

const leaderboardData = [
  { rank: 1, name: "GrandMaster_X", rating: 2847, country: "US", games: 3420, winRate: 78.5, trend: 15, prevRank: 1 },
  { rank: 2, name: "CheckersPro99", rating: 2823, country: "RU", games: 2890, winRate: 76.2, trend: 8, prevRank: 3 },
  { rank: 3, name: "DraughtsKing", rating: 2801, country: "NL", games: 4120, winRate: 74.8, trend: -3, prevRank: 2 },
  { rank: 4, name: "TacticalGenius", rating: 2789, country: "UK", games: 2560, winRate: 73.1, trend: 12, prevRank: 6 },
  { rank: 5, name: "BoardMaster", rating: 2776, country: "DE", games: 3890, winRate: 72.4, trend: 5, prevRank: 5 },
  { rank: 6, name: "StrategyPro", rating: 2754, country: "FR", games: 2340, winRate: 71.8, trend: -2, prevRank: 4 },
  { rank: 7, name: "CheckerChamp", rating: 2738, country: "CA", games: 4560, winRate: 70.2, trend: 18, prevRank: 12 },
  { rank: 8, name: "MoveWizard", rating: 2721, country: "AU", games: 1890, winRate: 69.5, trend: 3, prevRank: 9 },
  { rank: 9, name: "KingHunter", rating: 2705, country: "JP", games: 3210, winRate: 68.9, trend: -5, prevRank: 7 },
  { rank: 10, name: "GameTheory", rating: 2692, country: "BR", games: 2780, winRate: 68.1, trend: 7, prevRank: 11 },
  { rank: 11, name: "TacticMind", rating: 2678, country: "IN", games: 4320, winRate: 67.4, trend: -1, prevRank: 10 },
  { rank: 12, name: "BoardSage", rating: 2665, country: "ES", games: 2150, winRate: 66.8, trend: 9, prevRank: 15 },
]

const countryFlags: Record<string, string> = {
  US: "🇺🇸", RU: "🇷🇺", NL: "🇳🇱", UK: "🇬🇧", DE: "🇩🇪",
  FR: "🇫🇷", CA: "🇨🇦", AU: "🇦🇺", JP: "🇯🇵", BR: "🇧🇷",
  IN: "🇮🇳", ES: "🇪🇸"
}

const timeFilters = ["All Time", "This Month", "This Week", "Today"]

export default function LeaderboardsPage() {
  const [timeFilter, setTimeFilter] = useState("All Time")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredData = leaderboardData.filter(player => 
    player.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      {/* Header */}
      <section className="pt-32 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Trophy className="w-4 h-4" />
              Global Rankings
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Leaderboards</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              See where you stand among the best checkers players in the world
            </p>
          </motion.div>

          {/* Top 3 Podium */}
          <div className="flex justify-center items-end gap-4 mb-12">
            {/* 2nd Place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-400/20 flex items-center justify-center mb-3 mx-auto">
                <span className="text-3xl sm:text-4xl font-bold text-slate-400">2</span>
              </div>
              <div className="font-semibold text-sm sm:text-base">{leaderboardData[1].name}</div>
              <div className="text-sm text-muted-foreground">{leaderboardData[1].rating}</div>
            </motion.div>

            {/* 1st Place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-yellow-500/20 flex items-center justify-center mb-3 mx-auto relative">
                <span className="text-4xl sm:text-5xl font-bold text-yellow-500">1</span>
                <Medal className="absolute -top-3 -right-3 w-8 h-8 text-yellow-500" />
              </div>
              <div className="font-semibold text-base sm:text-lg">{leaderboardData[0].name}</div>
              <div className="text-sm text-muted-foreground">{leaderboardData[0].rating}</div>
            </motion.div>

            {/* 3rd Place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-amber-600/20 flex items-center justify-center mb-3 mx-auto">
                <span className="text-3xl sm:text-4xl font-bold text-amber-600">3</span>
              </div>
              <div className="font-semibold text-sm sm:text-base">{leaderboardData[2].name}</div>
              <div className="text-sm text-muted-foreground">{leaderboardData[2].rating}</div>
            </motion.div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
            <div className="flex flex-wrap gap-2">
              {timeFilters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    timeFilter === filter
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search players..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Leaderboard Table */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-border bg-card overflow-hidden"
          >
            {/* Header */}
            <div className="hidden sm:grid grid-cols-12 gap-4 p-4 border-b border-border bg-muted/50 text-sm font-medium text-muted-foreground">
              <div className="col-span-1">Rank</div>
              <div className="col-span-4">Player</div>
              <div className="col-span-2 text-right">Rating</div>
              <div className="col-span-2 text-right">Win Rate</div>
              <div className="col-span-2 text-right">Games</div>
              <div className="col-span-1 text-right">Trend</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-border">
              {filteredData.map((player, index) => (
                <motion.div
                  key={player.rank}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="grid grid-cols-2 sm:grid-cols-12 gap-4 p-4 items-center hover:bg-muted/30 transition-colors"
                >
                  <div className="sm:col-span-1">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm",
                      player.rank === 1 && "bg-yellow-500/20 text-yellow-500",
                      player.rank === 2 && "bg-slate-400/20 text-slate-400",
                      player.rank === 3 && "bg-amber-600/20 text-amber-600",
                      player.rank > 3 && "bg-muted text-muted-foreground"
                    )}>
                      {player.rank}
                    </div>
                  </div>
                  <div className="sm:col-span-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-semibold text-primary">
                      {player.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">{player.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <span>{countryFlags[player.country]}</span>
                        {player.country}
                      </div>
                    </div>
                  </div>
                  <div className="sm:col-span-2 text-right">
                    <span className="font-semibold">{player.rating}</span>
                  </div>
                  <div className="hidden sm:block sm:col-span-2 text-right">
                    <span className="text-muted-foreground">{player.winRate}%</span>
                  </div>
                  <div className="hidden sm:block sm:col-span-2 text-right">
                    <span className="text-muted-foreground">{player.games.toLocaleString()}</span>
                  </div>
                  <div className="sm:col-span-1 text-right">
                    <div className={cn(
                      "inline-flex items-center gap-1 text-sm font-medium",
                      player.trend > 0 ? "text-green-500" : player.trend < 0 ? "text-red-500" : "text-muted-foreground"
                    )}>
                      {player.trend > 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : player.trend < 0 ? (
                        <TrendingDown className="w-4 h-4" />
                      ) : null}
                      {player.trend > 0 ? `+${player.trend}` : player.trend}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Your Position */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 p-6 rounded-2xl border border-primary/30 bg-primary/5"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary">
                  #847
                </div>
                <div>
                  <div className="font-semibold">Your Position</div>
                  <div className="text-sm text-muted-foreground">1,485 ELO • Top 15%</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  <span className="text-green-500 font-medium">+23</span> positions this week
                </div>
                <Link href="/play">
                  <Button className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground">
                    Play to Climb
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
