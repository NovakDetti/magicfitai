"use client"

import { useState, useEffect } from "react"
import { Star, Loader2, Check } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/components/language-provider"

interface RatingFormProps {
  analysisId: string
  onRatingSubmitted?: () => void
}

export function RatingForm({ analysisId, onRatingSubmitted }: RatingFormProps) {
  const { language } = useLanguage()
  const t = (hu: string, en: string) => (language === "hu" ? hu : en)

  const [rating, setRating] = useState<number>(0)
  const [hoveredRating, setHoveredRating] = useState<number>(0)
  const [comment, setComment] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchExistingRating()
  }, [analysisId])

  const fetchExistingRating = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/analysis/${analysisId}/rating`)
      if (res.ok) {
        const data = await res.json()
        if (data && data.rating) {
          setRating(data.rating)
          setComment(data.comment || "")
          setHasSubmitted(true)
        }
      }
    } catch (err) {
      console.error("Error fetching rating:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating < 1 || rating > 5) {
      setError(t("Kérlek válassz egy értékelést 1-5 csillag között", "Please select a rating between 1-5 stars"))
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      const res = await fetch(`/api/analysis/${analysisId}/rating`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating,
          comment: comment.trim() || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to submit rating")
      }

      setHasSubmitted(true)
      onRatingSubmitted?.()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t("Nem sikerült elküldeni az értékelést", "Failed to submit rating")
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <GlassCard className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </GlassCard>
    )
  }

  return (
    <GlassCard className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h3 className="text-xl font-medium text-foreground mb-2">
            {hasSubmitted
              ? t("Köszönjük az értékelésed!", "Thank you for your feedback!")
              : t("Értékeld az elemzést", "Rate this analysis")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {hasSubmitted
              ? t("Módosíthatod az értékelésed bármikor", "You can update your rating anytime")
              : t("Segíts nekünk azzal, hogy megosztod véleményed", "Help us by sharing your opinion")}
          </p>
        </div>

        {/* Star Rating */}
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110 active:scale-95"
              disabled={isSubmitting}
            >
              <Star
                className={cn(
                  "h-10 w-10 transition-colors",
                  (hoveredRating >= star || rating >= star)
                    ? "fill-[#B78C86] text-[#B78C86]"
                    : "text-muted-foreground"
                )}
              />
            </button>
          ))}
        </div>

        {/* Rating text */}
        {rating > 0 && (
          <p className="text-center text-sm font-medium text-primary">
            {rating === 1 && t("Nem volt jó", "Not good")}
            {rating === 2 && t("Lehetne jobb", "Could be better")}
            {rating === 3 && t("Rendben van", "It's okay")}
            {rating === 4 && t("Nagyon jó", "Very good")}
            {rating === 5 && t("Kiváló!", "Excellent!")}
          </p>
        )}

        {/* Comment */}
        <div className="space-y-2">
          <label htmlFor="comment" className="text-sm font-medium text-foreground">
            {t("Megjegyzés (opcionális)", "Comment (optional)")}
          </label>
          <Textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t(
              "Mit szerettél, vagy mit lehetne javítani?",
              "What did you like, or what could be improved?"
            )}
            rows={4}
            className="resize-none"
            disabled={isSubmitting}
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Submit button */}
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || rating === 0}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("Küldés...", "Submitting...")}
            </>
          ) : hasSubmitted ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              {t("Értékelés frissítése", "Update rating")}
            </>
          ) : (
            t("Értékelés küldése", "Submit rating")
          )}
        </Button>
      </form>
    </GlassCard>
  )
}
