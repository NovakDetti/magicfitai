"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { refinementOptions } from "@/lib/consultation-types"
import type { HairColor, EyeColor } from "@/lib/consultation-types"

interface RefinementStepProps {
  hairColor?: HairColor
  eyeColor?: EyeColor
  onHairColorChange: (value: HairColor) => void
  onEyeColorChange: (value: EyeColor) => void
  onNext: () => void
  onSkip: () => void
  onBack: () => void
}

export function RefinementStep({
  hairColor,
  eyeColor,
  onHairColorChange,
  onEyeColorChange,
  onNext,
  onSkip,
  onBack,
}: RefinementStepProps) {
  const [localHairColor, setLocalHairColor] = useState(hairColor || "")
  const [localEyeColor, setLocalEyeColor] = useState(eyeColor || "")

  const handleNext = () => {
    if (localHairColor) onHairColorChange(localHairColor as HairColor)
    if (localEyeColor) onEyeColorChange(localEyeColor as EyeColor)
    onNext()
  }

  const hasAnySelection = localHairColor || localEyeColor

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Header */}
      <div className="fade-up space-y-3 text-center">
        <h2 className="text-2xl font-medium tracking-tight text-foreground md:text-3xl">
          Szeretné pontosítani az ajánlást?
        </h2>
        <p className="text-muted-foreground">
          Ezek az információk segítenek még személyesebb javaslatot adni.
          Ez a lépés opcionális.
        </p>
      </div>

      {/* Options */}
      <Card className="glass-card fade-up overflow-hidden rounded-[24px] border-0">
        <CardContent className="space-y-8 p-8 md:p-10">
          {/* Hair color */}
          <div className="space-y-3">
            <label className="text-sm font-medium tracking-wide text-foreground">
              {refinementOptions.hairColor.label}
            </label>
            <Select value={localHairColor} onValueChange={setLocalHairColor}>
              <SelectTrigger className="h-14 w-full rounded-[14px] border-border/50 bg-background/50 text-base">
                <SelectValue placeholder="Válassza ki hajszínét" />
              </SelectTrigger>
              <SelectContent className="rounded-[14px]">
                {refinementOptions.hairColor.options.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="rounded-[10px]">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Eye color */}
          <div className="space-y-3">
            <label className="text-sm font-medium tracking-wide text-foreground">
              {refinementOptions.eyeColor.label}
            </label>
            <Select value={localEyeColor} onValueChange={setLocalEyeColor}>
              <SelectTrigger className="h-14 w-full rounded-[14px] border-border/50 bg-background/50 text-base">
                <SelectValue placeholder="Válassza ki szemszínét" />
              </SelectTrigger>
              <SelectContent className="rounded-[14px]">
                {refinementOptions.eyeColor.options.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="rounded-[10px]">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          size="lg"
          onClick={onBack}
          className="h-12 rounded-[12px] px-8 font-medium"
        >
          Vissza
        </Button>
        <div className="flex gap-3">
          <Button
            variant="ghost"
            size="lg"
            onClick={onSkip}
            className="h-12 rounded-[12px] px-6 font-medium text-muted-foreground"
          >
            Kihagyás
          </Button>
          <Button
            size="lg"
            onClick={handleNext}
            disabled={!hasAnySelection}
            className="h-12 rounded-[12px] px-8 font-medium"
          >
            Elemzés indítása
          </Button>
        </div>
      </div>
    </div>
  )
}
