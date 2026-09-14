'use client'

import { useId, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export function PasswordInput({
  label,
  error,
  placeholder,
  inputProps,
}: {
  label: string
  error?: string
  placeholder?: string
  inputProps: React.ComponentProps<'input'>
}) {
  const [isVisible, setIsVisible] = useState(false)
  const generatedId = useId()
  const id = inputProps.id ?? generatedId

  return (
    <div className="grid gap-2">
      <Label className="text-sm font-medium" htmlFor={id}>
        {label}
      </Label>

      <div className="relative">
        <Input
          {...inputProps}
          id={id}
          type={isVisible ? 'text' : 'password'}
          placeholder={placeholder}
          aria-invalid={!!error}
          className={cn(
            inputProps.className,
            error ? 'pr-10 border-destructive focus-visible:border-destructive' : 'pr-10',
          )}
        />

        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          onClick={() => setIsVisible((v) => !v)}
          aria-label={isVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

