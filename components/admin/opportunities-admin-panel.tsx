'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'

import type { OpportunityAdminRow } from '@/src/lib/supabase/admin-queries'
import { deleteOpportunity, saveOpportunity } from '@/app/admin/actions/opportunities'
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
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const emptyForm = {
  id: '' as string | undefined,
  title: '',
  organization: '',
  description: '',
  url: '',
  type: '',
  published: true,
}

export function OpportunitiesAdminPanel({
  initialRows,
}: {
  initialRows: OpportunityAdminRow[]
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const openCreate = () => {
    setForm({ ...emptyForm, id: undefined })
    setOpen(true)
  }

  const openEdit = (row: OpportunityAdminRow) => {
    setForm({
      id: row.id,
      title: row.title,
      organization: row.organization,
      description: row.description ?? '',
      url: row.url ?? '',
      type: row.type,
      published: row.published,
    })
    setOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPending(true)
    const res = await saveOpportunity({
      id: form.id,
      title: form.title,
      organization: form.organization,
      description: form.description,
      url: form.url,
      type: form.type,
      published: form.published,
    })
    setPending(false)
    if (!res.ok) {
      toast({ variant: 'destructive', title: 'Error', description: res.message })
      return
    }
    toast({ title: 'Guardado' })
    setOpen(false)
    router.refresh()
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setPending(true)
    const res = await deleteOpportunity(deleteId)
    setPending(false)
    setDeleteId(null)
    if (!res.ok) {
      toast({ variant: 'destructive', title: 'Error', description: res.message })
      return
    }
    toast({ title: 'Eliminada' })
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Oportunidades</h1>
          <p className="text-sm text-zinc-400">Convocatorias y programas.</p>
        </div>
        <Button type="button" onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva oportunidad
        </Button>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/[0.02]">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-zinc-300">Organización</TableHead>
              <TableHead className="text-zinc-300">Título</TableHead>
              <TableHead className="text-zinc-300">Tipo</TableHead>
              <TableHead className="text-zinc-300">Publicada</TableHead>
              <TableHead className="w-[100px] text-right text-zinc-300">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialRows.length === 0 ? (
              <TableRow className="border-white/10">
                <TableCell colSpan={5} className="text-center text-zinc-500">
                  No hay oportunidades.
                </TableCell>
              </TableRow>
            ) : (
              initialRows.map((row) => (
                <TableRow key={row.id} className="border-white/10">
                  <TableCell className="font-medium text-zinc-200">{row.organization}</TableCell>
                  <TableCell className="max-w-[180px] truncate text-zinc-400">{row.title}</TableCell>
                  <TableCell className="text-zinc-400">{row.type}</TableCell>
                  <TableCell className="text-zinc-400">{row.published ? 'Sí' : 'No'}</TableCell>
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
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-zinc-400 hover:text-red-400"
                      onClick={() => setDeleteId(row.id)}
                    >
                      <Trash2 className="h-4 w-4" />
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
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{form.id ? 'Editar oportunidad' : 'Nueva oportunidad'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="op-org">Organización</Label>
                <Input
                  id="op-org"
                  value={form.organization}
                  onChange={(e) => setForm((f) => ({ ...f, organization: e.target.value }))}
                  required
                  className="border-white/10 bg-white/5"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="op-title">Título / rol</Label>
                <Input
                  id="op-title"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  required
                  className="border-white/10 bg-white/5"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="op-type">Tipo (etiqueta)</Label>
                <Input
                  id="op-type"
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  placeholder="Pasantía, Becas…"
                  className="border-white/10 bg-white/5"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="op-url">URL</Label>
                <Input
                  id="op-url"
                  value={form.url}
                  onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                  className="border-white/10 bg-white/5"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="op-desc">Descripción</Label>
                <Textarea
                  id="op-desc"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={5}
                  className="border-white/10 bg-white/5"
                />
              </div>
              <div className="flex items-center justify-between gap-4 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2">
                <Label htmlFor="op-pub" className="cursor-pointer">
                  Publicada
                </Label>
                <Switch
                  id="op-pub"
                  checked={form.published}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, published: v }))}
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
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteId)} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="border-white/10 bg-zinc-950 text-zinc-100">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar oportunidad?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 bg-transparent">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-500"
              onClick={handleDelete}
              disabled={pending}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
