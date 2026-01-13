"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { User, CreditCard, Trash2, AlertCircle, Loader2, LogOut, Mail, Calendar, Package } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useLanguage } from "@/components/language-provider"

interface UserProfile {
  id: string
  email: string
  name: string | null
  image: string | null
  credits: number
  createdAt: string
}

interface CreditPackage {
  id: string
  credits: number
  price: number
  discount?: string
  popular?: boolean
  savingsPercent?: number
}

const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: "single",
    credits: 1,
    price: 450,
  },
  {
    id: "pack5",
    credits: 5,
    price: 2025,
    discount: "10% kedvezmény",
    popular: true,
    savingsPercent: 10,
  },
  {
    id: "pack10",
    credits: 10,
    price: 3825,
    discount: "15% kedvezmény",
    savingsPercent: 15,
  },
]

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { language } = useLanguage()
  const t = (hu: string, en: string) => (language === "hu" ? hu : en)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/bejelentkezes?callbackUrl=/profil")
    } else if (status === "authenticated") {
      fetchProfile()
    }
  }, [status, router])

  const fetchProfile = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/user/profile")
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || t("Nem sikerült betölteni a profilt.", "Failed to load profile."))
      }
      const data = await res.json()
      setProfile(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : t("Ismeretlen hiba történt.", "An unknown error occurred."))
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    setDeleteError(null)
    try {
      const res = await fetch("/api/user/delete", {
        method: "DELETE",
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || t("Nem sikerült törölni a fiókot.", "Failed to delete the account."))
      }
      // Sign out and redirect to home
      await signOut({ callbackUrl: "/" })
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : t("Ismeretlen hiba történt.", "An unknown error occurred."))
      setIsDeleting(false)
    }
  }

  const handlePurchasePackage = (packageId: string) => {
    // TODO: Implement Stripe checkout
    console.log("Purchase package:", packageId)
    alert(t("Fizetés hamarosan elérhető!", "Payment coming soon!"))
  }

  if (status === "loading" || isLoading) {
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

  if (error || !profile) {
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
              <Link href="/">
                <Button variant="outline">{t("Vissza a főoldalra", "Back to home")}</Button>
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
        <div className="container mx-auto max-w-5xl px-4 py-12">
          {/* Page Header */}
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-light tracking-tight text-foreground md:text-4xl">
              {t("Profilom", "My profile")}
            </h1>
            <p className="text-muted-foreground">
              {t("Személyes adatok és kredit kezelése", "Personal details and credit management")}
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Personal Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <GlassCard variant="elevated" className="p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#B78C86]/10">
                    <User className="h-5 w-5 text-[#B78C86]" />
                  </div>
                  <h2 className="text-xl font-medium text-foreground">
                    {t("Személyes adatok", "Personal information")}
                  </h2>
                </div>

                <div className="space-y-4">
                  {/* Name */}
                  <div className="flex items-start gap-3 rounded-lg bg-secondary/20 p-4">
                    <User className="mt-0.5 h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {t("Név", "Name")}
                      </p>
                      <p className="mt-1 text-sm text-foreground">
                        {profile.name || t("Nincs megadva", "Not provided")}
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-3 rounded-lg bg-secondary/20 p-4">
                    <Mail className="mt-0.5 h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {t("E-mail cím", "Email")}
                      </p>
                      <p className="mt-1 text-sm text-foreground">
                        {profile.email}
                      </p>
                    </div>
                  </div>

                  {/* Registration Date */}
                  <div className="flex items-start gap-3 rounded-lg bg-secondary/20 p-4">
                    <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {t("Regisztráció dátuma", "Registration date")}
                      </p>
                      <p className="mt-1 text-sm text-foreground">
                        {new Date(profile.createdAt).toLocaleDateString(language === "hu" ? "hu-HU" : "en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Credit Packages */}
              <GlassCard variant="elevated" className="p-6">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#B78C86]/10">
                    <Package className="h-5 w-5 text-[#B78C86]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-medium text-foreground">
                      {t("Kredit csomagok", "Credit packs")}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {t("Válassz a kedvezményes csomagok közül", "Choose from discounted packs")}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {CREDIT_PACKAGES.map((pkg) => (
                    <div
                      key={pkg.id}
                      className={`relative rounded-xl border-2 p-5 transition-all ${
                        pkg.popular
                          ? "border-[#B78C86] bg-[#B78C86]/5"
                          : "border-border bg-secondary/20"
                      }`}
                    >
                      {pkg.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <span className="rounded-full bg-[#B78C86] px-3 py-1 text-xs font-medium text-white">
                            {t("Népszerű", "Popular")}
                          </span>
                        </div>
                      )}

                      {pkg.discount && (
                        <div className="mb-3 text-center">
                          <span className="inline-block rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-600">
                            {pkg.savingsPercent ? t(`${pkg.savingsPercent}% kedvezmény`, `${pkg.savingsPercent}% off`) : pkg.discount}
                          </span>
                        </div>
                      )}

                      <div className="mb-3 text-center">
                        <p className="text-3xl font-bold text-foreground">
                          {pkg.credits}
                        </p>
                        <p className="text-xs text-muted-foreground">{t("kredit", "credits")}</p>
                      </div>

                      <div className="mb-4 text-center">
                        <p className="text-2xl font-semibold text-foreground">
                          {pkg.price.toLocaleString(language === "hu" ? "hu-HU" : "en-US")}
                        </p>
                        <p className="text-xs text-muted-foreground">Ft</p>
                        {pkg.savingsPercent && (
                          <p className="mt-1 text-xs text-green-600">
                            {t(`${pkg.savingsPercent}% megtakarítás`, `${pkg.savingsPercent}% savings`)}
                          </p>
                        )}
                      </div>

                      <Button
                        onClick={() => handlePurchasePackage(pkg.id)}
                        className="w-full"
                        variant={pkg.popular ? "default" : "outline"}
                      >
                        {t("Vásárlás", "Purchase")}
                      </Button>
                    </div>
                  ))}
                </div>

                <p className="mt-4 text-center text-xs text-muted-foreground">
                  {t(
                    "Minden kredit 1 teljes AI elemzésre jogosít fel (arcanalízis + személyre szabott smink)",
                    "Each credit unlocks 1 full AI analysis (face analysis + personalized makeup)"
                  )}
                </p>
              </GlassCard>

              {/* Danger Zone */}
              <GlassCard variant="elevated" className="border-2 border-destructive/20 p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  </div>
                  <h2 className="text-xl font-medium text-foreground">
                    {t("Veszélyes zóna", "Danger zone")}
                  </h2>
                </div>

                <div className="rounded-lg bg-destructive/5 p-4">
                  <p className="mb-4 text-sm text-muted-foreground">
                    {t(
                      "A fiók törlésével véglegesen elveszíted az összes adatodat, elemzéseidet és kreditjeidet. Ez a művelet nem visszavonható.",
                      "Deleting your account permanently removes all your data, analyses, and credits. This action cannot be undone."
                    )}
                  </p>
                  <Button
                    onClick={() => setShowDeleteDialog(true)}
                    variant="destructive"
                    className="w-full sm:w-auto"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t("Fiók törlése", "Delete account")}
                  </Button>
                </div>
              </GlassCard>
            </div>

            {/* Right Column - Quick Stats */}
            <div className="space-y-6">
              {/* Current Credits */}
              <GlassCard variant="elevated" className="p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#B78C86]/10">
                  <CreditCard className="h-5 w-5 text-[#B78C86]" />
                </div>
                <h2 className="text-lg font-medium text-foreground">
                    {t("Jelenlegi kreditjeim", "Current credits")}
                </h2>
              </div>

                <div className="text-center">
                  <p className="text-5xl font-bold text-[#B78C86]">
                    {profile.credits}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t("elérhető kredit", "credits available")}
                  </p>
                </div>

                <div className="mt-6">
                  <Link href="/ai-sminkajanlo">
                    <Button className="w-full">
                      {t("Új elemzés indítása", "Start a new analysis")}
                    </Button>
                  </Link>
                </div>
              </GlassCard>

              {/* Quick Actions */}
              <GlassCard variant="subtle" className="p-6">
                <h3 className="mb-4 text-sm font-medium text-foreground">
                  {t("Gyors műveletek", "Quick actions")}
                </h3>

                <div className="space-y-3">
                  <Link href="/eredmenyeim">
                    <Button variant="outline" className="w-full justify-start">
                      {t("Elemzéseim megtekintése", "View my analyses")}
                    </Button>
                  </Link>

                  <Button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("Kijelentkezés", "Sign out")}
                  </Button>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Biztosan törölni szeretnéd a fiókod?", "Are you sure you want to delete your account?")}</DialogTitle>
            <DialogDescription className="space-y-2">
              <p>{t("Ez a művelet nem visszavonható. A következők véglegesen törlődnek:", "This action cannot be undone. The following will be permanently deleted:")}</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>{t("Összes személyes adat", "All personal data")}</li>
                <li>{t("Minden elemzés és eredmény", "All analyses and results")}</li>
                <li>{t(`Fennmaradó kreditek (${profile.credits} kredit)`, `Remaining credits (${profile.credits} credits)`)}</li>
                <li>{t("Vásárlási előzmények", "Purchase history")}</li>
              </ul>
            </DialogDescription>
          </DialogHeader>

          {deleteError && (
            <div className="rounded-lg bg-destructive/10 p-3">
              <p className="text-sm text-destructive">{deleteError}</p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              {t("Mégse", "Cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("Törlés...", "Deleting...")}
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t("Igen, törlöm a fiókomat", "Yes, delete my account")}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
