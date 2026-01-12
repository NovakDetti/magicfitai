"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { GlassCard } from "@/components/ui/glass-card"
import { Stepper, type Step } from "@/components/ui/stepper"
import { Button } from "@/components/ui/button"
import { SignatureLookResults } from "@/components/signature-look-results"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Upload,
  Camera,
  AlertCircle,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Loader2,
  Zap,
  CreditCard,
  UserPlus,
  LogIn,
  Check,
} from "lucide-react"
import type { AnalysisObservations, MakeupLook } from "@/lib/db/schema"

// ============================================
// Types
// ============================================

interface AnalysisResult {
  observations: AnalysisObservations
  looks: MakeupLook[]
}

type WizardStep = 1 | 2 | 3

// ============================================
// Constants
// ============================================

const WIZARD_STEPS: Step[] = [
  { id: 1, title: "Fotó" },
  { id: 2, title: "Részletek" },
  { id: 3, title: "Eredmények" },
]

const MAKEUP_STYLES = [
  {
    value: "everyday",
    label: "Hétköznapi",
    description: "Természetes, fresh look minden napra",
    icon: "☀️"
  },
  {
    value: "date",
    label: "Randi",
    description: "Romantikus, lágy smink különleges pillanatokra",
    icon: "💕"
  },
  {
    value: "party",
    label: "Buli",
    description: "Merész, csillogó smink bulizáshoz",
    icon: "🎉"
  },
  {
    value: "smokey",
    label: "Smokey",
    description: "Intenzív, drámai szemsmink",
    icon: "🌙"
  },
  {
    value: "elegant",
    label: "Elegáns",
    description: "Kifinomult, elegáns megjelenés",
    icon: "✨"
  },
]

// ============================================
// Main Component
// ============================================

