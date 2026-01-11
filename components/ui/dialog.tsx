"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/* ==========================================================================
   ROOT
   ========================================================================== */

function Dialog(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger(props: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

/**
 * IMPORTANT:
 * Force portal to render into document.body to avoid "fixed inside transformed parent"
 * bugs that cause off-center dialogs.
 */
function DialogPortal(props: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  const [container, setContainer] = React.useState<HTMLElement | null>(null)

  React.useEffect(() => {
    setContainer(document.body)
  }, [])

  return (
    <DialogPrimitive.Portal
      data-slot="dialog-portal"
      container={container ?? undefined}
      {...props}
    />
  )
}

function DialogClose(props: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

/* ==========================================================================
   OVERLAY
   ========================================================================== */

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/40",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "duration-[260ms] ease-[cubic-bezier(.16,1,.3,1)]",
        className
      )}
      {...props}
    />
  )
}

/* ==========================================================================
   CONTENT (TRULY CENTERED + BIGGER)
   ========================================================================== */

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
}) {
  return (
    <DialogPortal>
      <DialogOverlay />

      {/* Fullscreen wrapper */}
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center p-6",
          "min-h-[100svh] outline-none",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "duration-[260ms] ease-[cubic-bezier(.16,1,.3,1)]"
        )}
        {...props}
      >
        {/* Actual modal box */}
        <div
          className={cn(
            "relative grid w-full gap-6 rounded-[18px] bg-white p-8 shadow-lg md:p-10",
            // Bigger default:
            "max-w-3xl",
            // Usable on small screens:
            "max-h-[calc(100svh-2rem)] overflow-y-auto",
            // Pop animation:
            "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
            "transition-transform duration-[260ms] ease-[cubic-bezier(.16,1,.3,1)]",
            className
          )}
        >
          {children}

          {showCloseButton && (
            <DialogPrimitive.Close
              data-slot="dialog-close"
              className={cn(
                "absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-md",
                "opacity-70 transition-opacity hover:opacity-100",
                "focus:outline-none focus:ring-2 focus:ring-offset-2"
              )}
            >
              <XIcon className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          )}
        </div>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

/* ==========================================================================
   STRUCTURAL HELPERS
   ========================================================================== */

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-left", className)}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-xl font-semibold leading-none", className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

/* ==========================================================================
   EXPORTS
   ========================================================================== */

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
