import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Guest } from "@/types/event"

interface GuestlistAvatarsProps {
  guests: Guest[]
  max?: number
  showLabel?: boolean
}

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function GuestlistAvatars({
  guests,
  max = 5,
  showLabel = true,
}: GuestlistAvatarsProps) {
  const confirmedGuests = guests.filter((g) => g.rsvpStatus === "confirmed")
  const displayGuests = confirmedGuests.slice(0, max)
  const remaining = confirmedGuests.length - max

  if (confirmedGuests.length === 0) {
    return null
  }

  return (
    <div className="guestlist-avatars">
      {displayGuests.map((guest) => (
        <Avatar key={guest.id} className="guestlist-avatars__item size-8">
          <AvatarImage src={guest.avatarUrl} alt={guest.name} />
          <AvatarFallback className="text-xs">
            {getInitials(guest.name)}
          </AvatarFallback>
        </Avatar>
      ))}
      {remaining > 0 && (
        <div className="guestlist-avatars__more">+{remaining}</div>
      )}
      {showLabel && (
        <span className="guestlist-avatars__label">
          {confirmedGuests.length === 1
            ? `${confirmedGuests[0].name} going`
            : `${confirmedGuests[0].name} and ${confirmedGuests.length - 1} others going`}
        </span>
      )}
    </div>
  )
}

export default GuestlistAvatars
