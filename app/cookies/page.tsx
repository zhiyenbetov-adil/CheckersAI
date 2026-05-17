import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="mx-auto max-w-3xl px-4 py-32">
        <h1 className="mb-6 text-3xl font-bold">Cookie Policy</h1>
        <p className="mb-4 text-muted-foreground">Checkers AI uses essential cookies and local storage to keep sessions, room IDs, and lesson progress.</p>
        <p className="mb-4 text-muted-foreground">These cookies help us keep gameplay stable and remember your settings.</p>
        <p className="text-muted-foreground">You can clear browser cookies and local storage anytime.</p>
      </section>
      <Footer />
    </main>
  )
}
