"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowRight, Lock, Mail, User } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { signIn } from "next-auth/react"

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || "Unable to create account.")
        return
      }
      localStorage.setItem("checkers_auth_user", JSON.stringify(data.user))
      await fetch("/api/log/client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: data.user.id, email: data.user.email, action: "page.signup.success" }),
      })
      router.push("/play")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="min-h-screen flex items-center justify-center px-4 py-24">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <h1 className="mb-2 text-2xl font-bold">Create your account</h1>
          <p className="mb-6 text-muted-foreground">Register to track progress and play online with friends.</p>
          <div className="rounded-2xl border border-border bg-card p-8">
            <form onSubmit={submit} className="space-y-4">
              <label className="block text-sm font-medium">Name</label>
              <div className="relative"><User className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" /><input value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-3" /></div>
              <label className="block text-sm font-medium">Email</label>
              <div className="relative"><Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" /><input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-3" /></div>
              <label className="block text-sm font-medium">Password</label>
              <div className="relative"><Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" /><input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-3" /></div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button className="h-12 w-full rounded-xl bg-primary" type="submit" disabled={loading}>
                {loading ? "Creating..." : <>Sign Up <ArrowRight className="ml-2 h-4 w-4" /></>}
              </Button>
            </form>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="rounded-xl h-12" type="button" onClick={() => void signIn("google", { callbackUrl: "/oauth/success" })}>
                Google
              </Button>
              <Button variant="outline" className="rounded-xl h-12" type="button" onClick={() => void signIn("github", { callbackUrl: "/oauth/success" })}>
                GitHub
              </Button>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Already have an account? <Link href="/login" className="text-primary">Log in</Link>
          </p>
        </motion.div>
      </div>
    </main>
  )
}
