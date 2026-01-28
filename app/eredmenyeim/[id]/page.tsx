"use client"

import { useEffect, useState, use } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { SignatureLookResults } from "@/components/signature-look-results"
import { RatingForm } from "@/components/rating-form"
import type { AnalysisObservations, MakeupLook, AnalysisToggles } from "@/lib/db/schema"
import { useLanguage } from "@/components/language-provider"

interface AnalysisData {
  id: string
  status: string
  occasion: string
  toggles: AnalysisToggles
  beforeImageUrl: string | null
  observations: AnalysisObservations | null
  looks: MakeupLook[] | null
  afterImages: string[] | null
  createdAt: string
  completedAt: string | null
  isOwned: boolean
}

export default function AnalysisDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const { language } = useLanguage()
  const t = (hu: string, en: string) => (language === "hu" ? hu : en)
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push(`/bejelentkezes?callbackUrl=/eredmenyeim/${id}`)
    }
  }, [authStatus, router, id])

  useEffect(() => {
    if (authStatus === "authenticated" && id) {
      fetchAnalysis()
    }
  }, [authStatus, id])

  const fetchAnalysis = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/analysis/${id}`)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Nem sikerült betölteni az elemzést.")
      }
      const data = await res.json()
      setAnalysis(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ismeretlen hiba történt.")
    } finally {
      setIsLoading(false)
    }
  }

  if (authStatus === "loading" || isLoading) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-background pt-16">
          <div className="container mx-auto max-w-4xl px-4 py-12">
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[#B78C86]" />
            </div>
          </div>
        </main>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-background pt-16">
          <div className="container mx-auto max-w-4xl px-4 py-12">
            <GlassCard className="text-center py-12">
              <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {t("Hiba történt", "An error occurred")}
              </h3>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Link href="/eredmenyeim">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t("Vissza az elemzésekhez", "Back to analyses")}
                </Button>
              </Link>
            </GlassCard>
          </div>
        </main>
      </>
    )
  }

  if (!analysis) {
    return null
  }

  // Handle non-complete statuses
  if (analysis.status !== "complete") {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-background pt-16">
          <div className="container mx-auto max-w-4xl px-4 py-12">
            <div className="mb-6">
              <Link
                href="/eredmenyeim"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("Vissza az elemzésekhez", "Back to analyses")}
              </Link>
            </div>

            <GlassCard className="text-center py-12">
              {analysis.status === "processing" || analysis.status === "paid" ? (
                <>
                  <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-[#B78C86]" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    {t("Elemzés folyamatban", "Analysis in progress")}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {t(
                      "Az AI éppen dolgozik a személyre szabott javaslataidon. Ez általában 1-2 percig tart.",
                      "The AI is working on your personalized recommendations. This usually takes 1–2 minutes."
                    )}
                  </p>
                  <Button onClick={fetchAnalysis} variant="outline">
                    {t("Frissítés", "Refresh")}
                  </Button>
                </>
              ) : analysis.status === "failed" ? (
                <>
                  <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    {t("Az elemzés sikertelen volt", "The analysis failed")}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {t(
                      "Sajnáljuk, hiba történt az elemzés során. Kérjük, próbáld újra vagy lépj kapcsolatba velünk.",
                      "Sorry, something went wrong during the analysis. Please try again or contact us."
                    )}
                  </p>
                </>
              ) : (
                <>
                  <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    {t("Elemzés várakozik", "Analysis pending")}
                  </h3>
                  <p className="text-muted-foreground">
                    {t("Ez az elemzés még nincs feldolgozva.", "This analysis hasn't been processed yet.")}
                  </p>
                </>
              )}
            </GlassCard>
          </div>
        </main>
      </>
    )
  }

  // Get the primary look (first one, or the one marked as primary)
  const primaryLook = analysis.looks?.[0]

  if (!analysis.observations || !primaryLook || !analysis.beforeImageUrl) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-background pt-16">
          <div className="container mx-auto max-w-4xl px-4 py-12">
            <GlassCard className="text-center py-12">
              <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {t("Hiányos adatok", "Incomplete data")}
              </h3>
              <p className="text-muted-foreground mb-6">
                {t("Az elemzés adatai hiányosak.", "The analysis data is incomplete.")}
              </p>
              <Link href="/eredmenyeim">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t("Vissza az elemzésekhez", "Back to analyses")}
                </Button>
              </Link>
            </GlassCard>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background pt-16">
        <div className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
          {/* Back link - subtle */}
          <div className="mb-8">
            <Link
              href="/eredmenyeim"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("Vissza az elemzésekhez", "Back to analyses")}
            </Link>
          </div>

          {/* Signature Look Results */}
          <SignatureLookResults
            sessionId={analysis.id}
            observations={analysis.observations}
            look={primaryLook}
            beforeImageUrl={analysis.beforeImageUrl}
            isLoggedIn={!!session?.user}
          />

          {/* Rating Form */}
          <div className="mt-8">
            <RatingForm analysisId={analysis.id} />
          </div>
        </div>
      </main>
    </>
  )
}
