/**
 * @file rate-limiter.ts
 * @description Rate limiter en memoria para Server Actions.
 * Usa un Map con ventanas de tiempo fijas por clave (IP, etc.).
 *
 * ⚠️ Nota: Este rate limiter es in-process. En entornos serverless
 * (Vercel) cada función tiene su propio espacio de memoria, por lo que
 * la efectividad es por instancia. Para rate limiting global robusto,
 * migrar a Upstash Redis o Supabase counter table.
 */

interface RateLimitEntry {
  count: number
  windowStart: number
}

// Mapa global por scope (ej: 'feedback', 'survey')
const rateLimitStore = new Map<string, RateLimitEntry>()

/**
 * Verifica si una clave (por ej: IP + scope) ha excedido el límite.
 * @param key      Identificador único (ej: `feedback:127.0.0.1`)
 * @param limit    Máximo de requests permitidos en la ventana
 * @param windowMs Duración de la ventana en milisegundos (default: 1 hora)
 * @returns `{ allowed: boolean, remaining: number, resetAt: number }`
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs = 60 * 60 * 1000, // 1 hora por defecto
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  if (!entry || now - entry.windowStart >= windowMs) {
    // Primera solicitud o ventana expirada → reiniciar
    rateLimitStore.set(key, { count: 1, windowStart: now })
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs }
  }

  if (entry.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.windowStart + windowMs,
    }
  }

  entry.count += 1
  return {
    allowed: true,
    remaining: limit - entry.count,
    resetAt: entry.windowStart + windowMs,
  }
}

/**
 * Limpia entradas expiradas del store para evitar memory leaks.
 * Llama ocasionalmente si el servidor es de larga duración.
 */
export function pruneRateLimitStore(windowMs = 60 * 60 * 1000) {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now - entry.windowStart >= windowMs) {
      rateLimitStore.delete(key)
    }
  }
}
