import Link from "next/link"
import { Mail, ArrowLeft } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"

export default function EmailEllenorzesPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background pt-16">
        <div className="container mx-auto max-w-md px-4 py-12 md:py-20">
          <GlassCard variant="elevated" className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-10 w-10 text-primary" />
            </div>

            <h1 className="mb-4 text-2xl font-medium text-foreground">
              Ellenőrizd az emailjeidet
            </h1>

            <p className="mb-6 text-muted-foreground">
              Küldtünk egy bejelentkezési linket az email címedre. Kattints a
              linkre a bejelentkezéshez.
            </p>

            <div className="space-y-3 rounded-xl bg-secondary/30 p-4 text-left text-sm">
              <p className="font-medium text-foreground">Nem kaptad meg?</p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Ellenőrizd a spam/levélszemét mappát</li>
                <li>• Várj néhány percet és frissítsd a postafiókod</li>
                <li>• Ellenőrizd, hogy jó email címet adtál meg</li>
              </ul>
            </div>

            <div className="mt-6">
              <Link href="/bejelentkezes">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Vissza a bejelentkezéshez
                </Button>
              </Link>
            </div>
          </GlassCard>
        </div>
      </main>
    </>
  )
}
