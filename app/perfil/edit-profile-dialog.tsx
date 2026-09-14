'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil } from 'lucide-react'

import { updateProfile, updatePersonalEmail } from '@/app/actions/profile'
import type { MemberProfile } from '@/src/types'
import { getAvatarDataUri, getBannerDataUri, AVATAR_PALETTE_NAMES } from '@/src/lib/avatar-generator'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

const CAREER_OPTIONS = [
  'Ing. en Ciencias de la Computación',
  'Licenciatura en Ingeniería de Software',
  'Ing. en Sistemas Informáticos',
  'Licenciatura en Diseño de Experiencias Digitales',
  'Ing. Industrial',
  'Ingeniería en Desarrollo de Contenidos Digitales y Robótica Aplicada',
] as const

type FormState = {
  full_name: string
  career: string
  cycle: string
  area: string
  bio: string
  github_url: string
  linkedin_url: string
  avatar_palette_index: string
  banner_palette_index: string
}

function toFormState(member: MemberProfile): FormState {
  return {
    full_name: member.name === 'Miembro' ? '' : member.name,
    career: member.career === '—' ? '' : member.career,
    cycle: member.cycle > 0 ? String(member.cycle) : '',
    area: member.area,
    bio: member.bio ?? '',
    github_url: member.github ?? '',
    linkedin_url: member.linkedin ?? '',
    avatar_palette_index: member.avatarPaletteIndex != null ? String(member.avatarPaletteIndex) : '',
    banner_palette_index: member.bannerPaletteIndex != null ? String(member.bannerPaletteIndex) : '',
  }
}

export function EditProfileDialog({
  member,
  personalEmail,
}: {
  member: MemberProfile
  personalEmail?: string | null
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [form, setForm] = useState<FormState>(() => toFormState(member))
  const [personalEmailInput, setPersonalEmailInput] = useState(personalEmail ?? '')

  const set = (key: keyof FormState) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPending(true)
    const [profileRes, contactRes] = await Promise.all([
      updateProfile(form),
      updatePersonalEmail(personalEmailInput),
    ])
    setPending(false)

    const failed = !profileRes.ok ? profileRes : !contactRes.ok ? contactRes : null
    if (failed) {
      toast({ variant: 'destructive', title: 'Error', description: failed.message })
      return
    }

    toast({ title: 'Perfil actualizado' })
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Pencil className="h-3.5 w-3.5" />
          Editar perfil
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar perfil</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <Label>Tema del avatar</Label>
                <Select value={form.avatar_palette_index || 'auto'} onValueChange={(val) => set('avatar_palette_index')(val === 'auto' ? '' : val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Automático" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Automático</SelectItem>
                    {AVATAR_PALETTE_NAMES.map((name, idx) => (
                      <SelectItem key={name} value={String(idx)}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {member.id && (
                  <div className="mt-2 flex justify-center">
                    <img
                      src={getAvatarDataUri(member.id, 48, form.avatar_palette_index ? Number(form.avatar_palette_index) : undefined)}
                      alt="Vista previa avatar"
                      className="h-12 w-12 rounded-full border border-white/10"
                    />
                  </div>
                )}
              </div>
              <div>
                <Label>Tema del banner</Label>
                <Select value={form.banner_palette_index || 'auto'} onValueChange={(val) => set('banner_palette_index')(val === 'auto' ? '' : val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Automático" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Automático</SelectItem>
                    {AVATAR_PALETTE_NAMES.map((name, idx) => (
                      <SelectItem key={name} value={String(idx)}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {member.id && (
                  <div className="mt-2 h-10 w-full overflow-hidden rounded-lg border border-white/10">
                    <img
                      src={getBannerDataUri(member.id, form.banner_palette_index ? Number(form.banner_palette_index) : undefined)}
                      alt="Vista previa banner"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ep-name">Nombre completo</Label>
              <Input
                id="ep-name"
                value={form.full_name}
                onChange={(e) => set('full_name')(e.target.value)}
                placeholder="Ej. Ana María López"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ep-career">Carrera</Label>
              <Select value={form.career} onValueChange={set('career')}>
                <SelectTrigger id="ep-career">
                  <SelectValue placeholder="Seleccioná tu carrera" />
                </SelectTrigger>
                <SelectContent>
                  {CAREER_OPTIONS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ep-personal-email">Correo personal (opcional)</Label>
              <Input
                id="ep-personal-email"
                type="email"
                value={personalEmailInput}
                onChange={(e) => setPersonalEmailInput(e.target.value)}
                placeholder="tuemail@gmail.com"
              />
              <p className="text-xs text-muted-foreground">
                Te sirve como respaldo si perdés acceso a tu correo institucional. No lo compartimos ni lo usamos para nada más.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ep-cycle">Ciclo (1–10)</Label>
              <Input
                id="ep-cycle"
                type="number"
                min={1}
                max={10}
                value={form.cycle}
                onChange={(e) => set('cycle')(e.target.value)}
                placeholder="Ej. 4"
              />
            </div>

            <div className="grid gap-2">
              <Label>Área</Label>
              <Select value={form.area} onValueChange={set('area')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="frontend">Frontend</SelectItem>
                  <SelectItem value="backend">Backend</SelectItem>
                  <SelectItem value="diseño">Diseño</SelectItem>
                  <SelectItem value="devops">DevOps</SelectItem>
                  <SelectItem value="ia">IA</SelectItem>
                  <SelectItem value="ciberseguridad">Ciberseguridad</SelectItem>
                  <SelectItem value="robótica">Robótica</SelectItem>
                  <SelectItem value="juegos">Desarrollo de Juegos</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ep-bio">Bio</Label>
              <Textarea
                id="ep-bio"
                value={form.bio}
                onChange={(e) => set('bio')(e.target.value)}
                rows={3}
                placeholder="Contá brevemente sobre vos..."
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ep-github">GitHub URL</Label>
              <Input
                id="ep-github"
                value={form.github_url}
                onChange={(e) => set('github_url')(e.target.value)}
                placeholder="https://github.com/tu-usuario"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ep-linkedin">LinkedIn URL</Label>
              <Input
                id="ep-linkedin"
                value={form.linkedin_url}
                onChange={(e) => set('linkedin_url')(e.target.value)}
                placeholder="https://linkedin.com/in/tu-usuario"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
