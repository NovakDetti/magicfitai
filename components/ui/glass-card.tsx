"use client"

import { forwardRef } from "react"
import { cn } from "@/lib/utils"

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "subtle"
  noPadding?: boolean
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", noPadding = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-[24px] transition-all duration-300",
          // Glass effect base
          "backdrop-blur-[22px] backdrop-saturate-[130%]",
          // Variants
          variant === "default" && [
            "bg-white/45 dark:bg-white/10",
            "border border-white/30 dark:border-white/10",
            "shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]",
          ],
          variant === "elevated" && [
            "bg-white/55 dark:bg-white/15",
            "border border-white/40 dark:border-white/15",
            "shadow-[0_20px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.4)]",
          ],
          variant === "subtle" && [
            "bg-white/25 dark:bg-white/5",
            "border border-white/20 dark:border-white/5",
            "shadow-[0_4px_16px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.2)]",
          ],
          // Padding
          !noPadding && "p-6 md:p-8",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
GlassCard.displayName = "GlassCard"

export { GlassCard }
