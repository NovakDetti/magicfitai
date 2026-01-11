"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  Sparkles,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  CreditCard,
  Plus,
  Eye,
} from "lucide-react"
import { Navigation } from "@/components/navigation"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface AnalysisSummary {
  id: string
  status: string
  occasion: string
  beforeImageUrl: string | null
  observations: {
    faceShape: string
    skinTone: string
  } | null
  lookCount: number
  pdfUrl: string | null
  createdAt: string
  completedAt: string | null
}

interface CreditsData {
  balance: number
  transactions: Array<{
    id: string
    delta: number
    reason: string
    createdAt: string
  }>
}

const occasionLabels: Record<string, string> = {
  everyday: "Hétköznapi",
  work: "Munkahelyi",
  evening: "Esti",
  special: "Különleges alkalom",
}

const statusConfig: Record<
  string,
  { label: string; icon: React.ReactNode; color: string }
> = {
  pending: {
    label: "Fizetésre vár",
    icon: <Clock className="h-4 w-4" />,
    color: "text-yellow-600",
  },
  paid: {
    label: "Feldolgozás alatt",
    icon: <Loader2 className="h-4 w-4 animate-spin" />,
    color: "text-blue-600",
  },
  processing: {
    label: "Feldolgozás alatt",
    icon: <Loader2 className="h-4 w-4 animate-spin" />,
    color: "text-blue-600",
  },
  complete: {
    label: "Kész",
    icon: <CheckCircle className="h-4 w-4" />,
    color: "text-green-600",
  },
  failed: {
    label: "Sikertelen",
    icon: <AlertCircle className="h-4 w-4" />,
    color: "text-red-600",
  },
  expired: {
    label: "Lejárt",
    icon: <Clock className="h-4 w-4" />,
    color: "text-muted-foreground",
  },
}

