'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { deleteEvent } from '@/app/actions/events'
import { useToast } from '@/hooks/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export function DeleteEventButton({ eventId, eventTitle }: { eventId: string; eventTitle: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [pending, setPending] = useState(false)

  const handleDelete = async () => {
    setPending(true)
    const res = await deleteEvent(eventId)
    setPending(false)

    if (!res.ok) {
      toast({ variant: 'destructive', title: 'No se pudo eliminar', description: res.message })
      return
    }

    toast({ title: 'Evento eliminado' })
    router.refresh()
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          disabled={pending}
          className="flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-red-400 transition-all hover:border-red-500/40 hover:bg-red-500/10 disabled:opacity-50"
          aria-label={`Eliminar evento ${eventTitle}`}
        >
          <Trash2 className="h-3 w-3" />
          Eliminar
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="border-white/10 bg-[#111] text-white">
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar este evento?</AlertDialogTitle>
          <AlertDialogDescription className="text-white/50">
            Esta acción es permanente. Se eliminará <span className="text-white/80 font-medium">{eventTitle}</span> y
            todas sus inscripciones.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-white/10 bg-white/5 text-white hover:bg-white/10">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={pending}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            Sí, eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
