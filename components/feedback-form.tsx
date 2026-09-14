'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { submitFeedback } from '@/app/actions/feedback'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function FeedbackForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [pending, setPending] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPending(true)
    const res = await submitFeedback(form)
    setPending(false)

    if (!res.ok) {
      toast({ variant: 'destructive', title: 'Error', description: res.message })
      return
    }

    toast({ title: '¡Gracias!', description: 'Tu opinión fue enviada correctamente.' })
    setForm({ name: '', email: '', message: '' })
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="min-w-0 space-y-6">
      <div className="grid min-w-0 gap-2">
        <Label htmlFor="fb-name" className="min-w-0 break-words leading-snug">
          Nombre completo
        </Label>
        <Input
          id="fb-name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Tu nombre"
          className="min-w-0 border-white/[0.08] bg-white/[0.03] text-base sm:text-sm"
          required
        />
      </div>
      <div className="grid min-w-0 gap-2">
        <Label htmlFor="fb-email" className="min-w-0 break-words leading-snug">
          Correo electrónico
        </Label>
        <Input
          id="fb-email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          placeholder="tu@ejemplo.com"
          className="min-w-0 border-white/[0.08] bg-white/[0.03] text-base sm:text-sm"
          required
        />
      </div>
      <div className="grid min-w-0 gap-2">
        <Label htmlFor="fb-message" className="min-w-0 break-words leading-snug">
          Mensaje
        </Label>
        <Textarea
          id="fb-message"
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          placeholder="Contanos qué pensás, sugerencias, ideas..."
          rows={5}
          className="min-w-0 resize-none border-white/[0.08] bg-white/[0.03] text-base sm:text-sm"
          required
          minLength={10}
        />
      </div>
      <Button type="submit" disabled={pending} className="h-12 w-full min-w-0 sm:h-10 sm:w-auto">
        {pending ? 'Enviando...' : 'Enviar opinión'}
      </Button>
    </form>
  )
}
