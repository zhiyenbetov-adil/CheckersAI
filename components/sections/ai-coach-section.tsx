"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Bot, 
  Brain,
  Lightbulb,
  TrendingUp,
  Puzzle,
  Lock,
  ChevronRight,
  Sparkles,
  CheckCircle,
  Crown
} from "lucide-react"
import { cn } from "@/lib/utils"

const modules = [
  {
    id: 1,
    title: "Basics",
    description: "Master the fundamental rules and piece movements",
    icon: Brain,
    lessons: 5,
    completed: 5,
    isLocked: false,
  },
  {
    id: 2,
    title: "Capturing",
    description: "Learn single and multiple capture techniques",
    icon: TrendingUp,
    lessons: 4,
    completed: 3,
    isLocked: false,
  },
  {
    id: 3,
    title: "Strategy",
    description: "Develop winning game strategies and positioning",
    icon: Lightbulb,
    lessons: 6,
    completed: 0,
    isLocked: false,
  },
  {
    id: 4,
    title: "Advanced Tactical Thinking",
    description: "Master complex combinations and sacrifices",
    icon: Puzzle,
    lessons: 8,
    completed: 0,
    isLocked: true,
    isPremium: true,
  },
]

const features = [
  "AI explains every mistake",
  "Personalized recommendations",
  "Adaptive difficulty levels",
  "Tactical puzzle generator",
  "Game analysis & review",
  "Progress tracking",
]

export function AICoachSection() {
  const [showPaywall, setShowPaywall] = useState(false)
  const [isPremiumUser, setIsPremiumUser] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem("checkers_auth_user")
      if (!raw) return
      const user = JSON.parse(raw) as {
        premiumUntil?: number | null
        subscriptionTier?: "free" | "premium" | "pro"
      }
      const hasPremiumWindow = Boolean(user.premiumUntil && user.premiumUntil > Date.now())
      const hasTier = user.subscriptionTier === "premium" || user.subscriptionTier === "pro"
      setIsPremiumUser(hasPremiumWindow || hasTier)
    } catch {}
  }, [])

  return (
    <section className="py-24 lg:py-32 bg-muted/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Bot className="w-4 h-4" />
            AI-Powered Training
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-balance">
            Your Personal AI Coach
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Train with cutting-edge AI that adapts to your skill level, explains mistakes, and helps you improve faster than ever.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left - Module Cards */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            {modules.map((module, index) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <button
                  onClick={() => module.isLocked && !isPremiumUser && setShowPaywall(true)}
                  className={cn(
                    "w-full text-left p-5 rounded-2xl border transition-all duration-300",
                    module.isLocked && !isPremiumUser
                      ? "border-border bg-card/50 cursor-pointer hover:border-primary/50" 
                      : "border-border bg-card hover:shadow-lg hover:border-primary/30"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "p-3 rounded-xl",
                      module.isLocked && !isPremiumUser ? "bg-muted" : "bg-primary/10"
                    )}>
                      {module.isLocked && !isPremiumUser ? (
                        <Lock className="w-6 h-6 text-muted-foreground" />
                      ) : (
                        <module.icon className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={cn(
                          "font-semibold",
                          module.isLocked && !isPremiumUser && "text-muted-foreground"
                        )}>
                          Module {module.id}: {module.title}
                        </h3>
                        {module.isPremium && !isPremiumUser && (
                          <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                            <Crown className="w-3 h-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                      <p className={cn(
                        "text-sm mb-3",
                        module.isLocked && !isPremiumUser ? "text-muted-foreground/70" : "text-muted-foreground"
                      )}>
                        {module.description}
                      </p>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-muted-foreground">
                          {module.lessons} lessons
                        </span>
                        {(!module.isLocked || isPremiumUser) && (
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${(module.completed / module.lessons) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium">
                              {module.completed}/{module.lessons}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <ChevronRight className={cn(
                      "w-5 h-5 flex-shrink-0",
                      module.isLocked && !isPremiumUser ? "text-muted-foreground/50" : "text-muted-foreground"
                    )} />
                  </div>
                </button>
              </motion.div>
            ))}
          </motion.div>

          {/* Right - Features & CTA */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:sticky lg:top-24"
          >
            <div className="rounded-2xl border border-border bg-card p-8">
              {/* AI visualization */}
              <div className="relative h-48 mb-8 rounded-xl bg-gradient-to-br from-primary/10 to-accent/20 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="w-24 h-24 rounded-full bg-primary/20 absolute"
                  />
                  <motion.div
                    animate={{ 
                      scale: [1.1, 1, 1.1],
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5
                    }}
                    className="w-32 h-32 rounded-full bg-primary/10 absolute"
                  />
                  <div className="relative z-10 w-16 h-16 rounded-2xl bg-card shadow-xl flex items-center justify-center">
                    <Bot className="w-8 h-8 text-primary" />
                  </div>
                </div>
                
                {/* Floating hints */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 }}
                  className="absolute top-4 left-4 px-3 py-2 rounded-lg bg-card/90 backdrop-blur shadow-lg text-xs"
                >
                  <span className="text-green-500 font-medium">+12 ELO</span> potential
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 }}
                  className="absolute bottom-4 right-4 px-3 py-2 rounded-lg bg-card/90 backdrop-blur shadow-lg text-xs flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-primary" />
                  AI analyzing...
                </motion.div>
              </div>

              <h3 className="text-xl font-semibold mb-4">AI Coach Features</h3>
              
              <ul className="space-y-3 mb-8">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/ai-coach">
                <Button className="w-full rounded-xl h-12 bg-primary hover:bg-primary/90 text-primary-foreground">
                  Start Training with AI
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Premium Paywall Modal */}
      {showPaywall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowPaywall(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-2xl"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Unlock Advanced Training</h3>
              <p className="text-muted-foreground">
                Get unlimited access to all AI coaching modules, advanced tactics, and personalized training plans.
              </p>
            </div>

            <div className="space-y-3 mb-6">
              {["Unlimited AI lessons", "Advanced tactical training", "Personalized improvement plans", "Priority AI analysis"].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <Link href="/premium" onClick={() => setShowPaywall(false)}>
                <Button className="w-full rounded-xl h-12 bg-primary hover:bg-primary/90 text-primary-foreground">
                  Upgrade to Premium
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                className="w-full rounded-xl"
                onClick={() => setShowPaywall(false)}
              >
                Maybe Later
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </section>
  )
}
