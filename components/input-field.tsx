import * as React from 'react'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

function toId(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function InputField({
  label,
  error,
  className,
  ...props
}: {
  label: string
  error?: string
} & React.ComponentProps<'input'>) {
  const inputId = props.id ?? toId(label)

  return (
    <div className="grid gap-2">
      <Label className="text-sm font-medium" htmlFor={inputId}>
        {label}
      </Label>
      <Input
        {...props}
        id={inputId}
        className={cn(
          error
            ? 'border-destructive focus-visible:border-destructive'
            : className,
        )}
      />
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

