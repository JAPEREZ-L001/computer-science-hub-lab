'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { saveMentorMatchingProfile, deleteMentorProfile } from '@/app/comunidad/actions'
import { useToast } from '@/hooks/use-toast'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
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

type Initial = {
  role: string
  topics: string
  availability: string
  bio_short: string
  active: boolean
} | null

export function MentorMatchingForm({ initial }: { initial: Initial }) {
  const router = useRouter()
  const { toast } = useToast()
  const [pending, setPending] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [role, setRole] = useState(initial?.role ?? 'student')
  const [topics, setTopics] = useState(initial?.topics ?? '')
  const [availability, setAvailability] = useState(initial?.availability ?? '')
  const [bio_short, setBioShort] = useState(initial?.bio_short ?? '')
  const [active, setActive] = useState(initial?.active ?? true)

  useEffect(() => {
    setRole(initial?.role ?? 'student')
    setTopics(initial?.topics ?? '')
    setAvailability(initial?.availability ?? '')
    setBioShort(initial?.bio_short ?? '')
    setActive(initial?.active ?? true)
  }, [initial])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPending(true)
    const res = await saveMentorMatchingProfile({
      role,
      topics,
      availability,
      bio_short,
      active,
    })
    setPending(false)
    if (!res.ok) {
      toast({ variant: 'destructive', title: 'Error', description: res.message })
      return
    }
    toast({ title: 'Perfil guardado' })
    if (!initial) {
      setRole('student')
      setTopics('')
      setAvailability('')
      setBioShort('')
      setActive(true)
    }
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-white/[0.08] bg-white/[0.02] p-6">
      <h2 className="text-lg font-semibold text-white">Tu perfil de matching</h2>
      <p className="text-sm text-white/45">
        Definí si buscás mentoría, ofrecés acompañamiento o ambos. Solo perfiles activos aparecen en el
        directorio de mentores.
      </p>
      <div className="grid gap-2">
        <Label className="text-white/70">Rol</Label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="border-white/10 bg-white/5 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="student">Busco mentoría</SelectItem>
            <SelectItem value="mentor">Ofrezco mentoría</SelectItem>
            <SelectItem value="both">Ambos</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="m-top" className="text-white/70">
          Temas / stack
        </Label>
        <Input
          id="m-top"
          value={topics}
          onChange={(e) => setTopics(e.target.value)}
          className="border-white/10 bg-white/5 text-white"
          placeholder="React, algoritmos, diseño de APIs…"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="m-av" className="text-white/70">
          Disponibilidad
        </Label>
        <Input
          id="m-av"
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          className="border-white/10 bg-white/5 text-white"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="m-bio" className="text-white/70">
          Bio corta
        </Label>
        <Textarea
          id="m-bio"
          value={bio_short}
          onChange={(e) => setBioShort(e.target.value)}
          rows={3}
          className="border-white/10 bg-white/5 text-white"
        />
      </div>
      <div className="flex items-center justify-between rounded-md border border-white/10 px-3 py-2">
        <Label htmlFor="m-act" className="cursor-pointer text-white/70">
          Visible en directorio (mentores)
        </Label>
        <Switch id="m-act" checked={active} onCheckedChange={setActive} />
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <Button type="submit" disabled={pending}>
          {initial ? 'Actualizar perfil' : 'Crear perfil'}
        </Button>

        {initial && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                type="button"
                disabled={deleting}
                className="rounded-full border border-red-500/20 bg-red-500/5 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-red-400 transition-all hover:border-red-500/40 hover:bg-red-500/10 disabled:opacity-50"
              >
                Eliminar perfil
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-white/10 bg-[#111] text-white">
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar tu perfil de mentor?</AlertDialogTitle>
                <AlertDialogDescription className="text-white/50">
                  Dejarás de aparecer en el directorio de mentores. Podés volver a crearlo en cualquier momento.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-white/10 bg-white/5 text-white hover:bg-white/10">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  disabled={deleting}
                  className="bg-red-600 text-white hover:bg-red-700"
                  onClick={async () => {
                    setDeleting(true)
                    const res = await deleteMentorProfile()
                    setDeleting(false)
                    if (!res.ok) {
                      toast({ variant: 'destructive', title: 'Error', description: res.message })
                      return
                    }
                    toast({ title: 'Perfil eliminado' })
                    router.refresh()
                  }}
                >
                  Sí, eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </form>
  )
}
