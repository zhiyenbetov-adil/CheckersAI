import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="mx-auto max-w-3xl px-4 py-32">
        <h1 className="mb-4 text-3xl font-bold">Contact</h1>
        <p className="mb-3 text-muted-foreground">The fastest way to reach us is the orange support chat button in the bottom-right corner.</p>
        <p className="text-muted-foreground">Please include the page where the issue happens and what action you were trying to perform.</p>
      </section>
      <Footer />
    </main>
  )
}