export default function AISminkajanloPage() {
  const { data: session } = useSession()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // State
  const [currentStep, setCurrentStep] = useState<WizardStep>(1)

  // Step 1: Photo
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Step 2: Details
  const [occasion, setOccasion] = useState("")
  const [hasGlasses, setHasGlasses] = useState(false)
  const [hasSensitiveSkin, setHasSensitiveSkin] = useState(false)

  // Session & Payment
  const [isCreatingSession, setIsCreatingSession] = useState(false)
  const [analysisSessionId, setAnalysisSessionId] = useState<string | null>(null)
  const [guestToken, setGuestToken] = useState<string | null>(null)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [userCredits, setUserCredits] = useState<number>(0)

  // Results
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [analysisError, setAnalysisError] = useState<string | null>(null)

  // Payment/Auth Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  // Fetch user credits on mount
  useEffect(() => {
    if (session?.user) {
      fetchUserCredits()
    }
  }, [session])

  const fetchUserCredits = async () => {
    try {
      const res = await fetch("/api/my-credits")
      if (res.ok) {
        const data = await res.json()
        setUserCredits(data.balance)
      }
    } catch (error) {
      console.error("Failed to fetch credits:", error)
    }
  }

  // ============================================
  // Handlers
  // ============================================

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError(null)

    const validTypes = ["image/jpeg", "image/png", "image/webp"]
    if (!validTypes.includes(file.type)) {
      setUploadError("Csak JPG, PNG vagy WebP formátum engedélyezett.")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("A kép mérete nem haladhatja meg a 10MB-ot.")
      return
    }

    setUploadedFile(file)
    const reader = new FileReader()
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleRemoveImage = useCallback(() => {
    setUploadedImage(null)
    setUploadedFile(null)
    setUploadError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [])

  // Show payment modal - session creation happens after payment
  const handleShowPaymentModal = () => {
    if (!uploadedFile || !occasion) return
    setShowPaymentModal(true)
  }

  // Create session after payment confirmed
  const createAnalysisSession = async () => {
    if (!uploadedFile || !occasion) return null

    setIsCreatingSession(true)
    setAnalysisError(null)

    try {
      const formData = new FormData()
      formData.append("image", uploadedFile)
      formData.append("occasion", occasion)
      formData.append("hasGlasses", String(hasGlasses))
      formData.append("hasSensitiveSkin", String(hasSensitiveSkin))

      const res = await fetch("/api/create-analysis-session", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Nem sikerült létrehozni a munkamenetet.")
      }

      const data = await res.json()
      setAnalysisSessionId(data.sessionId)
      setGuestToken(data.guestToken)
      return data
    } catch (error) {
      setAnalysisError(
        error instanceof Error ? error.message : "Ismeretlen hiba történt."
      )
      return null
    } finally {
      setIsCreatingSession(false)
    }
  }

  const handleUseCredit = async () => {
    if (userCredits < 1) return

    setShowPaymentModal(false)
    setIsAnalyzing(true)
    setAnalysisError(null)

    try {
      // First create the session
      const sessionData = await createAnalysisSession()
      if (!sessionData) {
        throw new Error("Nem sikerült létrehozni a munkamenetet.")
      }

      // Then use the credit
      const res = await fetch("/api/use-credit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysisSessionId: sessionData.sessionId }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Nem sikerült felhasználni a kreditet.")
      }

      // Poll for results
      await pollForResults(sessionData.sessionId)
    } catch (error) {
      setAnalysisError(
        error instanceof Error ? error.message : "Ismeretlen hiba történt."
      )
      setIsAnalyzing(false)
    }
  }

  const handlePayment = async (packageType: "single" | "pack5" | "pack10") => {
    setIsProcessingPayment(true)
    setAnalysisError(null)

    // Credit amounts for each package
    const creditAmounts = { single: 1, pack5: 5, pack10: 10 }
    const credits = creditAmounts[packageType]

    try {
      // For single purchase, create session first
      let sessionId = analysisSessionId
      let token = guestToken

      if (packageType === "single" && !sessionId) {
        const sessionData = await createAnalysisSession()
        if (!sessionData) {
          throw new Error("Nem sikerült létrehozni a munkamenetet.")
        }
        sessionId = sessionData.sessionId
        token = sessionData.guestToken
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credits,
          packageType,
          analysisSessionId: packageType === "single" ? sessionId : undefined,
          guestToken: packageType === "single" ? token : undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Nem sikerült elindítani a fizetést.")
      }

      const data = await res.json()
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      }
    } catch (error) {
      setAnalysisError(
        error instanceof Error ? error.message : "Ismeretlen hiba történt."
      )
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const pollForResults = async (sessionId: string) => {
    const maxAttempts = 60
    let attempts = 0

    while (attempts < maxAttempts) {
      try {
        const res = await fetch(`/api/analysis/${sessionId}`)
        if (!res.ok) {
          throw new Error("Nem sikerült lekérni az eredményeket.")
        }

        const data = await res.json()

        if (data.status === "complete") {
          setAnalysisResult({
            observations: data.observations,
            looks: data.looks,
          })
          setCurrentStep(3)
          setIsAnalyzing(false)
          return
        }

        if (data.status === "failed") {
          throw new Error("Az elemzés sikertelen volt.")
        }

        // Wait before next poll
        await new Promise((resolve) => setTimeout(resolve, 2000))
        attempts++
      } catch (error) {
        throw error
      }
    }

    throw new Error("Az elemzés túl sokáig tartott. Kérjük, próbálja újra.")
  }

  const handleNewAnalysis = () => {
    setCurrentStep(1)
    setUploadedImage(null)
    setUploadedFile(null)
    setOccasion("")
    setHasGlasses(false)
    setHasSensitiveSkin(false)
    setAnalysisSessionId(null)
    setGuestToken(null)
    setAnalysisResult(null)
    setAnalysisError(null)
  }

  // ============================================
  // Render
  // ============================================

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background pt-16">
        <div className="container mx-auto max-w-5xl px-4 py-12 md:py-20">
          {/* Header */}
          <div className="mb-10 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium tracking-wide text-primary">
                AI Sminkajánló
              </span>
            </div>
            <h1 className="mb-4 text-3xl font-light tracking-tight text-foreground md:text-4xl lg:text-5xl">
              <span className="block font-medium">Személyre szabott sminktanácsok</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Töltse fel egy portréfotót, és az AI elemzi arcvonásait, bőrállapotát, majd
              egy személyre szabott sminkjavaslatot készít az Ön számára — részletes lépésekkel
              és bőrelőkészítési tippekkel.
            </p>
          </div>

          {/* Stepper */}
          <Stepper steps={WIZARD_STEPS} currentStep={currentStep} className="mb-10" />

          {/* Step Content */}
          <div className="mx-auto max-w-3xl">
            {/* Step 1: Photo Upload */}
            {currentStep === 1 && (
              <GlassCard variant="elevated">
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <Camera className="h-7 w-7 text-primary" />
                    </div>
                    <h2 className="text-2xl font-medium tracking-tight text-foreground">
                      Portréfotó feltöltése
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Töltsön fel egy jól megvilágított, szemből készült fotót.
                    </p>
                  </div>

                  {!uploadedImage ? (
                    <div className="space-y-4">
                      <label className="block">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={handleFileSelect}
                        />
                        <div className="cursor-pointer rounded-[18px] border-2 border-dashed border-border/60 bg-background/50 p-8 text-center transition-colors hover:border-primary/40 hover:bg-primary/5">
                          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <Upload className="h-5 w-5 text-primary" />
                          </div>
                          <p className="mb-1 text-sm font-medium text-foreground">
                            Kattintson a feltöltéshez
                          </p>
                          <p className="text-xs text-muted-foreground">
                            JPG, PNG vagy WebP • Max. 10MB
                          </p>
                        </div>
                      </label>

                      {uploadError && (
                        <div className="flex items-center gap-2 rounded-[14px] border border-destructive/30 bg-destructive/5 p-4">
                          <AlertCircle className="h-5 w-5 text-destructive" />
                          <p className="text-sm text-destructive">{uploadError}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative mx-auto aspect-[3/4] max-w-xs overflow-hidden rounded-[18px] bg-secondary/30">
                        <Image
                          src={uploadedImage}
                          alt="Feltöltött kép"
                          fill
                          className="object-cover"
                        />
                        <button
                          onClick={handleRemoveImage}
                          className="absolute right-3 top-3 rounded-full bg-destructive/90 p-2 text-white transition-colors hover:bg-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex justify-center">
                        <Button onClick={() => setCurrentStep(2)}>
                          Tovább a részletekhez
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </GlassCard>
            )}

            {/* Step 2: Details */}
            {currentStep === 2 && !isAnalyzing && (
              <GlassCard variant="elevated">
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-medium tracking-tight text-foreground">
                      Részletek megadása
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Adj meg néhány információt a személyre szabott javaslatokhoz.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="mb-4 block text-lg font-semibold text-foreground">
                        Válassz egy smink stílust
                      </label>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {MAKEUP_STYLES.map((style) => (
                          <button
                            key={style.value}
                            onClick={() => setOccasion(style.value)}
                            className={`group relative overflow-hidden rounded-[16px] border-2 p-4 text-left transition-all duration-200 ${
                              occasion === style.value
                                ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                                : "border-border/50 bg-card hover:border-primary/50 hover:shadow-md"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-3xl">{style.icon}</span>
                              <div className="flex-1">
                                <h3 className="font-semibold text-foreground">
                                  {style.label}
                                </h3>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {style.description}
                                </p>
                              </div>
                              {occasion === style.value && (
                                <div className="absolute right-3 top-3">
                                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                                    <Check className="h-4 w-4 text-primary-foreground" />
                                  </div>
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3 rounded-[14px] bg-secondary/30 p-4">
                      <label className="flex cursor-pointer items-center gap-3">
                        <Checkbox
                          checked={hasGlasses}
                          onCheckedChange={(checked) =>
                            setHasGlasses(checked === true)
                          }
                        />
                        <span className="text-sm text-foreground">
                          Szemüveget hordok
                        </span>
                      </label>
                      <label className="flex cursor-pointer items-center gap-3">
                        <Checkbox
                          checked={hasSensitiveSkin}
                          onCheckedChange={(checked) =>
                            setHasSensitiveSkin(checked === true)
                          }
                        />
                        <span className="text-sm text-foreground">
                          Érzékeny a bőröm
                        </span>
                      </label>
                    </div>
                  </div>

                  {analysisError && (
                    <div className="flex items-center gap-2 rounded-[14px] border border-destructive/30 bg-destructive/5 p-4">
                      <AlertCircle className="h-5 w-5 text-destructive" />
                      <p className="text-sm text-destructive">{analysisError}</p>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(1)}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Vissza
                    </Button>
                    <Button
                      onClick={handleShowPaymentModal}
                      disabled={!occasion || isCreatingSession}
                    >
                      {isCreatingSession ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Folyamatban...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Elemzés indítása
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Step 2: Analyzing (shown while processing) */}
            {currentStep === 2 && isAnalyzing && (
              <GlassCard variant="elevated" className="text-center py-12">
                <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
                <h2 className="text-xl font-medium text-foreground mb-2">
                  Elemzés folyamatban...
                </h2>
                <p className="text-muted-foreground">
                  Az AI éppen dolgozik a személyre szabott javaslataidon.
                  <br />
                  Ez általában 1-2 percig tart.
                </p>
              </GlassCard>
            )}

            {/* Step 3: Results */}
            {currentStep === 3 && analysisResult && analysisResult.looks[0] && uploadedImage && (
              <SignatureLookResults
                sessionId={analysisSessionId || ""}
                observations={analysisResult.observations}
                look={analysisResult.looks[0]}
                beforeImageUrl={uploadedImage}
                isLoggedIn={!!session?.user}
                onNewAnalysis={handleNewAnalysis}
              />
            )}
          </div>
        </div>
      </main>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Elemzés fizetése
            </DialogTitle>
            <DialogDescription>
              Válassz fizetési módot az elemzés indításához.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* If logged in and has credits - show use credit option FIRST */}
            {session?.user && userCredits > 0 ? (
              <>
                {/* Primary: Use existing credit */}
                <div className="rounded-[14px] border-2 border-primary bg-primary/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                        <Sparkles className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          Kredit használata
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {userCredits} kredit elérhető
                        </p>
                      </div>
                    </div>
                    <Button onClick={handleUseCredit} size="sm">
                      Indítás
                    </Button>
                  </div>
                </div>

                {/* Secondary: Quick pay option */}
                <div className="rounded-[14px] bg-secondary/50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                        <Zap className="h-5 w-5 text-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          Azonnali fizetés
                        </p>
                        <p className="text-sm text-muted-foreground">
                          1 elemzés - 450 Ft
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => handlePayment("single")}
                      disabled={isProcessingPayment}
                      size="sm"
                    >
                      {isProcessingPayment ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Fizetés"
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              /* No credits or not logged in - show quick pay first */
              <div className="rounded-[14px] border-2 border-primary bg-primary/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        Azonnali fizetés
                      </p>
                      <p className="text-sm text-muted-foreground">
                        1 elemzés - 450 Ft
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handlePayment("single")}
                    disabled={isProcessingPayment}
                    size="sm"
                  >
                    {isProcessingPayment ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Fizetés"
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Divider for more options */}
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  További lehetőségek
                </span>
              </div>
            </div>

            {/* If not logged in - show auth options */}
            {!session?.user && (
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" asChild size="sm" className="h-auto py-3 flex-col">
                  <Link href={`/regisztracio?callbackUrl=${encodeURIComponent('/ai-sminkajanlo')}`}>
                    <UserPlus className="mb-1 h-4 w-4" />
                    <span className="text-xs">Regisztráció</span>
                  </Link>
                </Button>
                <Button variant="outline" asChild size="sm" className="h-auto py-3 flex-col">
                  <Link href={`/bejelentkezes?callbackUrl=${encodeURIComponent('/ai-sminkajanlo')}`}>
                    <LogIn className="mb-1 h-4 w-4" />
                    <span className="text-xs">Bejelentkezés</span>
                  </Link>
                </Button>
              </div>
            )}

            {/* Credit packages for logged in users */}
            {session?.user && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground text-center">
                  Spórolj kredit csomagokkal:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handlePayment("pack5")}
                    disabled={isProcessingPayment}
                    className="rounded-[12px] border border-border bg-background p-3 text-center transition-colors hover:bg-secondary/50 disabled:opacity-50"
                  >
                    <p className="text-lg font-semibold text-foreground">5 kredit</p>
                    <p className="text-xs text-muted-foreground">2 025 Ft</p>
                    <p className="text-xs text-primary">-10%</p>
                  </button>
                  <button
                    onClick={() => handlePayment("pack10")}
                    disabled={isProcessingPayment}
                    className="rounded-[12px] border-2 border-primary bg-primary/5 p-3 text-center transition-colors hover:bg-primary/10 disabled:opacity-50"
                  >
                    <p className="text-lg font-semibold text-foreground">10 kredit</p>
                    <p className="text-xs text-muted-foreground">4 000 Ft</p>
                    <p className="text-xs text-primary font-medium">-11%</p>
                  </button>
                </div>
              </div>
            )}

            {analysisError && (
              <div className="flex items-center gap-2 rounded-[14px] border border-destructive/30 bg-destructive/5 p-3">
                <AlertCircle className="h-4 w-4 flex-shrink-0 text-destructive" />
                <p className="text-sm text-destructive">{analysisError}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
