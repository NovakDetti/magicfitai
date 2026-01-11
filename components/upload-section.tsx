"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import { ResultsSection } from "@/components/results-section"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function UploadSection() {
  const [uploaded, setUploaded] = useState(false)
  const [occasion, setOccasion] = useState("")

  const handleUpload = () => {
    // Simulate upload
    setUploaded(true)
  }

  if (uploaded) {
    return <ResultsSection />
  }

  return (
    <section id="ai-elemzo" className="px-4 py-12 md:py-16">
      <div className="container mx-auto max-w-2xl">
        <h2 className="mb-8 text-center text-3xl font-bold text-foreground md:text-4xl">Kezdd el most</h2>

        <Card className="fade-up border-2 border-dashed border-border">
          <CardContent className="flex flex-col items-center p-12 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Upload className="h-10 w-10 text-primary" />
            </div>

            <h3 className="mb-3 text-xl font-semibold text-foreground">Válassz képet</h3>

            <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
              Elölről készült, természetes arckép ajánlott.
            </p>

            <div className="mb-6 w-full max-w-xs">
              <label className="mb-2 block text-sm font-medium text-foreground">
                Milyen alkalomra szeretnél sminket?
              </label>
              <Select value={occasion} onValueChange={setOccasion}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Válassz alkalmat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nappali">Nappali</SelectItem>
                  <SelectItem value="elegans">Elegáns</SelectItem>
                  <SelectItem value="alkalmi">Alkalmi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button size="lg" className="px-8" onClick={handleUpload}>
              Fotó kiválasztása
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
