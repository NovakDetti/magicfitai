import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { QuickPreview } from "@/components/quick-preview"
import { PhotoTipsSection } from "@/components/photo-tips-section"
import { AIAnalysisSection } from "@/components/ai-analysis-section"
import { MakeupStylesSection } from "@/components/makeup-styles-section"
import { HowItWorks } from "@/components/how-it-works"
import { PricingPreview } from "@/components/pricing-preview"
import { FAQSection } from "@/components/faq-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen pt-16">
        <HeroSection />
        <QuickPreview />
        <PhotoTipsSection />
        <AIAnalysisSection />
        <MakeupStylesSection />
        <HowItWorks />
        <PricingPreview />
        <FAQSection />
        <Footer />
      </main>
    </>
  )
}
