import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { GlassCard } from "@/components/ui/glass-card"
import { FileText, CreditCard, Copyright, AlertCircle } from "lucide-react"

export default function TermsAndConditionsPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-secondary/20 to-background py-16 md:py-24">
          <div className="container mx-auto max-w-4xl px-4">
            <div className="text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
                <FileText className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium tracking-wide text-primary">
                  Jogi információk
                </span>
              </div>
              <h1 className="mb-4 text-3xl font-light tracking-tight text-foreground md:text-4xl lg:text-5xl">
                Felhasználási
                <span className="block font-medium">Feltételek</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Hatályos: 2026. január 11.
              </p>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto max-w-4xl px-4">
            <div className="space-y-8">
              {/* Section 0 - Service Provider Info */}
              <GlassCard variant="subtle">
                <div className="p-6 md:p-8">
                  <h2 className="mb-4 text-2xl font-medium text-foreground">
                    A szolgáltató adatai
                  </h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p><strong>Szolgáltatás neve:</strong> Magic Fit AI</p>
                    <p><strong>Üzemeltető:</strong> Bujákné Novák Bernadett egyéni vállalkozó</p>
                    <p><strong>Nyilvántartási szám:</strong> 58034914</p>
                    <p><strong>Adószám:</strong> 59982944-1-42</p>
                    <p><strong>Székhely:</strong> 1151 Budapest, Sződliget utca 11.</p>
                    <p><strong>E-mail:</strong> novakbernadett94@gmail.com</p>
                    <p><strong>Weboldal:</strong> magicfitai.com</p>
                  </div>
                </div>
              </GlassCard>

              {/* Section 1 */}
              <GlassCard variant="subtle">
                <div className="p-6 md:p-8">
                  <h2 className="mb-4 text-2xl font-medium text-foreground">
                    1. A szolgáltatás tárgya
                  </h2>
                  <div className="space-y-3 text-muted-foreground">
                    <p>
                      A Magic Fit AI egy AI-alapú online sminktanácsadó szolgáltatás, amely feltöltött arckép alapján személyre szabott sminkajánlásokat készít.
                    </p>
                    <p className="font-medium text-foreground">
                      A szolgáltatás nem minősül kozmetikai, egészségügyi vagy orvosi tanácsnak.
                    </p>
                  </div>
                </div>
              </GlassCard>

              {/* Section 2 */}
              <GlassCard variant="subtle">
                <div className="p-6 md:p-8">
                  <h2 className="mb-4 text-2xl font-medium text-foreground">
                    2. A szolgáltatás használata
                  </h2>
                  <div className="space-y-3 text-muted-foreground">
                    <p>A felhasználó kijelenti, hogy:</p>
                    <ul className="ml-6 space-y-2 list-disc">
                      <li>saját magáról készült képet tölt fel, vagy rendelkezik a szükséges jogokkal</li>
                      <li>tudomásul veszi, hogy az eredmények tájékoztató jellegűek</li>
                      <li>a szolgáltatást saját felelősségére veszi igénybe</li>
                    </ul>
                  </div>
                </div>
              </GlassCard>

              {/* Section 3 */}
              <GlassCard variant="subtle">
                <div className="p-6 md:p-8">
                  <h2 className="mb-4 flex items-center gap-2 text-2xl font-medium text-foreground">
                    <CreditCard className="h-6 w-6 text-primary" />
                    3. Kreditrendszer
                  </h2>
                  <div className="space-y-3 text-muted-foreground">
                    <ul className="ml-6 space-y-2 list-disc">
                      <li>A szolgáltatás kredit alapú.</li>
                      <li>Minden kredit ugyanazt a szolgáltatást tartalmazza.</li>
                      <li>A kreditcsomagok közötti különbség kizárólag az egységárban van.</li>
                      <li className="font-medium text-foreground">A megvásárolt kreditek nem visszaválthatók.</li>
                    </ul>
                  </div>
                </div>
              </GlassCard>

              {/* Section 4 */}
              <GlassCard variant="subtle">
                <div className="p-6 md:p-8">
                  <h2 className="mb-4 text-2xl font-medium text-foreground">
                    4. Fizetés és visszatérítés
                  </h2>
                  <div className="space-y-3 text-muted-foreground">
                    <ul className="ml-6 space-y-2 list-disc">
                      <li>A fizetés online történik.</li>
                      <li>Digitális szolgáltatás révén a teljesítést követően elállási jog nem gyakorolható.</li>
                      <li>Technikai hiba esetén a Szolgáltató kivizsgálja az esetet.</li>
                    </ul>
                  </div>
                </div>
              </GlassCard>

              {/* Section 5 */}
              <GlassCard variant="subtle">
                <div className="p-6 md:p-8">
                  <h2 className="mb-4 flex items-center gap-2 text-2xl font-medium text-foreground">
                    <Copyright className="h-6 w-6 text-primary" />
                    5. Szerzői jog
                  </h2>
                  <div className="space-y-3 text-muted-foreground">
                    <ul className="ml-6 space-y-2 list-disc">
                      <li>A weboldalon megjelenő tartalmak a Magic Fit AI tulajdonát képezik.</li>
                      <li>A generált eredmények személyes használatra szolgálnak.</li>
                      <li className="font-medium text-foreground">Üzleti vagy kereskedelmi felhasználás külön engedélyhez kötött.</li>
                    </ul>
                  </div>
                </div>
              </GlassCard>

              {/* Section 6 */}
              <GlassCard variant="subtle">
                <div className="p-6 md:p-8">
                  <h2 className="mb-4 flex items-center gap-2 text-2xl font-medium text-foreground">
                    <AlertCircle className="h-6 w-6 text-primary" />
                    6. Felelősség kizárása
                  </h2>
                  <div className="space-y-3 text-muted-foreground">
                    <ul className="ml-6 space-y-2 list-disc">
                      <li>A Szolgáltató nem garantálja, hogy az ajánlások minden esetben megfelelnek az egyéni elvárásoknak.</li>
                      <li className="font-medium text-foreground">A szolgáltatás nem helyettesíti szakember véleményét.</li>
                      <li>A Szolgáltató nem vállal felelősséget a sminktermékek használatából eredő következményekért.</li>
                    </ul>
                  </div>
                </div>
              </GlassCard>

              {/* Section 7 */}
              <GlassCard variant="subtle">
                <div className="p-6 md:p-8">
                  <h2 className="mb-4 text-2xl font-medium text-foreground">
                    7. A feltételek módosítása
                  </h2>
                  <div className="space-y-3 text-muted-foreground">
                    <ul className="ml-6 space-y-2 list-disc">
                      <li>A Szolgáltató fenntartja a jogot a Felhasználási Feltételek módosítására.</li>
                      <li>A változások a weboldalon történő közzététellel lépnek hatályba.</li>
                    </ul>
                  </div>
                </div>
              </GlassCard>

              {/* Section 8 */}
              <GlassCard variant="elevated">
                <div className="p-6 md:p-8">
                  <h2 className="mb-4 text-2xl font-medium text-foreground">
                    8. Irányadó jog
                  </h2>
                  <div className="space-y-3 text-muted-foreground">
                    <p className="text-lg font-medium text-foreground">
                      Jelen feltételekre a magyar jog az irányadó.
                    </p>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
