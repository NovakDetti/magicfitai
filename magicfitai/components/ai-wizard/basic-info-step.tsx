"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface BasicInfoStepProps {
  occasion: string
  isGlasses: boolean
  isSensitive: boolean
  onOccasionChange: (value: string) => void
  onGlassesChange: (value: boolean) => void
  onSensitiveChange: (value: boolean) => void
  onNext: () => void
  onBack: () => void
}

export function BasicInfoStep({
  occasion,
  isGlasses,
  isSensitive,
  onOccasionChange,
  onGlassesChange,
  onSensitiveChange,
  onNext,
  onBack,
}: BasicInfoStepProps) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card className="glass-card fade-up overflow-hidden rounded-[24px] border-0">
        <CardContent className="space-y-8 p-8 md:p-10">
          <div className="space-y-3">
            <label className="text-sm font-medium tracking-wide text-foreground">
              Milyen alkalomra szánja a sminket?
            </label>
            <Select value={occasion} onValueChange={onOccasionChange}>
              <SelectTrigger className="h-14 w-full rounded-[14px] border-border/50 bg-background/50 text-base">
                <SelectValue placeholder="Válassza ki az alkalmat" />
              </SelectTrigger>
              <SelectContent className="rounded-[14px]">
                <SelectItem value="daily" className="rounded-[10px]">Mindennapi harmónia</SelectItem>
                <SelectItem value="work" className="rounded-[10px]">Hivatalos alkalmak</SelectItem>
                <SelectItem value="date" className="rounded-[10px]">Esti megjelenés</SelectItem>
                <SelectItem value="party" className="rounded-[10px]">Különleges események</SelectItem>
                <SelectItem value="photoshoot" className="rounded-[10px]">Fotózás</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-medium tracking-wide text-foreground">További információk</p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="glasses"
                  checked={isGlasses}
                  onCheckedChange={(checked) => onGlassesChange(checked as boolean)}
                />
                <label htmlFor="glasses" className="cursor-pointer text-sm text-muted-foreground">
                  Szemüveget viselek
                </label>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  id="sensitive"
                  checked={isSensitive}
                  onCheckedChange={(checked) => onSensitiveChange(checked as boolean)}
                />
                <label htmlFor="sensitive" className="cursor-pointer text-sm text-muted-foreground">
                  Érzékeny bőrrel rendelkezem
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-2">
        <Button
          variant="outline"
          size="lg"
          onClick={onBack}
          className="h-12 rounded-[12px] px-8 font-medium"
        >
          Vissza
        </Button>
        <Button
          size="lg"
          onClick={onNext}
          disabled={!occasion}
          className="h-12 rounded-[12px] px-8 font-medium"
        >
          Tovább
        </Button>
      </div>
    </div>
  )
}
