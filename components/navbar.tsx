"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import { usePathname } from "next/navigation"
import { 
  Menu, 
  X, 
  Sun, 
  Moon,
  Crown,
  User
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/play", label: "Play" },
  { href: "/learn", label: "Learn" },
  { href: "/ai-coach", label: "AI Coach" },
  { href: "/leaderboards", label: "Leaderboards" },
  { href: "/premium", label: "Premium", isPremium: true },
]

export function Navbar() {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [authName, setAuthName] = useState<string | null>(null)
  const isPlaySection = pathname.startsWith("/play") || pathname.startsWith("/room/")

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const readUser = () => {
      try {
        const raw = localStorage.getItem("checkers_auth_user")
        if (!raw) {
          setAuthName(null)
          return
        }
        const parsed = JSON.parse(raw) as { name?: string; email?: string }
        const fallback = parsed.email?.split("@")[0]
        setAuthName(parsed.name?.trim() || fallback || null)
      } catch {
        setAuthName(null)
      }
    }
    readUser()
    window.addEventListener("storage", readUser)
    return () => window.removeEventListener("storage", readUser)
  }, [])

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled 
            ? "bg-background/80 backdrop-blur-xl border-b border-border shadow-sm" 
            : "bg-transparent"
        )}
      >
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg group-hover:shadow-primary/30 transition-shadow">
                  <div className="w-5 h-5 rounded-full bg-primary-foreground" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-accent border-2 border-background" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                Checkers<span className="text-primary"> AI</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                    link.isPremium 
                      ? "text-primary hover:bg-primary/10" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {link.isPremium && <Crown className="inline w-4 h-4 mr-1" />}
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-lg"
              >
                {mounted && (theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />)}
              </Button>
              {authName ? (
                <Link href="/profile">
                  <Button variant="ghost" className="rounded-lg flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {authName}
                  </Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button variant="ghost" className="rounded-lg">
                    Log In
                  </Button>
                </Link>
              )}
              {!isPlaySection && (
                <Link href="/play">
                  <Button className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                    Play Now
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex lg:hidden items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-lg"
              >
                {mounted && (theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />)}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="rounded-lg"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-16 z-40 lg:hidden"
          >
            <div className="bg-background/95 backdrop-blur-xl border-b border-border shadow-xl">
              <div className="px-4 py-6 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center px-4 py-3 text-base font-medium rounded-xl transition-colors",
                      link.isPremium 
                        ? "text-primary bg-primary/5" 
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    {link.isPremium && <Crown className="w-5 h-5 mr-2" />}
                    {link.label}
                  </Link>
                ))}
                <div className="pt-4 border-t border-border space-y-2">
                  {authName ? (
                    <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full rounded-xl flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {authName}
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full rounded-xl">
                        Log In
                      </Button>
                    </Link>
                  )}
                  {!isPlaySection && (
                    <Link href="/play" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground">
                        Play Now
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
