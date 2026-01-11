"use client"

interface ConsultationProgressProps {
  currentStep: number
  totalSteps: number
  currentTheme: string
}

export function ConsultationProgress({
  currentStep,
  totalSteps,
  currentTheme,
}: ConsultationProgressProps) {
  const percentage = Math.round((currentStep / totalSteps) * 100)

  return (
    <div className="fade-in mx-auto max-w-md space-y-4">
      {/* Visual dots */}
      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              index < currentStep
                ? "bg-primary"
                : index === currentStep
                  ? "bg-primary/60 ring-4 ring-primary/20"
                  : "bg-border"
            }`}
          />
        ))}
      </div>

      {/* Theme text */}
      <p className="text-center text-sm tracking-wide text-muted-foreground">
        {currentTheme}
      </p>

      {/* Optional: percentage or remaining count */}
      {/* <p className="text-center text-xs text-muted-foreground/60">
        Még {totalSteps - currentStep} kérdés
      </p> */}
    </div>
  )
}
