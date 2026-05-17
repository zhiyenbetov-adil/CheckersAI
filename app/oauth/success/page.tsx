"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"

export default function OAuthSuccessPage() {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.email) return
    void (async () => {
      const query = `email=${encodeURIComponent(session.user?.email || "")}`
      const res = await fetch(`/api/profile/summary?${query}`)
      if (!res.ok) {
        window.location.href = "/login"
        return
      }
      const payload = await res.json()
      localStorage.setItem("checkers_auth_user", JSON.stringify(payload.user))
      window.location.href = "/play"
    })()
  }, [session?.user?.email, status])

  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
      Completing sign in...
    </main>
  )
}

