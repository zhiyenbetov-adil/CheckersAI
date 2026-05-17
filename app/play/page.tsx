"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { GameBoard } from "@/components/game-board"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  Bot, 
  Globe, 
  Play,
  ArrowLeft,
  ChevronRight,
  Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"

const playModes = [
  {
    id: "local",
    title: "Play Locally",
    description: "Play on the same device with a friend - take turns on the same screen",
    icon: Users,
    color: "bg-blue-500/10 text-blue-500",
    available: true,
  },
  {
    id: "ai",
    title: "Play vs AI",
    description: "Challenge our AI opponent at various difficulty levels",
    icon: Bot,
    color: "bg-primary/10 text-primary",
    available: true,
  },
  {
    id: "friend",
    title: "Play with Friend",
    description: "Create a room and invite a friend to play online",
    icon: Globe,
    color: "bg-green-500/10 text-green-500",
    href: "/play/friend",
    available: true,
  },
]

const aiLevels = [
  { id: "beginner", label: "Beginner", description: "Perfect for learning the basics", elo: "~800" },
  { id: "easy", label: "Easy", description: "Makes occasional mistakes", elo: "~1000" },
  { id: "medium", label: "Medium", description: "A balanced challenge", elo: "~1200" },
  { id: "hard", label: "Hard", description: "Plays strategically", elo: "~1400" },
  { id: "expert", label: "Expert", description: "Near-perfect play", elo: "~1600" },
]

export default function PlayPage() {
  const [selectedMode, setSelectedMode] = useState<string | null>(null)
  const [selectedAiLevel, setSelectedAiLevel] = useState("medium")
  const [gameStarted, setGameStarted] = useState(false)

  // If game has started, show the game board
  if (gameStarted) {
    return (
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          className="absolute top-4 left-4 z-10 rounded-lg"
          onClick={() => setGameStarted(false)}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        <GameBoard
          mode={selectedMode === "ai" ? "ai" : "local"}
          aiLevel={selectedAiLevel as "beginner" | "easy" | "medium" | "hard" | "expert"}
        />
      </div>
    )
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
              <Play className="w-4 h-4" />
              Choose Your Mode
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Play?</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Select how you want to play. Practice locally, challenge the AI, or compete with friends online.
            </p>
          </motion.div>

          {/* Mode Selection */}
          {!selectedMode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="grid sm:grid-cols-2 gap-6"
            >
              {playModes.map((mode, index) => (
                <motion.div
                  key={mode.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  {mode.href ? (
                    <Link href={mode.href} className="block h-full">
                      <div className={cn(
                        "group h-full p-6 rounded-2xl border bg-card transition-all",
                        mode.available 
                          ? "border-border hover:border-primary/50 hover:shadow-lg cursor-pointer" 
                          : "border-border/50 opacity-60"
                      )}>
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", mode.color)}>
                          <mode.icon className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{mode.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{mode.description}</p>
                        {mode.comingSoon ? (
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Coming Soon</span>
                        ) : (
                          <span className="text-primary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                            Play <ChevronRight className="w-4 h-4" />
                          </span>
                        )}
                      </div>
                    </Link>
                  ) : (
                    <button
                      onClick={() => mode.available && setSelectedMode(mode.id)}
                      disabled={!mode.available}
                      className={cn(
                        "w-full h-full text-left p-6 rounded-2xl border bg-card transition-all",
                        mode.available 
                          ? "border-border hover:border-primary/50 hover:shadow-lg cursor-pointer" 
                          : "border-border/50 opacity-60 cursor-not-allowed"
                      )}
                    >
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", mode.color)}>
                        <mode.icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{mode.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{mode.description}</p>
                      {mode.comingSoon ? (
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Coming Soon</span>
                      ) : (
                        <span className="text-primary text-sm font-medium flex items-center gap-1">
                          Select <ChevronRight className="w-4 h-4" />
                        </span>
                      )}
                    </button>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* AI Level Selection */}
          {selectedMode === "ai" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-lg mx-auto"
            >
              <div className="rounded-2xl border border-border bg-card p-8">
                <button
                  onClick={() => setSelectedMode(null)}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to modes
                </button>

                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Bot className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Play vs AI</h2>
                    <p className="text-sm text-muted-foreground">Choose difficulty level</p>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  {aiLevels.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => setSelectedAiLevel(level.id)}
                      className={cn(
                        "w-full p-4 rounded-xl border text-left transition-all",
                        selectedAiLevel === level.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{level.label}</div>
                          <div className="text-sm text-muted-foreground">{level.description}</div>
                        </div>
                        <div className="text-sm text-muted-foreground">{level.elo}</div>
                      </div>
                    </button>
                  ))}
                </div>

                <Button
                  className="w-full rounded-xl h-12 bg-primary hover:bg-primary/90"
                  onClick={() => setGameStarted(true)}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start Game
                </Button>
              </div>
            </motion.div>
          )}

          {/* Local Play Confirmation */}
          {selectedMode === "local" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-lg mx-auto"
            >
              <div className="rounded-2xl border border-border bg-card p-8">
                <button
                  onClick={() => setSelectedMode(null)}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to modes
                </button>

                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Play Locally</h2>
                    <p className="text-sm text-muted-foreground">Two players, one device</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-muted/50 border border-border mb-6">
                  <h3 className="font-medium mb-2">How it works:</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                      Light pieces move first
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                      Take turns on the same screen
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                      Capture all opponent pieces to win
                    </li>
                  </ul>
                </div>

                <Button
                  className="w-full rounded-xl h-12 bg-primary hover:bg-primary/90"
                  onClick={() => setGameStarted(true)}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Game
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  )
}
