import { describe, expect, it } from 'vitest'
import { isValidUUID, isSafeUrl, sanitizeOptionalUrl } from './url-validation'

describe('isValidUUID', () => {
  it('accepts a well-formed v4 UUID', () => {
    expect(isValidUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true)
  })

  it('accepts uppercase UUIDs', () => {
    expect(isValidUUID('123E4567-E89B-12D3-A456-426614174000')).toBe(true)
  })

  it('rejects non-UUID strings', () => {
    expect(isValidUUID('not-a-uuid')).toBe(false)
    expect(isValidUUID('')).toBe(false)
    expect(isValidUUID('123e4567-e89b-12d3-a456')).toBe(false)
  })
})

describe('isSafeUrl', () => {
  it('accepts http and https URLs', () => {
    expect(isSafeUrl('https://example.com')).toBe(true)
    expect(isSafeUrl('http://example.com')).toBe(true)
  })

  it('rejects javascript: and other dangerous protocols', () => {
    expect(isSafeUrl('javascript:alert(1)')).toBe(false)
    expect(isSafeUrl('data:text/html,<script>alert(1)</script>')).toBe(false)
    expect(isSafeUrl('file:///etc/passwd')).toBe(false)
  })

  it('rejects malformed URLs', () => {
    expect(isSafeUrl('not a url')).toBe(false)
    expect(isSafeUrl('')).toBe(false)
  })
})

describe('sanitizeOptionalUrl', () => {
  it('returns null for empty, null or undefined input', () => {
    expect(sanitizeOptionalUrl('')).toBeNull()
    expect(sanitizeOptionalUrl(null)).toBeNull()
    expect(sanitizeOptionalUrl(undefined)).toBeNull()
  })

  it('returns null for a bare "#" placeholder', () => {
    expect(sanitizeOptionalUrl('#')).toBeNull()
  })

  it('trims whitespace from a valid URL', () => {
    expect(sanitizeOptionalUrl('  https://github.com/user  ')).toBe('https://github.com/user')
  })

  it('returns null for unsafe protocols', () => {
    expect(sanitizeOptionalUrl('javascript:alert(1)')).toBeNull()
  })

  it('adds https:// when the user omits the protocol', () => {
    expect(sanitizeOptionalUrl('linkedin.com/in/tu-usuario')).toBe('https://linkedin.com/in/tu-usuario')
    expect(sanitizeOptionalUrl('www.linkedin.com/in/tu-usuario')).toBe('https://www.linkedin.com/in/tu-usuario')
    expect(sanitizeOptionalUrl('github.com/tu-usuario')).toBe('https://github.com/tu-usuario')
  })

  it('does not double up an existing protocol', () => {
    expect(sanitizeOptionalUrl('http://example.com')).toBe('http://example.com')
  })
})
