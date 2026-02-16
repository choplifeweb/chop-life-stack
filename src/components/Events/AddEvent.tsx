import { Link } from "@tanstack/react-router"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import useAuth from "@/hooks/useAuth"

export function AddEvent() {
  const { user } = useAuth()

  // Only show Add Event button for admin users
  if (!user?.is_superuser) {
    return null
  }

  return (
    <Button asChild className="my-4">
      <Link to="/events/create">
        <Plus className="mr-2 h-4 w-4" />
        Add Event
      </Link>
    </Button>
  )
}

export default AddEvent
