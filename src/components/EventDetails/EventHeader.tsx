import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Bookmark, Check, Share2 } from "lucide-react"
import { useState } from "react"

import { EventsService } from "@/client"
import useAuth, { isLoggedIn } from "@/hooks/useAuth"

interface EventHeaderProps {
  title: string
  venueName: string
  dateTime: string
  shortSummary: string
  eventId: string
}

export function EventHeader({
  title,
  venueName,
  dateTime,
  shortSummary,
  eventId,
}: EventHeaderProps) {
  const [copied, setCopied] = useState(false)
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const userLoggedIn = isLoggedIn() && !!user

  // Check if event is bookmarked
  const { data: bookmarkStatus } = useQuery({
    queryKey: ["bookmark", eventId],
    queryFn: () => EventsService.checkBookmark({ eventId }),
    enabled: userLoggedIn,
  })

  const isBookmarked = bookmarkStatus?.is_bookmarked ?? false

  // Add bookmark mutation
  const addBookmarkMutation = useMutation({
    mutationFn: () => EventsService.addBookmark({ eventId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmark", eventId] })
    },
  })

  // Remove bookmark mutation
  const removeBookmarkMutation = useMutation({
    mutationFn: () => EventsService.removeBookmark({ eventId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmark", eventId] })
    },
  })

  const handleBookmarkToggle = () => {
    if (isBookmarked) {
      removeBookmarkMutation.mutate()
    } else {
      addBookmarkMutation.mutate()
    }
  }

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/events/${eventId}`
    const shareData = {
      title: title,
      text: `Check out this event: ${title}`,
      url: shareUrl,
    }

    // Try native share API first (mobile devices)
    if (navigator.share) {
      try {
        await navigator.share(shareData)
        return
      } catch (err) {
        // User cancelled or share failed, fall back to clipboard
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy link:", err)
    }
  }

  const isBookmarkLoading =
    addBookmarkMutation.isPending || removeBookmarkMutation.isPending

  return (
    <div className="event-details__header space-y-8 pt-4">
      <div className="flex items-center gap-2 text-sm font-medium text-white/70">
        <div className="ml-auto flex gap-4">
          {userLoggedIn && (
            <button
              type="button"
              onClick={handleBookmarkToggle}
              disabled={isBookmarkLoading}
              className={`transition-colors ${
                isBookmarked
                  ? "text-yellow-400 hover:text-yellow-300"
                  : "text-white/60 hover:text-white"
              } ${isBookmarkLoading ? "opacity-50" : ""}`}
              title={isBookmarked ? "Remove bookmark" : "Bookmark event"}
            >
              <Bookmark
                className="w-5 h-5"
                fill={isBookmarked ? "currentColor" : "none"}
              />
            </button>
          )}
          <button
            type="button"
            onClick={handleShare}
            className="text-white/60 hover:text-white transition-colors"
            title={copied ? "Link copied!" : "Share event"}
          >
            {copied ? (
              <Check className="w-5 h-5 text-green-400" />
            ) : (
              <Share2 className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1]">
        {title}
      </h1>

      <div className="space-y-1">
        <p className="text-xl font-bold">{venueName}</p>
        <p className="text-lg text-white/60">{dateTime}</p>
      </div>

      <div className="h-[1px] bg-white/10 w-full" />

      {shortSummary && (
        <p className="text-lg leading-relaxed text-white/80">{shortSummary}</p>
      )}
    </div>
  )
}

export default EventHeader
