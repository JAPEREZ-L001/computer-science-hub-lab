import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { enforceSiteAvailability } from './site-gate'
import { BYPASS_COOKIE, MAINTENANCE_PATH } from './site-mode'

const TOKEN = 'token-de-acceso-anticipado'

function pedir(url: string, cookie?: string) {
  const request = new NextRequest(new URL(url, 'https://cshdevs.org'))
  if (cookie !== undefined) {
    request.cookies.set(BYPASS_COOKIE, cookie)
  }
  return request
}

const entornoOriginal = { ...process.env }

beforeEach(() => {
  delete process.env.SITE_DISABLED
  delete process.env.SITE_BYPASS_TOKEN
})

afterEach(() => {
  process.env = { ...entornoOriginal }
})

describe('enforceSiteAvailability con el sitio encendido', () => {
  it('deja pasar cuando SITE_DISABLED no está definida', () => {
    expect(enforceSiteAvailability(pedir('/'))).toBeNull()
  })

  it('deja pasar cuando SITE_DISABLED es "false"', () => {
    process.env.SITE_DISABLED = 'false'
    expect(enforceSiteAvailability(pedir('/eventos'))).toBeNull()
  })

  it('no apaga el sitio ante valores ambiguos', () => {
    for (const valor of ['1', 'yes', 'TRUE ', '']) {
      process.env.SITE_DISABLED = valor
      const resultado = enforceSiteAvailability(pedir('/'))
      if (valor.trim().toLowerCase() === 'true') {
        expect(resultado).not.toBeNull()
      } else {
        expect(resultado).toBeNull()
      }
    }
  })
})

describe('enforceSiteAvailability con el sitio apagado', () => {
  beforeEach(() => {
    process.env.SITE_DISABLED = 'true'
  })

  it('responde 503 y reescribe a la página de mantenimiento', () => {
    const respuesta = enforceSiteAvailability(pedir('/eventos'))

    expect(respuesta).not.toBeNull()
    expect(respuesta!.status).toBe(503)
    expect(respuesta!.headers.get('x-middleware-rewrite')).toContain(MAINTENANCE_PATH)
    expect(respuesta!.headers.get('Retry-After')).toBe('3600')
  })

  it('también bloquea rutas protegidas y de administración', () => {
    for (const ruta of ['/admin', '/perfil', '/login', '/onboarding']) {
      expect(enforceSiteAvailability(pedir(ruta))!.status).toBe(503)
    }
  })

  it('bloquea aunque no haya token de bypass configurado', () => {
    const respuesta = enforceSiteAvailability(pedir('/?acceso=lo-que-sea'))
    expect(respuesta!.status).toBe(503)
  })
})

describe('acceso anticipado', () => {
  beforeEach(() => {
    process.env.SITE_DISABLED = 'true'
    process.env.SITE_BYPASS_TOKEN = TOKEN
  })

  it('canjea el token por una cookie y limpia el parámetro de la URL', () => {
    const respuesta = enforceSiteAvailability(pedir(`/eventos?acceso=${TOKEN}`))

    expect(respuesta).not.toBeNull()
    expect(respuesta!.status).toBe(307)

    const destino = new URL(respuesta!.headers.get('location')!)
    expect(destino.pathname).toBe('/eventos')
    expect(destino.searchParams.has('acceso')).toBe(false)

    const cookie = respuesta!.cookies.get(BYPASS_COOKIE)
    expect(cookie?.value).toBe(TOKEN)
    expect(cookie?.httpOnly).toBe(true)
  })

  it('deja pasar a quien ya trae la cookie válida', () => {
    expect(enforceSiteAvailability(pedir('/perfil', TOKEN))).toBeNull()
  })

  it('bloquea una cookie con valor incorrecto', () => {
    expect(enforceSiteAvailability(pedir('/', 'token-invalido'))!.status).toBe(503)
  })

  it('bloquea un token con la longitud correcta pero contenido distinto', () => {
    const falso = 'x'.repeat(TOKEN.length)
    expect(enforceSiteAvailability(pedir(`/?acceso=${falso}`))!.status).toBe(503)
  })

  it('conserva el resto de los parámetros al canjear el token', () => {
    const respuesta = enforceSiteAvailability(
      pedir(`/eventos?ref=correo&acceso=${TOKEN}`),
    )

    const destino = new URL(respuesta!.headers.get('location')!)
    expect(destino.searchParams.get('ref')).toBe('correo')
    expect(destino.searchParams.has('acceso')).toBe(false)
  })
})
