"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

export interface Step {
  id: number
  title: string
  description?: string
}

interface StepperProps {
  steps: Step[]
  currentStep: number
  className?: string
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <div className={cn("w-full", className)}>
      {/* Desktop stepper */}
      <div className="hidden md:flex items-center justify-center gap-4">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id
          const isCurrent = currentStep === step.id
          const isUpcoming = currentStep < step.id

          return (
            <div key={step.id} className="flex items-center">
              {/* Step circle */}
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full font-medium transition-all duration-300",
                    isCompleted && "bg-primary text-primary-foreground",
                    isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                    isUpcoming && "bg-secondary/60 text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs tracking-wide transition-colors",
                    isCurrent || isCompleted ? "text-foreground font-medium" : "text-muted-foreground"
                  )}
                >
                  {step.title}
                </span>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "mx-4 h-px w-16 transition-colors duration-300",
                    currentStep > step.id ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile stepper - dots */}
      <div className="flex md:hidden items-center justify-center gap-2">
        {steps.map((step) => {
          const isCompleted = currentStep > step.id
          const isCurrent = currentStep === step.id

          return (
            <div
              key={step.id}
              className={cn(
                "h-2.5 w-2.5 rounded-full transition-all duration-300",
                isCompleted && "bg-primary",
                isCurrent && "bg-primary w-8",
                !isCompleted && !isCurrent && "bg-border"
              )}
            />
          )
        })}
      </div>

      {/* Mobile current step title */}
      <p className="mt-3 text-center text-sm font-medium text-foreground md:hidden">
        {steps.find((s) => s.id === currentStep)?.title}
      </p>
    </div>
  )
}
