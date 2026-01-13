"use client"

import Link from "next/link"
import { Mail, ArrowLeft, Sparkles } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"

export default function KapcsolatPage() {
  const { language } = useLanguage()
  const t = (hu: string, en: string) => (language === "hu" ? hu : en)
  const email = "novakbernadett94@gmail.com"

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background pt-16">
        <div className="container mx-auto max-w-4xl px-4 py-12 md:py-20">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {t("Kapcsolat", "Contact")}
              </span>
            </div>
            <h1 className="text-3xl font-light tracking-tight text-foreground md:text-4xl">
              {t("Írj nekünk", "Get in touch")}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {t(
                "Kérdésed van? Szívesen segítünk.",
                "Have a question? We’re happy to help."
              )}
            </p>
          </div>

          <GlassCard variant="elevated" className="p-6 md:p-8">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-medium text-foreground">
                {t("E-mail", "Email")}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {t(
                  "Írj nekünk az alábbi címre, és hamarosan válaszolunk.",
                  "Write to us at the address below and we’ll get back to you."
                )}
              </p>

              <a
                href={`mailto:${email}`}
                className="mt-4 inline-flex items-center gap-2 rounded-[12px] bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
              >
                {email}
              </a>
            </div>

            <div className="mt-8 flex justify-center">
              <Link href="/">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t("Vissza a főoldalra", "Back to home")}
                </Button>
              </Link>
            </div>
          </GlassCard>
        </div>
      </main>
    </>
  )
}
