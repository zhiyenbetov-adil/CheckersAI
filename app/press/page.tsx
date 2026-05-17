import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function PressPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="mx-auto max-w-3xl px-4 py-32">
        <h1 className="mb-4 text-3xl font-bold">Press Kit</h1>
        <p className="mb-3 text-muted-foreground">For media mentions, product updates, and brand assets, contact us through the support chat on the website.</p>
        <p className="text-muted-foreground">Brand name: Checkers AI. Product focus: checkers training and online play.</p>
      </section>
      <Footer />
    </main>
  )
}
