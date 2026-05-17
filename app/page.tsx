import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/sections/hero-section"
import { BoardCustomizationSection } from "@/components/sections/board-customization-section"
import { LearningSection } from "@/components/sections/learning-section"
import { AICoachSection } from "@/components/sections/ai-coach-section"
import { PremiumSection } from "@/components/sections/premium-section"
import { CommunitySection } from "@/components/sections/community-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <BoardCustomizationSection />
      <LearningSection />
      <AICoachSection />
      <PremiumSection />
      <CommunitySection />
      <Footer />
    </main>
  )
}
