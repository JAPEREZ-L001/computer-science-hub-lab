import { Resend } from 'resend'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_ADDRESS = 'noreply@send.cshdevs.org'
const ADMIN_EMAIL = 'admin@cshdevs.org'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function notifyAdminNewRegistration({
  eventTitle,
  eventDate,
  userName,
  userEmail,
}: {
  eventTitle: string
  eventDate: string
  userName: string
  userEmail: string
}) {
  if (!RESEND_API_KEY) {
    console.warn('[resend] RESEND_API_KEY no configurada — email omitido')
    return
  }

  const resend = new Resend(RESEND_API_KEY)

  const safeEventTitle = escapeHtml(eventTitle)
  const safeEventDate = escapeHtml(eventDate)
  const safeUserName = escapeHtml(userName)
  const safeUserEmail = escapeHtml(userEmail)

  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0a0a0a; color: #ffffff;">
      <div style="border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 32px;">
        <p style="font-size: 10px; font-weight: 700; letter-spacing: 0.3em; text-transform: uppercase; color: rgba(255,255,255,0.4); margin: 0 0 16px;">
          Computer Science Hub · Notificación
        </p>
        <h1 style="font-size: 24px; font-weight: 700; color: #ffffff; margin: 0 0 24px; line-height: 1.3;">
          Nueva inscripción en evento
        </h1>
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <p style="margin: 0 0 8px; font-size: 13px; color: rgba(255,255,255,0.5);">Evento</p>
          <p style="margin: 0; font-size: 16px; font-weight: 600; color: #ffffff;">${safeEventTitle}</p>
          <p style="margin: 8px 0 0; font-size: 13px; color: rgba(255,255,255,0.4);">${safeEventDate}</p>
        </div>
        <div style="background: rgba(16,185,129,0.05); border: 1px solid rgba(16,185,129,0.2); border-radius: 12px; padding: 20px;">
          <p style="margin: 0 0 8px; font-size: 13px; color: rgba(16,185,129,0.7);">Nuevo inscrito</p>
          <p style="margin: 0; font-size: 16px; font-weight: 600; color: #ffffff;">${safeUserName}</p>
          <p style="margin: 4px 0 0; font-size: 13px; color: rgba(255,255,255,0.5);">${safeUserEmail}</p>
        </div>
        <p style="margin: 24px 0 0; font-size: 11px; color: rgba(255,255,255,0.25); text-align: center;">
          Computer Science Hub — Universidad Don Bosco, Antiguo Cuscatlán
        </p>
      </div>
    </div>
  `

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: ADMIN_EMAIL,
      subject: `📋 Nueva inscripción: ${eventTitle}`,
      html,
    })
  } catch (err) {
    console.error('[resend] Error enviando notificación al admin:', err)
  }
}

export async function notifyAdminFeedback({
  userName,
  userEmail,
  message,
}: {
  userName: string
  userEmail: string
  message: string
}) {
  if (!RESEND_API_KEY) {
    console.warn('[resend] RESEND_API_KEY no configurada — email omitido')
    return
  }

  const resend = new Resend(RESEND_API_KEY)

  const safeUserName = escapeHtml(userName)
  const safeUserEmail = escapeHtml(userEmail)
  const safeMessage = escapeHtml(message)

  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0a0a0a; color: #ffffff;">
      <div style="border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 32px;">
        <p style="font-size: 10px; font-weight: 700; letter-spacing: 0.3em; text-transform: uppercase; color: rgba(255,255,255,0.4); margin: 0 0 16px;">
          Computer Science Hub · Feedback
        </p>
        <h1 style="font-size: 24px; font-weight: 700; color: #ffffff; margin: 0 0 24px; line-height: 1.3;">
          Nueva opinión recibida
        </h1>
        <div style="background: rgba(16,185,129,0.05); border: 1px solid rgba(16,185,129,0.2); border-radius: 12px; padding: 20px; margin-bottom: 16px;">
          <p style="margin: 0 0 8px; font-size: 13px; color: rgba(16,185,129,0.7);">De</p>
          <p style="margin: 0; font-size: 16px; font-weight: 600; color: #ffffff;">${safeUserName}</p>
          <p style="margin: 4px 0 0; font-size: 13px; color: rgba(255,255,255,0.5);">${safeUserEmail}</p>
        </div>
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px;">
          <p style="margin: 0 0 8px; font-size: 13px; color: rgba(255,255,255,0.5);">Mensaje</p>
          <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #ffffff; white-space: pre-wrap;">${safeMessage}</p>
        </div>
        <p style="margin: 24px 0 0; font-size: 11px; color: rgba(255,255,255,0.25); text-align: center;">
          Computer Science Hub — Universidad Don Bosco, Antiguo Cuscatlán
        </p>
      </div>
    </div>
  `

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: ADMIN_EMAIL,
      subject: `💬 Nuevo feedback de CSH: ${userName}`,
      html,
    })
  } catch (err) {
    console.error('[resend] Error enviando feedback al admin:', err)
  }
}
