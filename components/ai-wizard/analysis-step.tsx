"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"

interface AnalysisStepProps {
  onComplete: () => void
}

export function AnalysisStep({ onComplete }: AnalysisStepProps) {
  const [progress, setProgress] = useState(0)
  const [currentText, setCurrentText] = useState("Arcvonások elemzése")

  const steps = [
    "Arcvonások elemzése",
    "Bőrszín meghatározása",
    "Szemszín azonosítása",
    "Harmonizáló színek kiválasztása",
    "Személyes javaslatok összeállítása",
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 2
        const stepIndex = Math.min(Math.floor(next / 20), steps.length - 1)
        setCurrentText(steps[stepIndex])

        if (next >= 100) {
          clearInterval(interval)
          setTimeout(onComplete, 500)
          return 100
        }
        return next
      })
    }, 100)

    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <div className="mx-auto max-w-3xl">
      <Card className="glass-card fade-up overflow-hidden rounded-[24px] border-0">
        <CardContent className="flex flex-col items-center justify-center p-12 md:p-16">
          {/* Elegant loading indicator */}
          <div className="relative mb-10">
            <div className="h-24 w-24 rounded-full bg-primary/10" />
            <div
              className="absolute inset-0 rounded-full border-2 border-primary/30"
              style={{
                background: `conic-gradient(from 0deg, var(--primary) ${progress}%, transparent ${progress}%)`,
                mask: "radial-gradient(circle, transparent 40%, black 41%)",
                WebkitMask: "radial-gradient(circle, transparent 40%, black 41%)",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-light text-foreground">{progress}%</span>
            </div>
          </div>

          <h2 className="mb-3 text-2xl font-medium tracking-tight text-foreground">
            Elemzés folyamatban
          </h2>
          <p className="mb-8 text-muted-foreground">{currentText}</p>

          <div className="h-1 w-full max-w-sm overflow-hidden rounded-full bg-secondary/60">
            <div
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
