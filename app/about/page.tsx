import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="mx-auto max-w-3xl px-4 py-32">
        <h1 className="mb-4 text-3xl font-bold">About Checkers AI</h1>
        <p className="text-muted-foreground">
          Checkers AI is a practical training platform focused on real game improvement: playable matches, lesson-based learning, and AI-assisted post-game feedback.
        </p>
      </section>
      <Footer />
    </main>
  )
}
