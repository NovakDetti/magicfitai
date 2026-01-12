"use client"

import { useEffect, useState, use } from "react"
import { useSession, signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Save,
  Clock,
  CheckCircle,
} from "lucide-react"
import { Navigation } from "@/components/navigation"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { ResultsView } from "@/components/results-view"
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
  canClaim: boolean
}

export default function GuestResultPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = use(params)
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isClaiming, setIsClaiming] = useState(false)
  const [claimed, setClaimed] = useState(false)

  const paymentSuccess = searchParams.get("payment") === "success"

  useEffect(() => {
    if (token) {
      fetchAnalysis()
    }
  }, [token])

  // Poll for status after payment or while processing
  useEffect(() => {
    if (!analysis) return
    if (analysis.status === "complete" || analysis.status === "failed") return
    if (
      paymentSuccess ||
      analysis.status === "processing" ||
      analysis.status === "paid"
    ) {
      const interval = setInterval(fetchAnalysis, 3000)
      return () => clearInterval(interval)
    }
  }, [analysis, paymentSuccess])

  const fetchAnalysis = async () => {
    try {
      // Find the analysis by guest token
      const res = await fetch(`/api/analysis/by-token/${token}`)
      if (!res.ok) {
        const data = await res.json()
        if (data.expired) {
          setError("Ez az elemzés lejárt. A vendég eredmények 7 napig érhetők el.")
        } else {
          throw new Error(data.error || "Nem sikerült betölteni az elemzést.")
        }
        return
      }
      const data = await res.json()
      setAnalysis(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ismeretlen hiba történt.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClaim = async () => {
    if (!session?.user) {
      // Redirect to login with callback
      signIn(undefined, { callbackUrl: `/r/${token}` })
      return
    }

    setIsClaiming(true)
    try {
      const res = await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestToken: token }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Nem sikerült menteni az elemzést.")
      }

      const data = await res.json()
      setClaimed(true)

      // Redirect to the analysis page
      setTimeout(() => {
        router.push(`/eredmenyeim/${data.analysisId}`)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ismeretlen hiba történt.")
    } finally {
      setIsClaiming(false)
    }
  }

  const handleDownloadPdf = () => {
    if (analysis?.pdfUrl) {
      window.open(analysis.pdfUrl, "_blank")
    }
  }

  if (isLoading) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-background pt-16">
          <div className="container mx-auto max-w-5xl px-4 py-12">
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
          <div className="container mx-auto max-w-5xl px-4 py-12">
            <GlassCard className="text-center py-12">
              <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {error.includes("lejárt") ? "Lejárt elemzés" : "Hiba történt"}
              </h3>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Link href="/ai-sminkajanlo">
                <Button>Új elemzés készítése</Button>
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
          <div className="container mx-auto max-w-5xl px-4 py-12">
            <GlassCard className="text-center py-12">
              {analysis.status === "processing" || analysis.status === "paid" ? (
                <>
                  <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    {paymentSuccess
                      ? "Köszönjük a vásárlást!"
                      : "Elemzés folyamatban"}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Az AI éppen dolgozik a személyre szabott javaslataidon. Ez
                    általában 1-2 percig tart.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Az oldal automatikusan frissül...
                  </p>
                </>
              ) : analysis.status === "failed" ? (
                <>
                  <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Az elemzés sikertelen volt
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Sajnáljuk, hiba történt az elemzés során. Kérjük, lépj
                    kapcsolatba velünk a visszatérítésért.
                  </p>
                </>
              ) : paymentSuccess ? (
                <>
                  <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Fizetés feldolgozás alatt
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    A fizetés megerősítése folyamatban van. Ez általában néhány
                    másodperc.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Az oldal automatikusan frissül...
                  </p>
                </>
              ) : (
                <>
                  <Clock className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Fizetésre vár
                  </h3>
                  <p className="text-muted-foreground">
                    Ez az elemzés még nincs kifizetve.
                  </p>
                </>
              )}
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
        <div className="container mx-auto max-w-5xl px-4 py-12">
          {/* Claim CTA Banner */}
          {!analysis.isOwned && !claimed && (
            <GlassCard
              variant="elevated"
              className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Save className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">
                    Mentsd el fiókba
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {session?.user
                      ? "Az elemzés 7 nap után törlődik. Mentsd el a fiókodba!"
                      : "Jelentkezz be, hogy ne veszítsd el az elemzésedet!"}
                  </p>
                </div>
              </div>
              <Button onClick={handleClaim} disabled={isClaiming}>
                {isClaiming ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mentés...
                  </>
                ) : session?.user ? (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Mentés fiókba
                  </>
                ) : (
                  "Bejelentkezés és mentés"
                )}
              </Button>
            </GlassCard>
          )}

          {/* Claimed success message */}
          {claimed && (
            <GlassCard
              variant="elevated"
              className="mb-8 flex items-center gap-3 border-green-500/30 bg-green-500/10"
            >
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-foreground">
                  Sikeresen elmentve!
                </p>
                <p className="text-sm text-muted-foreground">
                  Átirányítunk az elemzéseidhez...
                </p>
              </div>
            </GlassCard>
          )}

          {analysis.observations && analysis.looks && (
            <ResultsView
              observations={analysis.observations}
              looks={analysis.looks}
              beforeImageUrl={analysis.beforeImageUrl}
              pdfUrl={analysis.pdfUrl}
              isPaid={true}
              onDownloadPdf={handleDownloadPdf}
            />
          )}
        </div>
      </main>
    </>
  )
}
