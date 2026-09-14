import type { ReactNode } from 'react'

import { EventCalendar } from '@/components/event-calendar'
import { EventsList } from '@/components/events-list'
import type { HubEvent } from '@/src/types'

type EventsWithCalendarProps = {
  upcomingEvents: HubEvent[]
  calendarEvents: HubEvent[]
  registeredEventIds: string[]
  isAdmin: boolean
  isRealUser: boolean
  currentUserId?: string
  emptyState?: ReactNode
}

export function EventsWithCalendar({
  upcomingEvents,
  calendarEvents,
  registeredEventIds,
  isAdmin,
  isRealUser,
  currentUserId,
  emptyState,
}: EventsWithCalendarProps) {
  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:items-start">
      {upcomingEvents.length === 0 && emptyState ? (
        emptyState
      ) : (
        <EventsList
          events={upcomingEvents}
          registeredEventIds={registeredEventIds}
          isAdmin={isAdmin}
          isRealUser={isRealUser}
          currentUserId={currentUserId}
        />
      )}

      <aside className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 lg:sticky lg:top-28">
        <EventCalendar
          events={calendarEvents}
          registeredEventIds={registeredEventIds}
          isAdmin={isAdmin}
          isRealUser={isRealUser}
          currentUserId={currentUserId}
        />
      </aside>
    </div>
  )
}
