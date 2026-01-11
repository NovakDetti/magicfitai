import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { GlassCard } from "@/components/ui/glass-card"
import { Shield, Mail, Info } from "lucide-react"

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-secondary/20 to-background py-16 md:py-24">
          <div className="container mx-auto max-w-4xl px-4">
            <div className="text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium tracking-wide text-primary">
                  Adatvédelem
                </span>
              </div>
              <h1 className="mb-4 text-3xl font-light tracking-tight text-foreground md:text-4xl lg:text-5xl">
                Adatvédelmi
                <span className="block font-medium">Tájékoztató</span>
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
              {/* Section 1 */}
              <GlassCard variant="subtle">
                <div className="p-6 md:p-8">
                  <h2 className="mb-4 text-2xl font-medium text-foreground">
                    1. Az adatkezelő adatai
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
                  <div className="mt-4 rounded-lg bg-primary/5 p-4 text-sm text-muted-foreground">
                    <p>
                      Az adatkezelő a személyes adatok kezelése során a vonatkozó jogszabályok, különösen az Európai Parlament és a Tanács (EU) 2016/679 rendelete (GDPR) rendelkezései szerint jár el.
                    </p>
                  </div>
                </div>
              </GlassCard>

              {/* Section 2 */}
              <GlassCard variant="subtle">
                <div className="p-6 md:p-8">
                  <h2 className="mb-4 text-2xl font-medium text-foreground">
                    2. Az adatkezelés célja
                  </h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      A Magic Fit AI szolgáltatás célja személyre szabott sminktanácsadás nyújtása mesterséges intelligencia segítségével.
                    </p>
                    <p>Az adatkezelés célja különösen:</p>
                    <ul className="ml-6 space-y-2 list-disc">
                      <li>arckép vizuális elemzése sminkajánláshoz</li>
                      <li>konzultációk elkészítése és megjelenítése</li>
                      <li>felhasználói fiók és kreditek kezelése</li>
                      <li>kapcsolattartás és technikai működés biztosítása</li>
                    </ul>
                  </div>
                </div>
              </GlassCard>

              {/* Section 3 */}
              <GlassCard variant="subtle">
                <div className="p-6 md:p-8">
                  <h2 className="mb-4 text-2xl font-medium text-foreground">
                    3. Kezelt adatok köre
                  </h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>A szolgáltatás használata során az alábbi adatokat kezelhetjük:</p>

                    <div>
                      <h3 className="mb-2 text-lg font-medium text-foreground">
                        3.1. Felhasználó által megadott adatok
                      </h3>
                      <ul className="ml-6 space-y-2 list-disc">
                        <li>feltöltött arckép (fotó)</li>
                        <li>e-mail cím</li>
                        <li>vásárlással kapcsolatos adatok (kreditcsomag)</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="mb-2 text-lg font-medium text-foreground">
                        3.2. Automatikusan gyűjtött adatok
                      </h3>
                      <ul className="ml-6 space-y-2 list-disc">
                        <li>IP-cím</li>
                        <li>böngésző típusa</li>
                        <li>technikai naplóadatok (cookie-k, session adatok)</li>
                      </ul>
                    </div>

                    <div className="mt-4 space-y-2 rounded-lg bg-amber-500/10 p-4 text-sm">
                      <p className="flex items-start gap-2">
                        <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                        <span>Nem kérünk és nem kezelünk egészségügyi adatokat.</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                        <span>Az arckép nem biometrikus azonosítás céljából kerül feldolgozásra.</span>
                      </p>
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Section 4 */}
              <GlassCard variant="subtle">
                <div className="p-6 md:p-8">
                  <h2 className="mb-4 text-2xl font-medium text-foreground">
                    4. Az arcképek kezelése
                  </h2>
                  <div className="space-y-3 text-muted-foreground">
                    <ul className="ml-6 space-y-2 list-disc">
                      <li>A feltöltött képek kizárólag az elemzés idejére kerülnek feldolgozásra.</li>
                      <li>Az arcképek nem kerülnek nyilvános felhasználásra, nem publikáljuk őket.</li>
                      <li>Az elemzés nem személyazonosításra, kizárólag vizuális jellemzők értelmezésére szolgál.</li>
                      <li>Az arcképek harmadik fél számára nem kerülnek átadásra marketing célból.</li>
                    </ul>
                  </div>
                </div>
              </GlassCard>

              {/* Section 5 */}
              <GlassCard variant="subtle">
                <div className="p-6 md:p-8">
                  <h2 className="mb-4 text-2xl font-medium text-foreground">
                    5. Adatkezelés jogalapja
                  </h2>
                  <div className="space-y-3 text-muted-foreground">
                    <p>Az adatkezelés jogalapja:</p>
                    <ul className="ml-6 space-y-2 list-disc">
                      <li>az érintett önkéntes hozzájárulása (GDPR 6. cikk (1) a))</li>
                      <li>szerződés teljesítése (szolgáltatás nyújtása)</li>
                    </ul>
                  </div>
                </div>
              </GlassCard>

              {/* Section 6 */}
              <GlassCard variant="subtle">
                <div className="p-6 md:p-8">
                  <h2 className="mb-4 text-2xl font-medium text-foreground">
                    6. Adattárolás időtartama
                  </h2>
                  <div className="space-y-3 text-muted-foreground">
                    <ul className="ml-6 space-y-2 list-disc">
                      <li><strong>Fiókadatok:</strong> a felhasználói fiók fennállásáig</li>
                      <li><strong>Feltöltött képek:</strong> az elemzést követően automatikusan törlésre kerülnek, vagy anonimizálódnak</li>
                      <li><strong>Számlázási adatok:</strong> jogszabály szerint</li>
                    </ul>
                  </div>
                </div>
              </GlassCard>

              {/* Section 7 */}
              <GlassCard variant="subtle">
                <div className="p-6 md:p-8">
                  <h2 className="mb-4 text-2xl font-medium text-foreground">
                    7. Adatfeldolgozók
                  </h2>
                  <div className="space-y-3 text-muted-foreground">
                    <p>A szolgáltatás működtetése során igénybe vehetünk:</p>
                    <ul className="ml-6 space-y-2 list-disc">
                      <li>tárhelyszolgáltatót</li>
                      <li>fizetési szolgáltatót</li>
                      <li>AI feldolgozó szolgáltatást</li>
                    </ul>
                    <p className="mt-4">Minden adatfeldolgozó GDPR-kompatibilis.</p>
                  </div>
                </div>
              </GlassCard>

              {/* Section 8 */}
              <GlassCard variant="subtle">
                <div className="p-6 md:p-8">
                  <h2 className="mb-4 text-2xl font-medium text-foreground">
                    8. Az érintett jogai
                  </h2>
                  <div className="space-y-3 text-muted-foreground">
                    <p>A felhasználó jogosult:</p>
                    <ul className="ml-6 space-y-2 list-disc">
                      <li>tájékoztatást kérni az adatkezelésről</li>
                      <li>adatai helyesbítését kérni</li>
                      <li>adatai törlését kérni</li>
                      <li>hozzájárulását bármikor visszavonni</li>
                      <li>panaszt tenni a Nemzeti Adatvédelmi és Információszabadság Hatóságnál (NAIH)</li>
                    </ul>
                  </div>
                </div>
              </GlassCard>

              {/* Section 9 */}
              <GlassCard variant="elevated">
                <div className="p-6 md:p-8">
                  <h2 className="mb-4 flex items-center gap-2 text-2xl font-medium text-foreground">
                    <Mail className="h-6 w-6 text-primary" />
                    9. Kapcsolat
                  </h2>
                  <div className="space-y-3 text-muted-foreground">
                    <p>Adatvédelmi kérdés esetén:</p>
                    <p className="text-lg">
                      <strong className="text-foreground">📧 E-mail:</strong> novakbernadett94@gmail.com
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
