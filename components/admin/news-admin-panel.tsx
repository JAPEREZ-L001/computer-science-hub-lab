'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'

import type { NewsAdminRow } from '@/src/lib/supabase/admin-queries'
import { deleteNews, saveNews } from '@/app/admin/actions/news'
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

function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function fromDatetimeLocalValue(s: string): string {
  if (!s.trim()) return new Date().toISOString()
  const t = new Date(s).getTime()
  if (Number.isNaN(t)) return new Date().toISOString()
  return new Date(t).toISOString()
}

const emptyForm = {
  id: '' as string | undefined,
  slug: '',
  title: '',
  excerpt: '',
  content: '',
  category: 'update',
  published: true,
  published_at: '',
}

export function NewsAdminPanel({ initialRows }: { initialRows: NewsAdminRow[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const openCreate = () => {
    setForm({
      ...emptyForm,
      id: undefined,
      published_at: toDatetimeLocalValue(new Date().toISOString()),
    })
    setOpen(true)
  }

  const openEdit = (row: NewsAdminRow) => {
    setForm({
      id: row.id,
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt ?? '',
      content: row.content ?? '',
      category: row.category,
      published: row.published,
      published_at: toDatetimeLocalValue(row.published_at),
    })
    setOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPending(true)
    const res = await saveNews({
      id: form.id,
      slug: form.slug,
      title: form.title,
      excerpt: form.excerpt,
      content: form.content,
      category: form.category,
      published: form.published,
      published_at: fromDatetimeLocalValue(form.published_at),
    })
    setPending(false)
    if (!res.ok) {
      toast({ variant: 'destructive', title: 'Error', description: res.message })
      return
    }
    toast({ title: 'Guardado', description: 'La noticia se actualizó correctamente.' })
    setOpen(false)
    router.refresh()
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setPending(true)
    const res = await deleteNews(deleteId)
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
          <h1 className="text-2xl font-bold text-white">Noticias</h1>
          <p className="text-sm text-zinc-400">Creá, editá y publicá artículos del hub.</p>
        </div>
        <Button type="button" onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva noticia
        </Button>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/[0.02]">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-zinc-300">Título</TableHead>
              <TableHead className="text-zinc-300">Slug</TableHead>
              <TableHead className="text-zinc-300">Categoría</TableHead>
              <TableHead className="text-zinc-300">Publicada</TableHead>
              <TableHead className="w-[100px] text-right text-zinc-300">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialRows.length === 0 ? (
              <TableRow className="border-white/10">
                <TableCell colSpan={5} className="text-center text-zinc-500">
                  No hay noticias todavía.
                </TableCell>
              </TableRow>
            ) : (
              initialRows.map((row) => (
                <TableRow key={row.id} className="border-white/10">
                  <TableCell className="max-w-[200px] truncate font-medium text-zinc-200">
                    {row.title}
                  </TableCell>
                  <TableCell className="text-zinc-400">{row.slug}</TableCell>
                  <TableCell className="text-zinc-400">{row.category}</TableCell>
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
              <DialogTitle>{form.id ? 'Editar noticia' : 'Nueva noticia'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="news-title">Título</Label>
                <Input
                  id="news-title"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  required
                  className="border-white/10 bg-white/5"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="news-slug">Slug (opcional)</Label>
                <Input
                  id="news-slug"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="se-genera-desde-el-titulo"
                  className="border-white/10 bg-white/5"
                />
              </div>
              <div className="grid gap-2">
                <Label>Categoría</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
                >
                  <SelectTrigger className="border-white/10 bg-white/5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anuncio">Anuncio</SelectItem>
                    <SelectItem value="logro">Logro</SelectItem>
                    <SelectItem value="evento">Evento</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="news-excerpt">Resumen</Label>
                <Textarea
                  id="news-excerpt"
                  value={form.excerpt}
                  onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                  rows={3}
                  className="border-white/10 bg-white/5"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="news-content">Contenido (markdown simple)</Label>
                <Textarea
                  id="news-content"
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  rows={8}
                  className="border-white/10 bg-white/5 font-mono text-sm"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="news-published-at">Fecha de publicación</Label>
                <Input
                  id="news-published-at"
                  type="datetime-local"
                  value={form.published_at}
                  onChange={(e) => setForm((f) => ({ ...f, published_at: e.target.value }))}
                  className="border-white/10 bg-white/5"
                />
              </div>
              <div className="flex items-center justify-between gap-4 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2">
                <Label htmlFor="news-published" className="cursor-pointer">
                  Publicada
                </Label>
                <Switch
                  id="news-published"
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
            <AlertDialogTitle>¿Eliminar noticia?</AlertDialogTitle>
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
