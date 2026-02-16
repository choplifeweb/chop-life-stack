import { CalendarDays } from "lucide-react"

import type { Event, EventsGridProps } from "@/types/event"

import { EventCard } from "./EventCard"

export function EventsGrid({
  events,
  variant = "public",
}: EventsGridProps) {
  if (events.length === 0) {
    return (
      <div
        className={
          variant === "admin" ? "events-admin__empty" : "calendar-events__empty"
        }
      >
        <CalendarDays />
        <p>No events found</p>
        {variant === "admin" && (
          <p className="text-sm">Create your first event to get started</p>
        )}
      </div>
    )
  }

  return (
    <div
      className={
        variant === "admin" ? "events-admin__grid" : "calendar-events__grid"
      }
    >
      {events.map((event: Event) => (
        <EventCard key={event.id} event={event} variant={variant} />
      ))}
    </div>
  )
}

export default EventsGrid
