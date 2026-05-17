"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { 
  Crown, 
  Check, 
  X,
  Sparkles,
  Bot,
  Puzzle,
  BarChart3,
  Palette,
  Zap,
  Shield,
  HeadphonesIcon,
  Star,
  Users,
  Trophy
} from "lucide-react"
import { cn } from "@/lib/utils"

const plans = [
  {
    id: "free",
    name: "Free",
    description: "Perfect for casual players",
    price: { monthly: 0, yearly: 0 },
    features: [
      { text: "Play unlimited games", included: true },
      { text: "3 free AI lessons", included: true },
      { text: "Basic statistics", included: true },
      { text: "2 board themes", included: true },
      { text: "Standard matchmaking", included: true },
      { text: "Advanced AI analysis", included: false },
      { text: "Unlimited puzzles", included: false },
      { text: "Premium themes", included: false },
      { text: "AI game review", included: false },
      { text: "Priority support", included: false },
    ],
    cta: "Current Plan",
    ctaVariant: "outline" as const,
    disabled: true,
  },
  {
    id: "premium",
    name: "Premium",
    description: "For serious players",
    price: { monthly: 9.99, yearly: 79.99 },
    features: [
      { text: "Everything in Free", included: true },
      { text: "Unlimited AI lessons", included: true },
      { text: "Advanced AI analysis", included: true },
      { text: "Unlimited tactical puzzles", included: true },
      { text: "AI game review", included: true },
      { text: "All premium themes", included: true },
      { text: "Advanced statistics", included: true },
      { text: "Priority matchmaking", included: true },
      { text: "No ads", included: true },
      { text: "Priority support", included: true },
    ],
    cta: "Start Free Trial",
    ctaVariant: "default" as const,
    isPopular: true,
  },
  {
    id: "pro",
    name: "Pro",
    description: "For competitive players",
    price: { monthly: 19.99, yearly: 159.99 },
    features: [
      { text: "Everything in Premium", included: true },
      { text: "1-on-1 AI coaching sessions", included: true },
      { text: "Tournament priority entry", included: true },
      { text: "Custom board designer", included: true },
      { text: "Advanced opening database", included: true },
      { text: "Exclusive pro themes", included: true },
      { text: "Team/club features", included: true },
      { text: "API access", included: true },
      { text: "White-glove onboarding", included: true },
      { text: "24/7 priority support", included: true },
    ],
    cta: "Go Pro",
    ctaVariant: "default" as const,
  },
]

const testimonials = [
  {
    name: "Alex Thompson",
    role: "Amateur Champion",
    avatar: "AT",
    content: "The AI coaching has completely transformed my game. I went from 1200 to 1600 ELO in just 3 months!",
    rating: 5,
  },
  {
    name: "Sarah Chen",
    role: "Tournament Player",
    avatar: "SC",
    content: "Best investment I made for my checkers journey. The puzzle system is incredibly addictive and educational.",
    rating: 5,
  },
  {
    name: "Mike Rodriguez",
    role: "Club President",
    avatar: "MR",
    content: "Our entire club switched to Checkers AI. The team features and tournament tools are unmatched.",
    rating: 5,
  },
]

const faqs = [
  {
    q: "Can I cancel anytime?",
    a: "Yes! You can cancel your subscription at any time. You will continue to have access until the end of your billing period.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes, Premium includes a 7-day free trial. No credit card required to start.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit cards, PayPal, and Apple Pay.",
  },
  {
    q: "Can I switch plans?",
    a: "Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect immediately.",
  },
]

