import { Link } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"

import { HeaderUserMenu } from "@/components/Common/HeaderUserMenu"
import { Button } from "@/components/ui/button"

export function EventNavbar() {
  return (
    <nav className="event-details__navbar fixed top-0 left-0 right-0 z-[200] px-6 py-4 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent">
      <Button
        variant="ghost"
        size="icon"
        asChild
        className="w-10 h-10 bg-white/10 rounded-full backdrop-blur-md hover:bg-white/20 transition-colors"
      >
        <Link to="/calendar-events">
          <ArrowLeft className="h-5 w-5 text-white" />
        </Link>
      </Button>

      <HeaderUserMenu />
    </nav>
  )
}

export default EventNavbar
