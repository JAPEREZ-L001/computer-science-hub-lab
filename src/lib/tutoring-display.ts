/**
 * Etiquetas y formato del flujo de tutorías, compartidos por la vista del
 * alumno, la del mentor y el panel admin.
 *
 * Antes cada vista imprimía `status` crudo ("matched"), que no le dice nada a
 * quien lo lee.
 */

export const TUTORING_STATUS_LABELS: Record<string, string> = {
  pending: 'Buscando mentor',
  matched: 'Con mentor asignado',
  closed: 'Finalizada',
}

/**
 * Qué le falta a la tutoría para que la persona pueda asistir. La sesión está
 * agendada solo cuando hay fecha Y lugar: con una sola de las dos, quien la
 * lee no sabe dónde presentarse.
 */
export type TutoringStage = 'pending' | 'awaiting_schedule' | 'scheduled' | 'closed'

export function resolveTutoringStage(request: {
  status: string
  session_at: string | null
  session_location: string | null
}): TutoringStage {
  if (request.status === 'closed') return 'closed'
  if (request.status === 'pending') return 'pending'
  return request.session_at && request.session_location ? 'scheduled' : 'awaiting_schedule'
}

export const TUTORING_STAGE_LABELS: Record<TutoringStage, string> = {
  pending: 'Buscando mentor',
  awaiting_schedule: 'Falta agendar',
  scheduled: 'Agendada',
  closed: 'Finalizada',
}

export function formatSessionDate(value: string | null): string | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleString('es-SV', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Pasa un timestamptz a lo que espera `<input type="datetime-local">`
 * (`YYYY-MM-DDTHH:mm`, en hora local y sin zona).
 */
export function toDateTimeLocalValue(value: string | null): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}
