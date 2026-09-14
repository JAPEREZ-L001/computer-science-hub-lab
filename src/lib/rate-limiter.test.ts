import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { checkRateLimit, pruneRateLimitStore } from './rate-limiter'

describe('checkRateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('allows the first request for a new key', () => {
    const result = checkRateLimit(`key-${crypto.randomUUID()}`, 3)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(2)
  })

  it('decrements remaining on each request within the window', () => {
    const key = `key-${crypto.randomUUID()}`
    checkRateLimit(key, 3)
    checkRateLimit(key, 3)
    const third = checkRateLimit(key, 3)
    expect(third.allowed).toBe(true)
    expect(third.remaining).toBe(0)
  })

  it('blocks requests once the limit is exceeded', () => {
    const key = `key-${crypto.randomUUID()}`
    checkRateLimit(key, 2)
    checkRateLimit(key, 2)
    const blocked = checkRateLimit(key, 2)
    expect(blocked.allowed).toBe(false)
    expect(blocked.remaining).toBe(0)
  })

  it('keeps counting different keys independently', () => {
    const keyA = `key-${crypto.randomUUID()}`
    const keyB = `key-${crypto.randomUUID()}`
    checkRateLimit(keyA, 1)
    const blockedA = checkRateLimit(keyA, 1)
    const allowedB = checkRateLimit(keyB, 1)
    expect(blockedA.allowed).toBe(false)
    expect(allowedB.allowed).toBe(true)
  })

  it('resets the window after windowMs has elapsed', () => {
    const key = `key-${crypto.randomUUID()}`
    const windowMs = 1000
    checkRateLimit(key, 1, windowMs)
    const blocked = checkRateLimit(key, 1, windowMs)
    expect(blocked.allowed).toBe(false)

    vi.advanceTimersByTime(windowMs + 1)

    const afterReset = checkRateLimit(key, 1, windowMs)
    expect(afterReset.allowed).toBe(true)
  })
})

describe('pruneRateLimitStore', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('removes expired entries so the key resets like a fresh one', () => {
    const key = `key-${crypto.randomUUID()}`
    const windowMs = 1000
    checkRateLimit(key, 1, windowMs)

    vi.advanceTimersByTime(windowMs + 1)
    pruneRateLimitStore(windowMs)

    const result = checkRateLimit(key, 1, windowMs)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(0)
  })
})
