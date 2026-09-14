'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Pencil } from 'lucide-react'

import type { ProfileAdminRow } from '@/src/lib/supabase/admin-queries'
import { updateMemberProfile } from '@/app/admin/actions/members'
import { useToast } from '@/components/ui/use-toast'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'

type FormState = {
  id: string
  full_name: string
  career: string
  cycle: string
  area: string
  status: string
  role: string
  bio: string
  github_url: string
  linkedin_url: string
}

export function MembersAdminPanel({
  initialRows,
  currentUserId,
}: {
  initialRows: ProfileAdminRow[]
  currentUserId: string
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [editingEmail, setEditingEmail] = useState('')
  const [form, setForm] = useState<FormState | null>(null)

  const openEdit = (row: ProfileAdminRow) => {
    setEditingEmail(row.email ?? '')
    setForm({
      id: row.id,
      full_name: row.full_name ?? '',
      career: row.career ?? '',
      cycle: row.cycle != null ? String(row.cycle) : '',
      area: row.area ?? 'general',
      status: row.status ?? 'activo',
      role: row.role === 'admin' ? 'admin' : 'member',
      bio: row.bio ?? '',
      github_url: row.github_url ?? '',
      linkedin_url: row.linkedin_url ?? '',
    })
    setOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form) return
    setPending(true)
    const res = await updateMemberProfile({
      id: form.id,
      full_name: form.full_name,
      career: form.career,
      cycle: form.cycle,
      area: form.area,
      status: form.status,
      role: form.role,
      bio: form.bio,
      github_url: form.github_url,
      linkedin_url: form.linkedin_url,
    })
    setPending(false)
    if (!res.ok) {
      toast({ variant: 'destructive', title: 'Error', description: res.message })
      return
    }
    toast({ title: 'Perfil actualizado' })
    setOpen(false)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Miembros</h1>
        <p className="text-sm text-zinc-400">
          Editá datos del directorio, estado y roles. El correo no se modifica desde aquí.
        </p>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/[0.02]">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-zinc-300">Nombre</TableHead>
              <TableHead className="text-zinc-300">Email</TableHead>
              <TableHead className="text-zinc-300">Área</TableHead>
              <TableHead className="text-zinc-300">Estado</TableHead>
              <TableHead className="text-zinc-300">Rol</TableHead>
              <TableHead className="w-[80px] text-right text-zinc-300">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialRows.length === 0 ? (
              <TableRow className="border-white/10">
                <TableCell colSpan={6} className="text-center text-zinc-500">
                  No hay perfiles.
                </TableCell>
              </TableRow>
            ) : (
              initialRows.map((row) => (
                <TableRow key={row.id} className="border-white/10">
                  <TableCell className="max-w-[140px] truncate font-medium text-zinc-200">
                    {row.full_name || '—'}
                  </TableCell>
                  <TableCell className="max-w-[160px] truncate text-zinc-400">
                    {row.email ?? '—'}
                  </TableCell>
                  <TableCell className="text-zinc-400">{row.area ?? '—'}</TableCell>
                  <TableCell className="text-zinc-400">{row.status ?? '—'}</TableCell>
                  <TableCell className="text-zinc-400">{row.role === 'admin' ? 'admin' : 'member'}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-zinc-400 hover:text-white"
                      onClick={() => openEdit(row)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-white/10 bg-zinc-950 text-zinc-100 sm:max-w-lg">
          {form ? (
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Editar miembro</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <p className="text-xs text-zinc-500">
                  Email (solo lectura): <span className="text-zinc-300">{editingEmail || '—'}</span>
                  {form.id === currentUserId ? (
                    <span className="mt-1 block text-amber-500/90">
                      Es tu cuenta: no podés quitarte el rol admin desde aquí.
                    </span>
                  ) : null}
                </p>
                <div className="grid gap-2">
                  <Label htmlFor="mem-name">Nombre completo</Label>
                  <Input
                    id="mem-name"
                    value={form.full_name}
                    onChange={(e) => setForm((f) => (f ? { ...f, full_name: e.target.value } : f))}
                    className="border-white/10 bg-white/5"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="mem-career">Carrera</Label>
                  <Input
                    id="mem-career"
                    value={form.career}
                    onChange={(e) => setForm((f) => (f ? { ...f, career: e.target.value } : f))}
                    className="border-white/10 bg-white/5"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="mem-cycle">Ciclo</Label>
                  <Input
                    id="mem-cycle"
                    type="number"
                    min={1}
                    value={form.cycle}
                    onChange={(e) => setForm((f) => (f ? { ...f, cycle: e.target.value } : f))}
                    className="border-white/10 bg-white/5"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Área</Label>
                  <Select
                    value={form.area}
                    onValueChange={(v) => setForm((f) => (f ? { ...f, area: v } : f))}
                  >
                    <SelectTrigger className="border-white/10 bg-white/5">
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
                  <Label>Estado</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v) => setForm((f) => (f ? { ...f, status: v } : f))}
                  >
                    <SelectTrigger className="border-white/10 bg-white/5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activo">Activo</SelectItem>
                      <SelectItem value="inactivo">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Rol</Label>
                  <Select
                    value={form.role}
                    onValueChange={(v) => setForm((f) => (f ? { ...f, role: v } : f))}
                    disabled={form.id === currentUserId}
                  >
                    <SelectTrigger className="border-white/10 bg-white/5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Miembro</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="mem-bio">Bio</Label>
                  <Textarea
                    id="mem-bio"
                    value={form.bio}
                    onChange={(e) => setForm((f) => (f ? { ...f, bio: e.target.value } : f))}
                    rows={3}
                    className="border-white/10 bg-white/5"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="mem-gh">GitHub URL</Label>
                  <Input
                    id="mem-gh"
                    value={form.github_url}
                    onChange={(e) => setForm((f) => (f ? { ...f, github_url: e.target.value } : f))}
                    className="border-white/10 bg-white/5"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="mem-li">LinkedIn URL</Label>
                  <Input
                    id="mem-li"
                    value={form.linkedin_url}
                    onChange={(e) => setForm((f) => (f ? { ...f, linkedin_url: e.target.value } : f))}
                    className="border-white/10 bg-white/5"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={pending}>
                  Guardar
                </Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
