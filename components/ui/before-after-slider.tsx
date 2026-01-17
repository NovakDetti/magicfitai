"use client"

import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface BeforeAfterSliderProps {
  beforeImage: string
  afterImage: string
  beforeLabel?: string
  afterLabel?: string
  beforeImageClassName?: string
  afterImageClassName?: string
  initialPosition?: number
  className?: string
  aspectRatio?: "square" | "portrait" | "landscape"
}

/**
 * BeforeAfterSlider - A draggable comparison slider for before/after images
 *
 * Features:
 * - Draggable vertical divider
 * - Touch-friendly (mobile)
 * - Keyboard accessible (arrow keys)
 * - Works in modals and normal pages
 */
export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = "Előtte",
  afterLabel = "Utána",
  beforeImageClassName,
  afterImageClassName,
  initialPosition = 50,
  className,
  aspectRatio = "portrait",
}: BeforeAfterSliderProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [sliderPosition, setSliderPosition] = React.useState(initialPosition)
  const [isDragging, setIsDragging] = React.useState(false)

  const aspectRatioClass = {
    square: "aspect-square",
    portrait: "aspect-[3/4]",
    landscape: "aspect-[4/3]",
  }[aspectRatio]

  const updateSliderPosition = React.useCallback((clientX: number) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setSliderPosition(percentage)
  }, [])

  const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    updateSliderPosition(e.clientX)
  }, [updateSliderPosition])

  const handleTouchStart = React.useCallback((e: React.TouchEvent) => {
    setIsDragging(true)
    updateSliderPosition(e.touches[0].clientX)
  }, [updateSliderPosition])

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      updateSliderPosition(e.clientX)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return
      updateSliderPosition(e.touches[0].clientX)
    }

    const handleEnd = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleEnd)
      document.addEventListener("touchmove", handleTouchMove)
      document.addEventListener("touchend", handleEnd)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleEnd)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleEnd)
    }
  }, [isDragging, updateSliderPosition])

  // Keyboard navigation
  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 2

    if (e.key === "ArrowLeft") {
      e.preventDefault()
      setSliderPosition((prev) => Math.max(0, prev - step))
    } else if (e.key === "ArrowRight") {
      e.preventDefault()
      setSliderPosition((prev) => Math.min(100, prev + step))
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden rounded-xl bg-secondary/30 select-none",
        aspectRatioClass,
        className
      )}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      role="slider"
      aria-label="Előtte-utána összehasonlító csúszka"
      aria-valuenow={Math.round(sliderPosition)}
      aria-valuemin={0}
      aria-valuemax={100}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* After image (full width, shown behind) */}
      <div className="absolute inset-0">
        <Image
          src={afterImage}
          alt={afterLabel}
          fill
          className={cn("object-cover", afterImageClassName)}
          draggable={false}
        />
      </div>

      {/* Before image (clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <div className="relative h-full" style={{ width: `${100 / (sliderPosition / 100)}%` }}>
          <Image
            src={beforeImage}
            alt={beforeLabel}
            fill
            className={cn("object-cover", beforeImageClassName)}
            draggable={false}
          />
        </div>
      </div>

      {/* Slider handle */}
      <div
        className="absolute top-0 bottom-0 z-10"
        style={{ left: `${sliderPosition}%` }}
      >
        {/* Vertical line */}
        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 -translate-x-1/2 bg-white shadow-lg" />

        {/* Handle circle */}
        <div
          className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
            "flex h-10 w-10 items-center justify-center",
            "rounded-full bg-white shadow-lg",
            "transition-transform",
            isDragging && "scale-110"
          )}
        >
          {/* Arrows */}
          <div className="flex items-center gap-0.5 text-primary">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-between px-3">
        <span
          className={cn(
            "rounded-full bg-background/80 px-3 py-1 text-xs font-medium backdrop-blur-sm transition-opacity",
            sliderPosition < 15 ? "opacity-0" : "opacity-100"
          )}
        >
          {beforeLabel}
        </span>
        <span
          className={cn(
            "rounded-full bg-background/80 px-3 py-1 text-xs font-medium backdrop-blur-sm transition-opacity",
            sliderPosition > 85 ? "opacity-0" : "opacity-100"
          )}
        >
          {afterLabel}
        </span>
      </div>

      {/* Instruction hint (shows on first interaction) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
        <span className="rounded-full bg-background/80 px-3 py-1 text-xs text-muted-foreground backdrop-blur-sm">
          Húzd a csúszkát az összehasonlításhoz
        </span>
      </div>
    </div>
  )
}
