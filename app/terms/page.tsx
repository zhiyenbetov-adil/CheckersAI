import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="mx-auto max-w-3xl px-4 py-32">
        <h1 className="mb-6 text-3xl font-bold">Terms of Service</h1>
        <p className="mb-4 text-muted-foreground">By using Checkers AI, you agree to respectful use, fair play, and no abuse of matchmaking or room features.</p>
        <p className="mb-4 text-muted-foreground">We may suspend accounts for cheating, harassment, or attempts to disrupt the service.</p>
        <p className="text-muted-foreground">Features can evolve over time as the product improves.</p>
      </section>
      <Footer />
    </main>
  )
}
