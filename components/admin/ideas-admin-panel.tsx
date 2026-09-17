'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Lock, LockOpen, Trash2 } from 'lucide-react'

import type { CommunityIdeaAdminRow } from '@/src/lib/supabase/admin-queries'
import { deleteIdeaAdmin, toggleIdeaPinned, updateIdeaStatus } from '@/app/admin/actions/community-ideas'
import { useToast } from '@/components/ui/use-toast'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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

const STATUS_LABELS: Record<string, string> = {
  open: 'Abierta',
  closed: 'Cerrada',
  archived: 'Archivada',
}

export function IdeasAdminPanel({ initialRows }: { initialRows: CommunityIdeaAdminRow[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)

  const handleTogglePinned = async (row: CommunityIdeaAdminRow) => {
    setPendingId(row.id)
    const res = await toggleIdeaPinned({ id: row.id, pinned: !row.pinned })
    setPendingId(null)
    if (!res.ok) {
      toast({ variant: 'destructive', title: 'Error', description: res.message })
      return
    }
    router.refresh()
  }

  const handleToggleStatus = async (row: CommunityIdeaAdminRow) => {
    setPendingId(row.id)
    const nextStatus = row.status === 'open' ? 'closed' : 'open'
    const res = await updateIdeaStatus({ id: row.id, status: nextStatus })
    setPendingId(null)
    if (!res.ok) {
      toast({ variant: 'destructive', title: 'Error', description: res.message })
      return
    }
    router.refresh()
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setPendingId(deleteId)
    const res = await deleteIdeaAdmin(deleteId)
    setPendingId(null)
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
      <div>
        <h1 className="text-2xl font-bold text-white">Ideas de la comunidad</h1>
        <p className="text-sm text-zinc-400">Moderá, destacá o cerrá propuestas.</p>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/[0.02]">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-zinc-300">Título</TableHead>
              <TableHead className="text-zinc-300">Autor</TableHead>
              <TableHead className="text-zinc-300">Votos</TableHead>
              <TableHead className="text-zinc-300">Estado</TableHead>
              <TableHead className="text-zinc-300">Destacada</TableHead>
              <TableHead className="w-[140px] text-right text-zinc-300">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialRows.length === 0 ? (
              <TableRow className="border-white/10">
                <TableCell colSpan={6} className="text-center text-zinc-500">
                  No hay ideas.
                </TableCell>
              </TableRow>
            ) : (
              initialRows.map((row) => (
                <TableRow key={row.id} className="border-white/10">
                  <TableCell className="max-w-[220px] truncate font-medium text-zinc-200">
                    {row.title}
                  </TableCell>
                  <TableCell className="text-zinc-400">{row.author_name}</TableCell>
                  <TableCell className="text-zinc-400">{row.vote_count}</TableCell>
                  <TableCell>
                    <Badge variant={row.status === 'open' ? 'unlocked' : 'outline'}>
                      {STATUS_LABELS[row.status] ?? row.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={row.pinned}
                      disabled={pendingId === row.id}
                      onCheckedChange={() => handleTogglePinned(row)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-zinc-400 hover:text-white"
                      disabled={pendingId === row.id || row.status === 'archived'}
                      title={row.status === 'open' ? 'Cerrar idea' : 'Reabrir idea'}
                      onClick={() => handleToggleStatus(row)}
                    >
                      {row.status === 'open' ? (
                        <Lock className="h-4 w-4" />
                      ) : (
                        <LockOpen className="h-4 w-4" />
                      )}
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

      <AlertDialog open={Boolean(deleteId)} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="border-white/10 bg-zinc-950 text-zinc-100">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar idea?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Esta acción no se puede deshacer. También se borran sus votos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 bg-transparent">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-500"
              onClick={handleDelete}
              disabled={pendingId === deleteId}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
