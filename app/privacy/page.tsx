import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="mx-auto max-w-3xl px-4 py-32">
        <h1 className="mb-6 text-3xl font-bold">Privacy Policy</h1>
        <p className="mb-4 text-muted-foreground">We collect account data, lesson progress, and gameplay room data to provide Checkers AI features.</p>
        <p className="mb-4 text-muted-foreground">We do not sell personal data. Data is used for authentication, game synchronization, and learning progress.</p>
        <p className="text-muted-foreground">If you need account or data deletion, contact support from the in-app support chat.</p>
      </section>
      <Footer />
    </main>
  )
}