export default function EredmenyeimPage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const [analyses, setAnalyses] = useState<AnalysisSummary[]>([])
  const [credits, setCredits] = useState<CreditsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showCreditModal, setShowCreditModal] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/bejelentkezes?callbackUrl=/eredmenyeim")
    }
  }, [authStatus, router])

  useEffect(() => {
    if (authStatus === "authenticated") {
      fetchData()
    }
  }, [authStatus])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [analysesRes, creditsRes] = await Promise.all([
        fetch("/api/my-analyses"),
        fetch("/api/my-credits"),
      ])

      if (analysesRes.ok) {
        const data = await analysesRes.json()
        setAnalyses(data.analyses)
      }

      if (creditsRes.ok) {
        const data = await creditsRes.json()
        setCredits(data)
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBuyCredits = async (packageType: "single" | "pack5" | "pack10") => {
    setIsProcessingPayment(true)
    setPaymentError(null)

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageType }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Nem sikerült elindítani a fizetést.")
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        throw new Error("Hiányzó fizetési link.")
      }
    } catch (error) {
      setPaymentError(
        error instanceof Error ? error.message : "Ismeretlen hiba történt."
      )
      setIsProcessingPayment(false)
    }
  }

  if (authStatus === "loading" || isLoading) {
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

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background pt-16">
        <div className="container mx-auto max-w-5xl px-4 py-12">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Eredményeim
              </span>
            </div>
            <h1 className="text-3xl font-light tracking-tight text-foreground md:text-4xl">
              Korábbi elemzéseim
            </h1>
          </div>

          {/* Credits Card */}
          <GlassCard variant="elevated" className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Rendelkezésre álló kredit
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {credits?.balance || 0} kredit
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href="/ai-sminkajanlo">
                  <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Új elemzés
                  </Button>
                </Link>
                <Button onClick={() => setShowCreditModal(true)}>
                  Kredit vásárlás
                </Button>
              </div>
            </div>
          </GlassCard>

          {/* Analyses Grid */}
          {analyses.length === 0 ? (
            <GlassCard className="text-center py-12">
              <Sparkles className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Még nincs elemzésed
              </h3>
              <p className="text-muted-foreground mb-6">
                Készítsd el az első személyre szabott sminkelemzésedet!
              </p>
              <Link href="/ai-sminkajanlo">
                <Button>Első elemzés indítása</Button>
              </Link>
            </GlassCard>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {analyses.map((analysis) => {
                const status = statusConfig[analysis.status] || statusConfig.pending
                const isComplete = analysis.status === "complete"

                return (
                  <GlassCard key={analysis.id} className="h-full transition-all hover:shadow-lg">
                    {/* Image */}
                    <Link href={`/eredmenyeim/${analysis.id}`} className="block">
                      <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-xl bg-secondary/30">
                        {analysis.beforeImageUrl ? (
                          <Image
                            src={analysis.beforeImageUrl}
                            alt="Elemzés kép"
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Sparkles className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}

                        {/* Status badge */}
                        <div
                          className={cn(
                            "absolute top-2 right-2 flex items-center gap-1 rounded-full bg-background/80 px-2 py-1 text-xs font-medium backdrop-blur-sm",
                            status.color
                          )}
                        >
                          {status.icon}
                          <span>{status.label}</span>
                        </div>
                      </div>
                    </Link>

                    {/* Info */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">
                          {occasionLabels[analysis.occasion] || analysis.occasion}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(analysis.createdAt).toLocaleDateString("hu-HU")}
                        </span>
                      </div>

                      {analysis.observations && (
                        <p className="text-xs text-muted-foreground">
                          {analysis.observations.faceShape} •{" "}
                          {analysis.observations.skinTone}
                        </p>
                      )}

                      {analysis.lookCount > 0 && (
                        <p className="text-xs text-primary">
                          {analysis.lookCount} look javaslat
                        </p>
                      )}

                      {/* Action buttons */}
                      {isComplete && (
                        <div className="flex gap-2 pt-2">
                          <Link href={`/eredmenyeim/${analysis.id}`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">
                              <Eye className="mr-1.5 h-3.5 w-3.5" />
                              Megtekintés
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </GlassCard>
                )
              })}
            </div>
          )}
        </div>

        <Dialog open={showCreditModal} onOpenChange={setShowCreditModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Kredit vásárlás
              </DialogTitle>
              <DialogDescription>
                Válassz csomagot a kreditek feltöltéséhez.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <button
                onClick={() => handleBuyCredits("single")}
                disabled={isProcessingPayment}
                className="flex w-full items-center justify-between rounded-[14px] border border-border bg-background px-4 py-3 text-left transition-colors hover:bg-secondary/60 disabled:opacity-50"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">1 kredit</p>
                  <p className="text-xs text-muted-foreground">450 Ft</p>
                </div>
              </button>
              <button
                onClick={() => handleBuyCredits("pack5")}
                disabled={isProcessingPayment}
                className="flex w-full items-center justify-between rounded-[14px] border border-border bg-background px-4 py-3 text-left transition-colors hover:bg-secondary/60 disabled:opacity-50"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">5 kredit</p>
                  <p className="text-xs text-muted-foreground">2 025 Ft</p>
                </div>
                <span className="text-xs font-medium text-primary">-10%</span>
              </button>

              <button
                onClick={() => handleBuyCredits("pack10")}
                disabled={isProcessingPayment}
                className="flex w-full items-center justify-between rounded-[14px] border-2 border-primary bg-primary/5 px-4 py-3 text-left transition-colors hover:bg-primary/10 disabled:opacity-50"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">10 kredit</p>
                  <p className="text-xs text-muted-foreground">3 825 Ft</p>
                </div>
                <span className="text-xs font-medium text-primary">-15%</span>
              </button>
            </div>

            {paymentError && (
              <div className="flex items-center gap-2 rounded-[14px] border border-destructive/30 bg-destructive/5 p-3">
                <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
                <p className="text-sm text-destructive">{paymentError}</p>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setShowCreditModal(false)}
                disabled={isProcessingPayment}
              >
                Mégse
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </>
  )
}
