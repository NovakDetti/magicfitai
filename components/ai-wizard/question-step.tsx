"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import type { ConsultationQuestion } from "@/lib/consultation-types"

interface QuestionStepProps {
  question: ConsultationQuestion
  currentValue: string | string[] | undefined
  onAnswer: (value: string | string[]) => void
  onBack?: () => void
  onNext: () => void
  isFirst?: boolean
  transitionMessage?: string
}

export function QuestionStep({
  question,
  currentValue,
  onAnswer,
  onBack,
  onNext,
  isFirst = false,
  transitionMessage,
}: QuestionStepProps) {
  const [selected, setSelected] = useState<string[]>(() => {
    if (!currentValue) return []
    return Array.isArray(currentValue) ? currentValue : [currentValue]
  })
  const [showTransition, setShowTransition] = useState(false)

  useEffect(() => {
    if (transitionMessage) {
      setShowTransition(true)
      const timer = setTimeout(() => setShowTransition(false), 1500)
      return () => clearTimeout(timer)
    }
  }, [transitionMessage])

  const handleSelect = (value: string) => {
    if (question.allowMultiple) {
      setSelected((prev) => {
        if (prev.includes(value)) {
          return prev.filter((v) => v !== value)
        }
        // Limit to 2 selections for focus question
        if (question.id === "personalFocus" && prev.length >= 2) {
          return [...prev.slice(1), value]
        }
        return [...prev, value]
      })
    } else {
      setSelected([value])
    }
  }

  const handleNext = () => {
    if (selected.length > 0) {
      onAnswer(question.allowMultiple ? selected : selected[0])
      onNext()
    }
  }

  const canProceed = selected.length > 0

  if (showTransition && transitionMessage) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="fade-in flex min-h-[300px] items-center justify-center">
          <p className="text-center text-lg text-muted-foreground">{transitionMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Question header */}
      <div className="fade-up space-y-3 text-center">
        <h2 className="text-2xl font-medium tracking-tight text-foreground md:text-3xl">
          {question.question}
        </h2>
        {question.microcopy && (
          <p className="text-muted-foreground">{question.microcopy}</p>
        )}
      </div>

      {/* Options */}
      <div className="stagger-children space-y-3">
        {question.options.map((option) => {
          const isSelected = selected.includes(option.value)
          return (
            <Card
              key={option.value}
              className={`glass-card cursor-pointer overflow-hidden rounded-[20px] border-0 transition-all duration-300 ${
                isSelected ? "ring-2 ring-primary" : "hover:ring-1 hover:ring-primary/30"
              }`}
              onClick={() => handleSelect(option.value)}
            >
              <CardContent className="flex items-center gap-4 p-5 md:p-6">
                {/* Selection indicator */}
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                    isSelected
                      ? "border-primary bg-primary"
                      : "border-border bg-transparent"
                  }`}
                >
                  {isSelected && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <p className="font-medium text-foreground">{option.label}</p>
                  {option.description && (
                    <p className="mt-0.5 text-sm text-muted-foreground">{option.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Navigation */}
      <div className={`flex pt-4 ${isFirst ? "justify-end" : "justify-between"}`}>
        {!isFirst && onBack && (
          <Button
            variant="outline"
            size="lg"
            onClick={onBack}
            className="h-12 rounded-[12px] px-8 font-medium"
          >
            Vissza
          </Button>
        )}
        <Button
          size="lg"
          onClick={handleNext}
          disabled={!canProceed}
          className="h-12 rounded-[12px] px-8 font-medium"
        >
          Tovább
        </Button>
      </div>
    </div>
  )
}
