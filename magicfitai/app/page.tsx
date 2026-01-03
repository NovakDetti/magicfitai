import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { QuickPreview } from "@/components/quick-preview"
import { HowItWorks } from "@/components/how-it-works"
import { TrustSection } from "@/components/trust-section"
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
        <HowItWorks />
        <TrustSection />
        <PricingPreview />
        <FAQSection />
        <Footer />
      </main>
    </>
  )
}
