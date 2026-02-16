import { ChevronRight, Instagram } from "lucide-react"

export function HostCard() {
  return (
    <div className="event-details__host-card glass-panel rounded-3xl p-10 space-y-8 flex flex-col items-center">
      <div className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-widest text-white/40">
        <div className="flex items-center gap-1">
          <span>Hosted by</span>
          <span className="text-white/70">The Record Club</span>
          <svg
            className="w-3 h-3 text-blue-400 fill-current"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        </div>
        <button
          type="button"
          className="flex items-center gap-1 hover:text-white transition-colors"
        >
          More events
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-col items-center text-center space-y-6 w-full">
        <div className="w-40 h-40 rounded-full overflow-hidden border-2 border-white/5 shadow-2xl">
          <img
            src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400"
            alt="Host Profile Dummy"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-1">
          <h4 className="text-2xl font-black">The Record Club</h4>
          <p className="text-white/40 text-sm font-bold">53 events</p>
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            className="text-white/40 hover:text-white transition-colors"
          >
            <Instagram className="w-6 h-6" />
          </button>
        </div>

        <div className="flex gap-4 w-full max-md pt-4">
          <button
            type="button"
            className="flex-1 px-8 py-4 rounded-full border border-white/10 font-black text-sm hover:bg-white/5 transition-colors uppercase"
          >
            Contact
          </button>
          <button
            type="button"
            className="flex-1 px-8 py-4 rounded-full bg-white text-black font-black text-sm hover:opacity-90 transition-opacity uppercase"
          >
            Follow
          </button>
        </div>
      </div>
    </div>
  )
}

export default HostCard
