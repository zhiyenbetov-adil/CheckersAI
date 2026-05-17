"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AnimatedBoard } from "@/components/animated-board"
import { 
  Play, 
  Bot, 
  Users, 
  Crown,
  Sparkles,
  Zap,
  Trophy,
  BookOpen
} from "lucide-react"

export function HeroSection() {
  const [gamesCompleted, setGamesCompleted] = useState(0)
  const [lessonsWatched, setLessonsWatched] = useState(0)
  const [coachAnalyses, setCoachAnalyses] = useState(0)

  useEffect(() => {
    const games = Number(localStorage.getItem("checkers_total_games") || "0")
    const lessonsRaw = localStorage.getItem("checkers_watched_lessons")
    let lessons: unknown[] = []
    if (lessonsRaw) {
      try {
        lessons = JSON.parse(lessonsRaw) as unknown[]
      } catch {
        lessons = []
      }
    }
    const analyses = Number(localStorage.getItem("checkers_ai_analyses_used") || "0")
    setGamesCompleted(games)
    setLessonsWatched(Array.isArray(lessons) ? lessons.length : 0)
    setCoachAnalyses(analyses)
  }, [])

  const stats = useMemo(
    () => [
      { label: "Games Completed", value: String(gamesCompleted), icon: Trophy },
      { label: "Lessons Watched", value: String(lessonsWatched), icon: BookOpen },
      { label: "Coach Analyses", value: String(coachAnalyses), icon: Bot },
    ],
    [gamesCompleted, lessonsWatched, coachAnalyses]
  )

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/20" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 2 }}
          className="absolute top-1/4 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 2, delay: 0.5 }}
          className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl"
        />
      </div>

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              <Sparkles className="w-4 h-4" />
              AI-Powered Strategy Platform
            </motion.div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-6">
              <span className="text-balance">Master Checkers with </span>
              <span className="text-primary relative">
                AI
                <motion.span
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 1, duration: 0.8 }}
                  className="absolute bottom-2 left-0 h-3 bg-primary/20 -z-10"
                />
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 text-pretty">
              Improve through practical training, online games with friends, and post-game AI feedback tailored for checkers.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Link href="/play">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 text-base h-12 px-8"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Play Now
                </Button>
              </Link>
              <Link href="/ai-coach">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full sm:w-auto rounded-xl text-base h-12 px-8"
                >
                  <Bot className="w-5 h-5 mr-2" />
                  Train with AI
                </Button>
              </Link>
            </div>

            {/* Secondary CTAs */}
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <Link href="/play/friend" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                <Users className="w-4 h-4" />
                Play with Friends
              </Link>
              <Link href="/premium" className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
                <Crown className="w-4 h-4" />
                Go Premium
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-border">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="text-center lg:text-left"
                >
                  <div className="flex items-center justify-center lg:justify-start gap-2 mb-1">
                    <stat.icon className="w-4 h-4 text-primary" />
                    <span className="text-2xl sm:text-3xl font-bold">{stat.value}</span>
                  </div>
                  <span className="text-xs sm:text-sm text-muted-foreground">{stat.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right content - Animated Board */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-md">
              {/* Floating badges */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 }}
                className="absolute -left-4 top-1/4 z-10 hidden sm:block"
              >
                <div className="glass px-4 py-3 rounded-xl shadow-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">AI Move</div>
                      <div className="text-sm font-semibold">+15 ELO</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.4 }}
                className="absolute -right-4 bottom-1/4 z-10 hidden sm:block"
              >
                <div className="glass px-4 py-3 rounded-xl shadow-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Trophy className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Win Streak</div>
                      <div className="text-sm font-semibold">5 Games</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <AnimatedBoard theme="orange" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-2 text-muted-foreground"
        >
          <span className="text-xs">Scroll to explore</span>
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-primary"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
