import { describe, expect, it } from 'vitest'

import { DISPLAY_NAME_FALLBACK, resolveDisplayName } from './display-name'

describe('resolveDisplayName', () => {
  it('prefiere el nombre completo', () => {
    expect(resolveDisplayName({ full_name: 'Ana López', email: 'ana@udb.edu.sv' })).toBe(
      'Ana López',
    )
  })

  it('recorta el nombre y no lo confunde con vacio', () => {
    expect(resolveDisplayName({ full_name: '  Ana López  ' })).toBe('Ana López')
    expect(resolveDisplayName({ full_name: '   ', email: 'ana@udb.edu.sv' })).toBe('ana')
  })

  it('cae a la parte local del email solo si se le pasa', () => {
    expect(resolveDisplayName({ full_name: null, email: 'ana@udb.edu.sv' })).toBe('ana')
    // Sin email disponible (autores de ideas, votantes) no hay dato intermedio.
    expect(resolveDisplayName({ full_name: null })).toBe(DISPLAY_NAME_FALLBACK)
  })

  it('usa el fallback cuando no hay ningun dato utilizable', () => {
    expect(resolveDisplayName({})).toBe(DISPLAY_NAME_FALLBACK)
    expect(resolveDisplayName({ full_name: null, email: null })).toBe(DISPLAY_NAME_FALLBACK)
    expect(resolveDisplayName({ full_name: '', email: '' })).toBe(DISPLAY_NAME_FALLBACK)
  })

  it('no devuelve cadena vacia con un email malformado', () => {
    // '@udb.edu.sv'.split('@')[0] es '', que es falsy: debe seguir al fallback.
    expect(resolveDisplayName({ email: '@udb.edu.sv' })).toBe(DISPLAY_NAME_FALLBACK)
  })
})