export default function PremiumPage() {
  const [isYearly, setIsYearly] = useState(true)
  const [currentTier, setCurrentTier] = useState<"free" | "premium" | "pro">("free")
  const [isActivatingPlan, setIsActivatingPlan] = useState<string | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem("checkers_auth_user")
      if (!raw) return
      const user = JSON.parse(raw) as { subscriptionTier?: "free" | "premium" | "pro"; premiumUntil?: number | null }
      if (user.subscriptionTier) {
        setCurrentTier(user.subscriptionTier)
      } else if (user.premiumUntil && user.premiumUntil > Date.now()) {
        setCurrentTier("premium")
      }
    } catch {}
  }, [])

  const activatePlan = async (planId: "premium" | "pro") => {
    setIsActivatingPlan(planId)
    try {
      const raw = localStorage.getItem("checkers_auth_user")
      if (!raw) {
        window.location.href = "/login"
        return
      }
      const user = JSON.parse(raw) as { id: string; name: string; email: string }
      const response = await fetch("/api/subscription/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          months: isYearly ? 12 : 1,
          plan: planId,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        alert(data.error || "Unable to activate plan.")
        return
      }
      const updated = {
        ...user,
        premiumUntil: data.premium.premiumUntil,
        subscriptionTier: data.premium.subscriptionTier,
      }
      localStorage.setItem("checkers_auth_user", JSON.stringify(updated))
      setCurrentTier(data.premium.subscriptionTier)
      await fetch("/api/log/client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          action: "subscription.test_mode.activated",
          details: { plan: planId, billingCycle: isYearly ? "yearly" : "monthly" },
        }),
      })
    } catch {
      alert("Activation failed. Please try again.")
    } finally {
      setIsActivatingPlan(null)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Crown className="w-4 h-4" />
              Premium Membership
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-balance">
              Unlock Your Full<br />
              <span className="text-primary">Checkers Potential</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Join thousands of players who have elevated their game with our premium AI-powered training tools.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Toggle */}
      <section className="pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-4">
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
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={cn(
                  "relative rounded-2xl border p-8 transition-all",
                  plan.isPopular 
                    ? "border-primary bg-card shadow-xl shadow-primary/10 scale-105" 
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

                <Button
                  variant={plan.ctaVariant}
                  disabled={plan.disabled || isActivatingPlan === plan.id || (plan.id === currentTier)}
                  onClick={() => {
                    if (plan.id === "premium" || plan.id === "pro") {
                      void activatePlan(plan.id)
                    }
                  }}
                  className={cn(
                    "w-full rounded-xl h-12 mb-6",
                    plan.isPopular && "bg-primary hover:bg-primary/90 text-primary-foreground"
                  )}
                >
                  {plan.id === currentTier
                    ? "Active Plan"
                    : isActivatingPlan === plan.id
                      ? "Activating..."
                      : plan.cta}
                </Button>

                <div className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-muted-foreground/50 flex-shrink-0" />
                      )}
                      <span className={cn(
                        "text-sm",
                        !feature.included && "text-muted-foreground/50"
                      )}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything You Need to Excel</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Premium members get access to our complete suite of AI-powered tools and exclusive features.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Bot, title: "AI Analysis", description: "Get move-by-move analysis and improvement tips" },
              { icon: Puzzle, title: "Tactical Puzzles", description: "Train with unlimited AI-generated puzzles" },
              { icon: BarChart3, title: "Deep Statistics", description: "Track every aspect of your performance" },
              { icon: Palette, title: "Premium Themes", description: "Customize with exclusive board designs" },
              { icon: Zap, title: "Priority Matching", description: "Find opponents faster with priority queue" },
              { icon: Shield, title: "Ad-Free Experience", description: "Focus on your game without distractions" },
              { icon: HeadphonesIcon, title: "Priority Support", description: "Get help from our team within hours" },
              { icon: Trophy, title: "Tournament Access", description: "Enter exclusive premium tournaments" },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="p-6 rounded-2xl border border-border bg-card hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Loved by Players Worldwide</h2>
            <p className="text-muted-foreground">See what our premium members have to say</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 rounded-2xl border border-border bg-card"
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6">{testimonial.content}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-medium">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="p-6 rounded-2xl border border-border bg-card"
              >
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-muted-foreground">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-12 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/20 border border-primary/20"
          >
            <Crown className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Ready to Level Up?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of players who have transformed their game with Checkers AI Premium.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground">
                Start 7-Day Free Trial
              </Button>
              <Link href="/play">
                <Button size="lg" variant="outline" className="rounded-xl">
                  Try Free Version
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
