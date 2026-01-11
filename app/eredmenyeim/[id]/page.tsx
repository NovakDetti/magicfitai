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
import type { AnalysisObservations, MakeupLook, AnalysisToggles } from "@/lib/db/schema"

interface AnalysisData {
  id: string
  status: string
  occasion: string
  toggles: AnalysisToggles
  beforeImageUrl: string | null
  observations: AnalysisObservations | null
  looks: MakeupLook[] | null
  afterImages: string[] | null
  pdfUrl: string | null
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
                Hiba történt
              </h3>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Link href="/eredmenyeim">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Vissza az elemzésekhez
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
                Vissza az elemzésekhez
              </Link>
            </div>

            <GlassCard className="text-center py-12">
              {analysis.status === "processing" || analysis.status === "paid" ? (
                <>
                  <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-[#B78C86]" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Elemzés folyamatban
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Az AI éppen dolgozik a személyre szabott javaslataidon. Ez
                    általában 1-2 percig tart.
                  </p>
                  <Button onClick={fetchAnalysis} variant="outline">
                    Frissítés
                  </Button>
                </>
              ) : analysis.status === "failed" ? (
                <>
                  <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Az elemzés sikertelen volt
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Sajnáljuk, hiba történt az elemzés során. Kérjük, próbáld
                    újra vagy lépj kapcsolatba velünk.
                  </p>
                </>
              ) : (
                <>
                  <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Elemzés várakozik
                  </h3>
                  <p className="text-muted-foreground">
                    Ez az elemzés még nincs feldolgozva.
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
                Hiányos adatok
              </h3>
              <p className="text-muted-foreground mb-6">
                Az elemzés adatai hiányosak.
              </p>
              <Link href="/eredmenyeim">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Vissza az elemzésekhez
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
              Vissza az elemzésekhez
            </Link>
          </div>

          {/* Signature Look Results */}
          <SignatureLookResults
            sessionId={analysis.id}
            observations={analysis.observations}
            look={primaryLook}
            beforeImageUrl={analysis.beforeImageUrl}
            pdfUrl={analysis.pdfUrl}
            isLoggedIn={!!session?.user}
          />
        </div>
      </main>
    </>
  )
}
