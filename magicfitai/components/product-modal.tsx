"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  lookTitle: string
}

export function ProductModal({ isOpen, onClose, lookTitle }: ProductModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Ehhez a sminkhez ajánlott termékek</DialogTitle>
          <DialogDescription className="text-base">{lookTitle}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                1
              </div>
              <div>
                <p className="font-semibold text-foreground">Alapozó</p>
                <p className="text-sm text-muted-foreground">Könnyű, természetes fedés</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                2
              </div>
              <div>
                <p className="font-semibold text-foreground">Szemhéjpúder</p>
                <p className="text-sm text-muted-foreground">Meleg, lágy árnyalatok</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                3
              </div>
              <div>
                <p className="font-semibold text-foreground">Rúzs</p>
                <p className="text-sm text-muted-foreground">Természetes rózsás tónus</p>
              </div>
            </div>
          </div>

          <div className="rounded-[14px] bg-secondary/60 p-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Megjegyzés:</span> Konkrét márka ajánlásokat talál a részletes elemzésben.
            </p>
          </div>

          <Button className="w-full" size="lg">
            <Download className="mr-2 h-4 w-4" />
            Letöltöm a smink összefoglalót
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
