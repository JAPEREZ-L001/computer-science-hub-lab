import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

type SearchParams = { [key: string]: string | string[] | undefined }

/** Motivos que devuelve nuestro propio callback, traducidos a algo legible. */
const KNOWN_REASONS: Record<string, string> = {
  missing_code: 'El enlace venía incompleto: le faltaba el código de verificación.',
  invalid_type: 'El enlace es de un tipo que no reconocemos.',
}

function describeReason(raw: string | undefined): string | null {
  if (!raw) return null
  return KNOWN_REASONS[raw] ?? raw
}

export default async function AuthCodeErrorPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams> | SearchParams
}) {
  const resolved = await searchParams
  const rawReason = typeof resolved?.reason === 'string' ? resolved.reason : undefined
  const reason = describeReason(rawReason)

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-24 text-foreground">
      <Card className="w-full max-w-md space-y-4 p-8 text-center">
        <h1 className="text-xl font-semibold">No pudimos confirmar tu sesión</h1>
        <p className="text-sm text-muted-foreground">
          El enlace puede haber expirado o ya fue usado. Pedí uno nuevo para continuar.
        </p>
        {reason ? (
          <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            Detalle: {reason}
          </p>
        ) : null}
        <div className="flex flex-col gap-2 pt-2">
          <Button asChild>
            <Link href="/recuperar">Pedir un enlace nuevo</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/login">Ir a iniciar sesión</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/">Volver al inicio</Link>
          </Button>
        </div>
      </Card>
    </main>
  )
}
