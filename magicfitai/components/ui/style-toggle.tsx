"use client"

import * as React from "react"
import { Feather, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

export type StylePreference = "letisztult" | "hatarozott"

interface StyleToggleProps {
  value: StylePreference
  onChange: (value: StylePreference) => void
  className?: string
  disabled?: boolean
}

/**
 * StyleToggle - A segmented control for selecting makeup style preference
 *
 * Options:
 * - Letisztult (Clean/Minimal): Natural, understated makeup look
 * - Határozott (Bold/Defined): More dramatic, statement makeup look
 *
 * This affects the AI prompt to generate appropriate recommendations.
 */
export function StyleToggle({
  value,
  onChange,
  className,
  disabled = false,
}: StyleToggleProps) {
  return (
    <div className={cn("w-full", className)}>
      <label className="mb-2 block text-sm font-medium text-foreground">
        Milyen stílust preferálsz?
      </label>
      <div
        className={cn(
          "relative flex rounded-[14px] bg-secondary/30 p-1",
          disabled && "opacity-50 pointer-events-none"
        )}
        role="radiogroup"
        aria-label="Smink stílus preferencia"
      >
        {/* Sliding background indicator */}
        <div
          className={cn(
            "absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-[10px] bg-primary shadow-md transition-transform duration-200 ease-out",
            value === "hatarozott" && "translate-x-[calc(100%+4px)]"
          )}
        />

        {/* Letisztult option */}
        <button
          type="button"
          role="radio"
          aria-checked={value === "letisztult"}
          onClick={() => onChange("letisztult")}
          disabled={disabled}
          className={cn(
            "relative z-10 flex flex-1 items-center justify-center gap-2 rounded-[10px] py-3 text-sm font-medium transition-colors",
            value === "letisztult"
              ? "text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Feather className="h-4 w-4" />
          <span>Letisztult</span>
        </button>

        {/* Határozott option */}
        <button
          type="button"
          role="radio"
          aria-checked={value === "hatarozott"}
          onClick={() => onChange("hatarozott")}
          disabled={disabled}
          className={cn(
            "relative z-10 flex flex-1 items-center justify-center gap-2 rounded-[10px] py-3 text-sm font-medium transition-colors",
            value === "hatarozott"
              ? "text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Zap className="h-4 w-4" />
          <span>Határozott</span>
        </button>
      </div>

      {/* Description text */}
      <p className="mt-2 text-xs text-muted-foreground">
        {value === "letisztult" ? (
          <>Természetes, visszafogott smink, amely kiemeli az arcvonásaidat.</>
        ) : (
          <>Merészebb, karakteresebb megjelenés, hangsúlyos elemekkel.</>
        )}
      </p>
    </div>
  )
}

/**
 * Example of how the style preference affects the AI prompt:
 *
 * For "letisztult" (Clean):
 * - Use softer, more natural colors
 * - Lighter coverage products
 * - Subtle contouring
 * - Natural-looking brows
 * - Nude or MLBB lip colors
 *
 * For "hatarozott" (Bold):
 * - More saturated colors
 * - Fuller coverage where needed
 * - More defined contouring
 * - Bolder brow definition
 * - Richer lip colors and eye makeup
 *
 * Prompt modifier example:
 * ```
 * const styleModifier = stylePreference === "letisztult"
 *   ? "Focus on natural, understated makeup with soft colors, light coverage, and subtle enhancements that enhance natural beauty without looking overly done."
 *   : "Create more defined, statement makeup with bolder colors, more dramatic contouring, and enhanced features that make a confident impression."
 * ```
 */
export function getStylePromptModifier(style: StylePreference): string {
  if (style === "letisztult") {
    return `
The user prefers a CLEAN/MINIMAL makeup style (Letisztult):
- Use soft, natural colors that complement skin tone
- Recommend lighter coverage products
- Suggest subtle contouring techniques
- Keep brows natural and groomed
- Prefer nude, MLBB (My Lips But Better), or soft pink lip colors
- Focus on enhancing natural features rather than transforming
- Avoid heavy eye makeup; stick to light washes of color
- Emphasize skincare-focused, dewy finishes
`
  }

  return `
The user prefers a BOLD/DEFINED makeup style (Határozott):
- Use more saturated, impactful colors
- Can recommend fuller coverage products where appropriate
- Suggest more defined contouring and sculpting
- Create bolder, more structured brows
- Include richer lip colors like berry, wine, or classic red options
- Don't shy away from smoky eyes or defined liner looks
- Include highlighting for dimension
- Aim for polished, statement-making looks
`
}
