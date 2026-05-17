"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  GraduationCap, 
  Play, 
  Clock,
  Eye,
  CheckCircle,
  ChevronRight,
  BookOpen,
  Target,
  Zap,
  Lock,
  Crown
} from "lucide-react"
import { cn } from "@/lib/utils"

const categories = [
  { id: "all", name: "All Lessons" },
  { id: "beginner", name: "Beginner", icon: BookOpen, color: "text-green-500" },
  { id: "intermediate", name: "Intermediate", icon: Target, color: "text-yellow-500" },
  { id: "advanced", name: "Advanced", icon: Zap, color: "text-red-500" },
]

const lessons = [
  {
    id: 1,
    title: "Introduction to Checkers",
    description: "Learn the basic rules, board setup, and fundamental concepts of the game",
    duration: "5:32",
    views: "12.4K",
    difficulty: "beginner",
    progress: 100,
    isComplete: true,
    isFree: true,
    topics: ["Rules", "Board Setup", "Basic Movement"],
    youtubeUrl: "https://www.youtube.com/watch?v=MOW9k_C4vFU",
  },
  {
    id: 2,
    title: "Basic Movement & Captures",
    description: "Master the fundamentals of piece movement and single captures",
    duration: "8:15",
    views: "9.8K",
    difficulty: "beginner",
    progress: 75,
    isComplete: false,
    isFree: true,
    topics: ["Diagonal Movement", "Single Captures", "Forced Captures"],
    youtubeUrl: "https://www.youtube.com/watch?v=jxpIk7irvUE",
  },
  {
    id: 3,
    title: "King Me! Promotion Strategies",
    description: "Learn when and how to promote your pieces for maximum advantage",
    duration: "10:20",
    views: "7.2K",
    difficulty: "beginner",
    progress: 30,
    isComplete: false,
    isFree: true,
    topics: ["Promotion Rules", "King Power", "Strategic Positioning"],
    youtubeUrl: "https://www.youtube.com/watch?v=zNCS0vnTyVg",
  },
  {
    id: 4,
    title: "Opening Principles",
    description: "Start your games with a solid foundation using proven opening strategies",
    duration: "12:45",
    views: "5.1K",
    difficulty: "intermediate",
    progress: 0,
    isComplete: false,
    isFree: false,
    topics: ["Center Control", "Development", "Common Openings"],
    youtubeUrl: "https://www.youtube.com/watch?v=JVDy_WStUNE",
  },
  {
    id: 5,
    title: "Middle Game Strategy",
    description: "Navigate the complex middle game with confidence and tactical awareness",
    duration: "15:30",
    views: "4.2K",
    difficulty: "intermediate",
    progress: 0,
    isComplete: false,
    isFree: false,
    topics: ["Piece Exchanges", "Position Evaluation", "Planning"],
    youtubeUrl: "https://www.youtube.com/watch?v=FRg-QBjaN7E",
  },
  {
    id: 6,
    title: "Endgame Fundamentals",
    description: "Convert your advantages into wins with essential endgame techniques",
    duration: "14:00",
    views: "3.8K",
    difficulty: "intermediate",
    progress: 0,
    isComplete: false,
    isFree: false,
    topics: ["King vs Pieces", "Opposition", "Winning Positions"],
    youtubeUrl: "https://www.youtube.com/watch?v=t3R2DvXhraI",
  },
  {
    id: 7,
    title: "Advanced Tactics & Combinations",
    description: "Master multi-piece captures, sacrifices, and tactical patterns",
    duration: "18:20",
    views: "2.9K",
    difficulty: "advanced",
    progress: 0,
    isComplete: false,
    isFree: false,
    topics: ["Double Jumps", "Sacrifices", "Tactical Motifs"],
    youtubeUrl: "https://www.youtube.com/watch?v=_DP_3_zHiKk",
  },
  {
    id: 8,
    title: "Positional Mastery",
    description: "Understand deep positional concepts used by grandmasters",
    duration: "20:00",
    views: "2.1K",
    difficulty: "advanced",
    progress: 0,
    isComplete: false,
    isFree: false,
    topics: ["Weak Squares", "Piece Activity", "Long-term Planning"],
    youtubeUrl: "https://www.youtube.com/watch?v=UCbCOHdreUw",
  },
]

