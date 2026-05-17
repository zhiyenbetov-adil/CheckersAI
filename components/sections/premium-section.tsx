"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { 
  Crown, 
  Check,
  Sparkles,
  Bot,
  Puzzle,
  BarChart3,
  Palette,
  Infinity,
  Zap
} from "lucide-react"
import { cn } from "@/lib/utils"

const plans = [
  {
    id: "free",
    name: "Free",
    description: "Perfect for casual players",
    price: { monthly: 0, yearly: 0 },
    features: [
      "Play unlimited games",
      "3 free AI lessons",
      "Basic statistics",
      "2 board themes",
      "Standard matchmaking",
    ],
    notIncluded: [
      "Advanced AI analysis",
      "Unlimited puzzles",
      "Premium themes",
      "AI game review",
    ],
    cta: "Get Started",
    ctaVariant: "outline" as const,
  },
  {
    id: "premium",
    name: "Premium",
    description: "For serious players",
    price: { monthly: 9.99, yearly: 79.99 },
    features: [
      "Everything in Free",
      "Unlimited AI lessons",
      "Advanced AI analysis",
      "Unlimited tactical puzzles",
      "AI game review",
      "All premium themes",
      "Advanced statistics",
      "Priority matchmaking",
      "No ads",
    ],
    notIncluded: [],
    cta: "Start Free Trial",
    ctaVariant: "default" as const,
    isPopular: true,
  },
]

const premiumFeatures = [
  { icon: Bot, title: "AI Analysis", description: "Get detailed move-by-move analysis" },
  { icon: Puzzle, title: "Unlimited Puzzles", description: "Train with endless tactical puzzles" },
  { icon: BarChart3, title: "Advanced Stats", description: "Track your improvement over time" },
  { icon: Palette, title: "Premium Themes", description: "Customize with exclusive designs" },
]

export function PremiumSection() {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <section className="py-24 lg:py-32">
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
            <Crown className="w-4 h-4" />
            Premium Features
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-balance">
            Unlock Your Full Potential
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Take your game to the next level with premium features designed for serious players.
          </p>
        </motion.div>

        {/* Premium Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {premiumFeatures.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl border border-border bg-card hover:shadow-lg hover:border-primary/30 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </motion.div>

        {/* Billing Toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center justify-center gap-4 mb-12"
        >
          <span className={cn("text-sm font-medium", !isYearly && "text-primary")}>
            Monthly
          </span>
          <Switch checked={isYearly} onCheckedChange={setIsYearly} />
          <span className={cn("text-sm font-medium", isYearly && "text-primary")}>
            Yearly
            <span className="ml-2 px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-xs">
              Save 33%
            </span>
          </span>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={cn(
                "relative rounded-2xl border p-8 transition-all",
                plan.isPopular 
                  ? "border-primary bg-card shadow-xl shadow-primary/10" 
                  : "border-border bg-card"
              )}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium flex items-center gap-1">
                    <Sparkles className="w-4 h-4" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">
                    ${isYearly ? plan.price.yearly : plan.price.monthly}
                  </span>
                  {plan.price.monthly > 0 && (
                    <span className="text-muted-foreground">
                      /{isYearly ? "year" : "month"}
                    </span>
                  )}
                </div>
                {isYearly && plan.price.yearly > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    ${(plan.price.yearly / 12).toFixed(2)}/month billed annually
                  </p>
                )}
              </div>

              <Link href={plan.id === "free" ? "/play" : "/checkout"}>
                <Button 
                  variant={plan.ctaVariant}
                  className={cn(
                    "w-full rounded-xl h-12 mb-6",
                    plan.isPopular && "bg-primary hover:bg-primary/90 text-primary-foreground"
                  )}
                >
                  {plan.cta}
                </Button>
              </Link>

              <div className="space-y-3">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
                {plan.notIncluded.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 opacity-50">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                    </div>
                    <span className="text-sm line-through">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-8 mt-12 text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Cancel anytime
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            7-day free trial
          </div>
          <div className="flex items-center gap-2">
            <Infinity className="w-4 h-4" />
            Unlimited games
          </div>
        </motion.div>
      </div>
    </section>
  )
}
