import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="mx-auto max-w-3xl px-4 py-32">
        <h1 className="mb-4 text-3xl font-bold">Blog</h1>
        <p className="mb-3 text-muted-foreground">This section shares short updates about new training modules, game improvements, and coaching quality updates.</p>
        <p className="text-muted-foreground">No posts yet. New updates will appear here.</p>
      </section>
      <Footer />
    </main>
  )
}
