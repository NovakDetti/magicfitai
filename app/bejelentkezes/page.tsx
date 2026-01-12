"use client"

import { useState, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Mail, Lock, Loader2, Sparkles, Eye, EyeOff } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

function BejelentkezesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const callbackUrl = searchParams.get("callbackUrl") || "/eredmenyeim"
  const error = searchParams.get("error")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState("")

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return

    setIsLoading(true)
    setFormError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setFormError("Hibás email cím vagy jelszó")
      } else {
        router.push(callbackUrl)
      }
    } catch {
      setFormError("Hiba történt a bejelentkezés során")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl })
  }

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case "OAuthSignin":
      case "OAuthCallback":
        return "Hiba történt a Google bejelentkezés során."
      case "OAuthAccountNotLinked":
        return "Ez az email már egy másik fiókhoz van kapcsolva."
      case "CredentialsSignin":
        return "Hibás email cím vagy jelszó."
      default:
        return errorCode ? "Ismeretlen hiba történt." : null
    }
  }

  const errorMessage = getErrorMessage(error)

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background pt-16">
        <div className="container mx-auto max-w-md px-4 py-12 md:py-20">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Magic Fit AI
              </span>
            </div>
            <h1 className="text-3xl font-light tracking-tight text-foreground">
              Bejelentkezés
            </h1>
            <p className="mt-2 text-muted-foreground">
              Jelentkezz be a korábbi elemzéseid megtekintéséhez
            </p>
          </div>

          {(errorMessage || formError) && (
            <GlassCard className="mb-6 border-destructive/30 bg-destructive/5">
              <p className="text-sm text-destructive">
                {formError || errorMessage}
              </p>
            </GlassCard>
          )}

          <GlassCard variant="elevated">
            {/* Google Sign In */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              className="w-full"
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Bejelentkezés Google-lel
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  vagy email-lel
                </span>
              </div>
            </div>

            <form onSubmit={handleCredentialsSignIn} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  Email cím
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="pelda@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="w-full pl-10"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  Jelszó
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Jelszó"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !email || !password}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Bejelentkezés...
                  </>
                ) : (
                  "Bejelentkezés"
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              A bejelentkezéssel elfogadod az{" "}
              <Link
                href="/adatvedelem"
                className="text-primary hover:underline"
              >
                Adatvédelmi Tájékoztatót
              </Link>
              .
            </p>
          </GlassCard>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Nincs még fiókod?{" "}
            <Link
              href="/regisztracio"
              className="text-primary hover:underline"
            >
              Regisztrálj most
            </Link>
          </p>

          <p className="mt-3 text-center text-sm text-muted-foreground">
            Nincs szükség regisztrációra az egyszeri elemzéshez.{" "}
            <Link
              href="/ai-sminkajanlo"
              className="text-primary hover:underline"
            >
              Próbáld ki vendégként
            </Link>
          </p>
        </div>
      </main>
    </>
  )
}

export default function BejelentkezesPage() {
  return (
    <Suspense
      fallback={
        <>
          <Navigation />
          <main className="min-h-screen bg-background pt-16">
            <div className="container mx-auto max-w-md px-4 py-12 md:py-20">
              <div className="flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            </div>
          </main>
        </>
      }
    >
      <BejelentkezesContent />
    </Suspense>
  )
}
