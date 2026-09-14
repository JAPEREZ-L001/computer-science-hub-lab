import { Clock, MapPin, User as UserIcon } from 'lucide-react'

import { DeleteEventButton } from '@/components/delete-event-button'
import { EventSubscribeButton } from '@/components/event-subscribe-button'
import { eventTypeBadgeClass, eventTypeLabel, excerpt } from '@/src/lib/event-display'
import { formatEventDateEs } from '@/src/lib/event-datetime'
import type { HubEvent } from '@/src/types'

type EventsListProps = {
  events: HubEvent[]
  registeredEventIds: string[]
  isAdmin: boolean
  isRealUser: boolean
  currentUserId?: string
}

export function EventsList({
  events,
  registeredEventIds,
  isAdmin,
  isRealUser,
  currentUserId,
}: EventsListProps) {
  return (
    <div className="grid gap-6">
      {events.map((e) => (
        <div
          key={e.id}
          className="group relative flex flex-col items-start gap-6 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 transition-all hover:bg-white/[0.04] sm:p-8 lg:flex-row lg:items-center lg:justify-between"
        >
          <div className="flex-1 space-y-4 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${eventTypeBadgeClass(e.type)}`}>
                {eventTypeLabel(e.type)}
              </span>
              <span className="text-xs font-medium text-white/40">{formatEventDateEs(e.date)}</span>
            </div>

            <h3 className="text-2xl font-bold text-white transition-colors group-hover:text-white/90 truncate break-words text-wrap">
              {e.title}
            </h3>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/50">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0 opacity-50" />
                <span>{e.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 opacity-50" />
                <span>{e.location}</span>
              </div>
              {e.speaker && (
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 shrink-0 opacity-50" />
                  <span>{e.speaker}</span>
                </div>
              )}
            </div>

            <p className="text-sm leading-relaxed text-white/60 pt-2 lg:max-w-2xl">
              {excerpt(e.description, 200)}
            </p>
          </div>

          <div className="w-full lg:w-auto shrink-0 border-t border-white/[0.06] pt-6 lg:border-t-0 lg:pt-0 lg:pl-6 lg:border-l flex flex-col items-start lg:items-end gap-3">
            <EventSubscribeButton
              eventId={e.id}
              registrationUrl={e.registrationUrl}
              initialIsRegistered={registeredEventIds.includes(e.id)}
            />
            {(isAdmin || (isRealUser && e.createdBy === currentUserId)) && (
              <DeleteEventButton eventId={e.id} eventTitle={e.title} />
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
