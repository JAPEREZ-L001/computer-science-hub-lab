import type { HubEventType } from '@/src/types'

export function eventTypeLabel(type: HubEventType) {
  switch (type) {
    case 'workshop': return 'Workshop'
    case 'charla': return 'Charla'
    case 'hackathon': return 'Hackathon'
    case 'copa': return 'Copa'
    case 'networking': return 'Networking'
    case 'otro': return 'Otro'
  }
}

export function eventTypeBadgeClass(type: HubEventType) {
  switch (type) {
    case 'workshop': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
    case 'charla': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
    case 'hackathon': return 'bg-red-500/10 text-red-400 border border-red-500/20'
    case 'copa': return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
    case 'networking': return 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
    case 'otro': return 'bg-white/5 text-white/50 border border-white/10'
  }
}

/** Color sólido para el punto indicador de tipo en el mini-calendario (sin fondo/borde). */
export function eventTypeDotClass(type: HubEventType) {
  switch (type) {
    case 'workshop': return 'bg-blue-400'
    case 'charla': return 'bg-emerald-400'
    case 'hackathon': return 'bg-red-400'
    case 'copa': return 'bg-yellow-400'
    case 'networking': return 'bg-purple-400'
    case 'otro': return 'bg-white/40'
  }
}

export function excerpt(text: string, maxChars: number) {
  if (text.length <= maxChars) return text
  return `${text.slice(0, maxChars - 3)}...`
}
