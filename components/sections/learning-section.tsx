"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
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
  Zap
} from "lucide-react"
import { cn } from "@/lib/utils"

const learningPaths = [
  { id: "beginner", name: "Beginner", icon: BookOpen, color: "text-green-500", bg: "bg-green-500/10" },
  { id: "intermediate", name: "Intermediate", icon: Target, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  { id: "advanced", name: "Advanced", icon: Zap, color: "text-red-500", bg: "bg-red-500/10" },
]

const lessons = [
  {
    id: 1,
    title: "Introduction to Checkers",
    description: "Learn the basic rules and setup of the game",
    thumbnail: "/lessons/intro.jpg",
    duration: "5:32",
    views: "12.4K",
    difficulty: "beginner",
    isFree: true,
    youtubeUrl: "https://www.youtube.com/watch?v=MOW9k_C4vFU",
  },
  {
    id: 2,
    title: "Basic Movement & Captures",
    description: "Master the fundamentals of piece movement",
    thumbnail: "/lessons/movement.jpg",
    duration: "8:15",
    views: "9.8K",
    difficulty: "beginner",
    isFree: true,
    youtubeUrl: "https://www.youtube.com/watch?v=jxpIk7irvUE",
  },
  {
    id: 3,
    title: "King Me! Promotion Strategies",
    description: "Learn when and how to promote your pieces",
    thumbnail: "/lessons/king.jpg",
    duration: "10:20",
    views: "7.2K",
    difficulty: "beginner",
    isFree: true,
    youtubeUrl: "https://www.youtube.com/watch?v=zNCS0vnTyVg",
  },
  {
    id: 4,
    title: "Opening Principles",
    description: "Start your games with a strong foundation",
    thumbnail: "/lessons/opening.jpg",
    duration: "12:45",
    views: "5.1K",
    difficulty: "intermediate",
    isFree: true,
    youtubeUrl: "https://www.youtube.com/watch?v=JVDy_WStUNE",
  },
  {
    id: 5,
    title: "Advanced Tactics & Combinations",
    description: "Master multi-piece captures and sacrifices",
    thumbnail: "/lessons/tactics.jpg",
    duration: "15:30",
    views: "3.9K",
    difficulty: "advanced",
    isFree: true,
    youtubeUrl: "https://www.youtube.com/watch?v=_DP_3_zHiKk",
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

export function LearningSection() {
  const [watchedLessons, setWatchedLessons] = useState<number[]>([])

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

  const markLessonWatched = (lessonId: number) => {
    setWatchedLessons((prev) => {
      if (prev.includes(lessonId)) return prev
      const next = [...prev, lessonId]
      localStorage.setItem("checkers_watched_lessons", JSON.stringify(next))
      return next
    })
  }

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
            <GraduationCap className="w-4 h-4" />
            Structured Learning
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-balance">
            Learn at Your Own Pace
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            From beginner basics to advanced strategies, our comprehensive lessons will take your game to the next level.
          </p>
        </motion.div>

        {/* Learning Paths */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {learningPaths.map((path) => (
            <button
              key={path.id}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all",
                "border border-border hover:border-primary/50 hover:bg-muted"
              )}
            >
              <div className={cn("p-2 rounded-lg", path.bg)}>
                <path.icon className={cn("w-4 h-4", path.color)} />
              </div>
              {path.name}
            </button>
          ))}
        </motion.div>

        {/* Lesson Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson, index) => {
            const levelInfo = getLevelInfo(lesson.difficulty)
            
            return (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <a
                  href={lesson.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => markLessonWatched(lesson.id)}
                >
                  <div className={cn(
                    "group relative rounded-2xl overflow-hidden border border-border bg-card transition-all duration-300",
                    "hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30"
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
                          <Play className="w-6 h-6 text-primary ml-1" />
                        </div>
                      </div>
                      
                      {/* Duration badge */}
                      <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-background/80 backdrop-blur text-xs font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {lesson.duration}
                      </div>

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
                      <p className="text-sm text-muted-foreground mb-4">
                        {lesson.description}
                      </p>

                      {/* Progress */}
                      {lesson.isFree && (
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
                </a>
              </motion.div>
            )
          })}
        </div>

        {/* View All CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link href="/learn">
            <Button variant="outline" size="lg" className="rounded-xl">
              View All Lessons
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
