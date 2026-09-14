"use client"

import { useState } from "react"
import { Check } from "lucide-react"

import { AuthGateModal } from "@/components/auth-gate-modal"
import { useAuthSession } from "@/components/providers/auth-session-provider"
import { toggleEventRegistration } from "@/app/actions/event-registration"
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"

type EventSubscribeButtonProps = {
  eventId: string
  registrationUrl?: string
  initialIsRegistered: boolean
}

export function EventSubscribeButton({
  eventId,
  registrationUrl,
  initialIsRegistered,
}: EventSubscribeButtonProps) {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [isRegistered, setIsRegistered] = useState(initialIsRegistered)
  const [pending, setPending] = useState(false)
  const { isAuthenticated } = useAuthSession()

  const handleClick = async () => {
    if (!isAuthenticated) {
      setAuthModalOpen(true)
      return
    }

    setPending(true)
    const res = await toggleEventRegistration(eventId)
    setPending(false)

    if (!res.ok) {
      toast({ variant: "destructive", title: "Error", description: res.message })
      return
    }

    const nowRegistered = res.registered
    setIsRegistered(nowRegistered)

    if (nowRegistered) {
      toast({ title: "Inscripción confirmada", description: "Quedaste anotado a este evento." })
      if (registrationUrl) {
        window.open(registrationUrl, "_blank", "noopener,noreferrer")
      }
    } else {
      toast({ title: "Inscripción cancelada" })
    }
  }

  return (
    <>
      <AuthGateModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        actionLabel="inscribirte al evento"
        returnTo="/eventos"
        title="Registrate para asegurar tu lugar"
        description="Con una cuenta real podés inscribirte, recibir recordatorios y gestionar tus eventos desde el Hub."
      />
      <Button
        onClick={() => void handleClick()}
        disabled={pending}
        variant={isRegistered ? "secondary" : "default"}
        size="sm"
        className="gap-2"
      >
        {isRegistered ? (
          <>
            <Check className="h-3.5 w-3.5" />
            Inscrito
          </>
        ) : (
          pending ? "Procesando..." : "Inscribirme"
        )}
      </Button>
    </>
  )
}
