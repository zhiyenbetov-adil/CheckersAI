"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { 
  ChevronLeft,
  CreditCard,
  Lock,
  Check,
  Crown
} from "lucide-react"
import { cn } from "@/lib/utils"

const plans = [
  { id: "premium", name: "Premium", price: { monthly: 9.99, yearly: 79.99 } },
  { id: "pro", name: "Pro", price: { monthly: 19.99, yearly: 159.99 } },
]

export default function CheckoutPage() {
  const [selectedPlan, setSelectedPlan] = useState("premium")
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly")
  const [isProcessing, setIsProcessing] = useState(false)

  const currentPlan = plans.find((p) => p.id === selectedPlan) || plans[0]
  const price = billingCycle === "yearly" ? currentPlan.price.yearly : currentPlan.price.monthly

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    // Simulate processing
    setTimeout(async () => {
      const rawUser = localStorage.getItem("checkers_auth_user")
      if (rawUser) {
        try {
          const user = JSON.parse(rawUser) as { email: string; id: string; name: string }
          const months = billingCycle === "yearly" ? 12 : 1
          const response = await fetch("/api/subscription/activate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: user.email, months, plan: selectedPlan }),
          })
          const data = await response.json()
          if (response.ok) {
            const updated = {
              ...user,
              premiumUntil: data.premium.premiumUntil,
              subscriptionTier: data.premium.subscriptionTier,
            }
            localStorage.setItem("checkers_auth_user", JSON.stringify(updated))
          }
          await fetch("/api/log/client", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user.id,
              email: user.email,
              action: "subscription.checkout.completed",
              details: { plan: selectedPlan, billingCycle, total: price },
            }),
          })
        } catch {}
      }
      setIsProcessing(false)
      window.location.href = "/premium"
    }, 2000)
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/premium" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to plans
          </Link>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-border bg-card p-8"
              >
                <h1 className="text-2xl font-bold mb-6">Complete Your Purchase</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Plan Selection */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Select Plan</label>
                    <div className="grid grid-cols-2 gap-3">
                      {plans.map((plan) => (
                        <button
                          key={plan.id}
                          type="button"
                          onClick={() => setSelectedPlan(plan.id)}
                          className={cn(
                            "p-4 rounded-xl border text-left transition-all",
                            selectedPlan === plan.id
                              ? "border-primary bg-primary/5 ring-2 ring-primary"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          <div className="font-semibold">{plan.name}</div>
                          <div className="text-sm text-muted-foreground">
                            ${billingCycle === "yearly" ? plan.price.yearly : plan.price.monthly}
                            /{billingCycle === "yearly" ? "year" : "month"}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Billing Cycle */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Billing Cycle</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setBillingCycle("monthly")}
                        className={cn(
                          "p-4 rounded-xl border text-left transition-all",
                          billingCycle === "monthly"
                            ? "border-primary bg-primary/5 ring-2 ring-primary"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <div className="font-semibold">Monthly</div>
                        <div className="text-sm text-muted-foreground">Billed monthly</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setBillingCycle("yearly")}
                        className={cn(
                          "p-4 rounded-xl border text-left transition-all relative",
                          billingCycle === "yearly"
                            ? "border-primary bg-primary/5 ring-2 ring-primary"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <span className="absolute -top-2 right-2 px-2 py-0.5 rounded-full bg-green-500 text-white text-xs font-medium">
                          Save 33%
                        </span>
                        <div className="font-semibold">Yearly</div>
                        <div className="text-sm text-muted-foreground">Billed annually</div>
                      </button>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {/* Card Details */}
                  <div className="space-y-4">
                    <label className="text-sm font-medium">Payment Details</label>
                    <div className="space-y-3">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Card number"
                          required
                          className="w-full px-4 py-3 pl-12 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="MM / YY"
                          required
                          className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <input
                          type="text"
                          placeholder="CVC"
                          required
                          className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Name on Card */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name on Card</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Pay ${price.toFixed(2)}
                      </span>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    By confirming your subscription, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </form>
              </motion.div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl border border-border bg-card p-6 sticky top-24"
              >
                <h2 className="font-semibold mb-4">Order Summary</h2>

                <div className="p-4 rounded-xl bg-muted/50 mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Crown className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{currentPlan.name}</div>
                      <div className="text-sm text-muted-foreground capitalize">{billingCycle} billing</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${price.toFixed(2)}</span>
                  </div>
                  {billingCycle === "yearly" && (
                    <div className="flex justify-between text-green-500">
                      <span>Yearly discount</span>
                      <span>-${((currentPlan.price.monthly * 12) - price).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>$0.00</span>
                  </div>
                </div>

                <div className="border-t border-border pt-4 mb-6">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${price.toFixed(2)}</span>
                  </div>
                  {billingCycle === "yearly" && (
                    <div className="text-xs text-muted-foreground mt-1">
                      ${(price / 12).toFixed(2)}/month
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Check className="w-4 h-4 text-green-500" />
                    7-day free trial included
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Check className="w-4 h-4 text-green-500" />
                    Cancel anytime
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Lock className="w-4 h-4" />
                    Secure payment
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
