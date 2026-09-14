"use client"

import Link from "next/link"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type AuthGateModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  actionLabel: string
  returnTo?: string
  /** Título del diálogo; por defecto mensaje genérico */
  title?: string
  /** Texto bajo el título */
  description?: string
}

export function AuthGateModal({
  open,
  onOpenChange,
  actionLabel,
  returnTo = "/",
  title,
  description,
}: AuthGateModalProps) {
  const redirect = encodeURIComponent(returnTo)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-[#0D0D0D] text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {title ?? 'Creá tu cuenta para continuar'}
          </DialogTitle>
          <DialogDescription className="text-white/60">
            {description ??
              `Para ${actionLabel} necesitás una cuenta real (no anónima). ¿Ya tenés una?`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" asChild className="border-white/20">
            <Link href={`/login?redirect=${redirect}`} onClick={() => onOpenChange(false)}>
              Iniciar sesión
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/registro?redirect=${redirect}`} onClick={() => onOpenChange(false)}>
              Registrarme
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
