import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="mx-auto max-w-3xl px-4 py-32">
        <h1 className="mb-4 text-3xl font-bold">Help Center</h1>
        <ul className="space-y-3 text-muted-foreground">
          <li>· Create a room in Play with Friend and share the code.</li>
          <li>· Join from another device using the same network URL.</li>
          <li>· Watch lesson cards in Learn to increase real progress.</li>
          <li>· Open AI Coach to get post-game analysis (3 free reviews).</li>
        </ul>
      </section>
      <Footer />
    </main>
  )
}
