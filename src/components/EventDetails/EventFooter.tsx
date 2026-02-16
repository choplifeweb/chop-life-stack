export function EventFooter() {
  return (
    <footer className="event-details__footer relative z-10 w-full max-w-[1100px] mx-auto px-4 py-12 flex flex-col md:flex-row items-center justify-center border-t border-white/5 gap-8">
      <div className="flex items-center gap-8 text-sm font-medium text-white/40">
        <span className="text-white italic text-4xl font-black">Chop Life</span>
        <a href="#" className="hover:text-white transition-colors">
          Terms of Service
        </a>
        <a href="#" className="hover:text-white transition-colors">
          Privacy Policy
        </a>
      </div>
    </footer>
  )
}

export default EventFooter