function getYoutubeThumbnail(url: string): string {
  const matched = url.match(/[?&]v=([^&#]+)/)
  const id = matched?.[1]
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "/placeholder.jpg"
}

function getLevelInfo(difficulty: string) {
  switch (difficulty) {
    case "beginner":
      return { color: "text-green-500", bg: "bg-green-500/10", label: "Beginner" }
    case "intermediate":
      return { color: "text-yellow-500", bg: "bg-yellow-500/10", label: "Intermediate" }
    case "advanced":
      return { color: "text-red-500", bg: "bg-red-500/10", label: "Advanced" }
    default:
      return { color: "text-muted-foreground", bg: "bg-muted", label: "Unknown" }
  }
}

export default function LearnPage() {
  const [activeCategory, setActiveCategory] = useState("all")
  const [watchedLessons, setWatchedLessons] = useState<number[]>([])
  const [isPremiumUser, setIsPremiumUser] = useState(false)
  const [activeVideo, setActiveVideo] = useState<{ url: string; title: string } | null>(null)

  useEffect(() => {
    const raw = localStorage.getItem("checkers_watched_lessons")
    if (!raw) return
    try {
      const parsed = JSON.parse(raw) as number[]
      setWatchedLessons(Array.isArray(parsed) ? parsed : [])
    } catch {
      setWatchedLessons([])
    }
  }, [])

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

  const markLessonWatched = (lessonId: number) => {
    setWatchedLessons((prev) => {
      if (prev.includes(lessonId)) return prev
      const next = [...prev, lessonId]
      localStorage.setItem("checkers_watched_lessons", JSON.stringify(next))
      return next
    })
  }

  const filteredLessons = activeCategory === "all" 
    ? lessons 
    : lessons.filter(l => l.difficulty === activeCategory)

  const freeLessons = useMemo(() => lessons.filter((l) => l.isFree), [])
  const completedFreeLessons = watchedLessons.filter((id) => freeLessons.some((l) => l.id === id)).length
  const totalProgress = freeLessons.length
    ? Math.round((completedFreeLessons / freeLessons.length) * 100)
    : 0

  const getEmbedUrl = (url: string): string => {
    const matched = url.match(/[?&]v=([^&#]+)/)
    const id = matched?.[1]
    return id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : url
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      {/* Header */}
      <section className="pt-32 pb-8 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <GraduationCap className="w-4 h-4" />
              Learning Center
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Master Checkers</h1>
            <p className="text-lg text-muted-foreground mb-6">
              Structured lessons from beginner basics to advanced strategies. Learn at your own pace with our AI-powered curriculum.
            </p>
            
            {/* Progress Overview */}
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Your Progress</span>
                <span className="text-sm text-muted-foreground">{totalProgress}% Complete</span>
              </div>
              <Progress value={totalProgress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {completedFreeLessons} of {freeLessons.length} free lessons completed
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-6 border-b border-border sticky top-16 lg:top-20 bg-background z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto pb-2 -mb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                  activeCategory === category.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                )}
              >
                {category.icon && <category.icon className={cn("w-4 h-4", activeCategory === category.id ? "" : category.color)} />}
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Lessons Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLessons.map((lesson, index) => {
              const levelInfo = getLevelInfo(lesson.difficulty)
              
              return (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      const hasAccess = lesson.isFree || isPremiumUser
                      if (!hasAccess) {
                        window.location.href = "/premium"
                        return
                      }
                      markLessonWatched(lesson.id)
                      setActiveVideo({ url: lesson.youtubeUrl, title: lesson.title })
                    }}
                    className="w-full text-left"
                  >
                    <div className={cn(
                      "group relative rounded-2xl overflow-hidden border border-border bg-card transition-all duration-300",
                      "hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30",
                      !(lesson.isFree || isPremiumUser) && "opacity-80"
                    )}>
                      {/* Thumbnail */}
                      <div className="relative aspect-video bg-muted overflow-hidden">
                        <img
                          src={getYoutubeThumbnail(lesson.youtubeUrl)}
                          alt={lesson.title}
                          className="absolute inset-0 h-full w-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <div className="w-16 h-16 rounded-2xl bg-card/90 backdrop-blur flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            {lesson.isFree || isPremiumUser ? (
                              <Play className="w-6 h-6 text-primary ml-1" />
                            ) : (
                              <Lock className="w-6 h-6 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                        
                        {/* Duration badge */}
                        <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-background/80 backdrop-blur text-xs font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {lesson.duration}
                        </div>

                        {/* Lock overlay */}
                        {!(lesson.isFree || isPremiumUser) && (
                          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                            <div className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2">
                              <Crown className="w-4 h-4" />
                              Premium
                            </div>
                          </div>
                        )}

                        {/* Complete badge */}
                        {watchedLessons.includes(lesson.id) && (
                          <div className="absolute top-2 right-2">
                            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                              <CheckCircle className="w-5 h-5 text-white" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={cn(
                            "text-xs font-medium px-2 py-1 rounded-md",
                            levelInfo.bg,
                            levelInfo.color
                          )}>
                            {levelInfo.label}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {lesson.views}
                          </span>
                        </div>

                        <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                          {lesson.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {lesson.description}
                        </p>

                        {/* Topics */}
                        <div className="flex flex-wrap gap-1 mb-4">
                          {lesson.topics.slice(0, 3).map((topic) => (
                            <span key={topic} className="text-xs px-2 py-0.5 rounded-full bg-muted">
                              {topic}
                            </span>
                          ))}
                        </div>

                        {/* Progress */}
                        {(lesson.isFree || isPremiumUser) && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">{watchedLessons.includes(lesson.id) ? "100%" : "0%"}</span>
                            </div>
                            <Progress value={watchedLessons.includes(lesson.id) ? 100 : 0} className="h-1.5" />
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                </motion.div>
              )
            })}
          </div>

          {/* Unlock Premium CTA */}
          {!isPremiumUser && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-12 p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/20 border border-primary/20 text-center"
            >
              <Crown className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Unlock All Lessons</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Get unlimited access to all lessons, AI coaching, and advanced training with Premium.
              </p>
              <Link href="/premium">
                <Button className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground">
                  Upgrade to Premium
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </motion.div>
          )}
        </div>
      </section>

      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-2xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between gap-4">
              <h3 className="text-base font-semibold">{activeVideo.title}</h3>
              <Button variant="outline" size="sm" className="rounded-lg" onClick={() => setActiveVideo(null)}>
                Close
              </Button>
            </div>
            <div className="aspect-video overflow-hidden rounded-xl border border-border">
              <iframe
                src={getEmbedUrl(activeVideo.url)}
                title={activeVideo.title}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  )
}
