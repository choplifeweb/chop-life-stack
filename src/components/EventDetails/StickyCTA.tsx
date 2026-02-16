interface StickyCTAProps {
  onClick?: () => void
  lowestPrice: number
}

export function StickyCTA({ onClick, lowestPrice }: StickyCTAProps) {
  const priceText =
    lowestPrice === 0 ? "Get Free Tickets" : `Buy tickets from $${lowestPrice.toFixed(2)}`

  return (
    <div className="event-details__sticky-cta fixed bottom-0 left-0 right-0 px-4 pb-4 pt-8 sm:p-6 sm:pt-12 z-40 flex justify-center bg-gradient-to-t from-[#0d0d12] via-[#0d0d12]/80 to-transparent">
      <button
        type="button"
        onClick={onClick}
        className="w-full max-w-[500px] py-3.5 sm:py-4 bg-[#7a7fc1] hover:bg-[#868bd4] text-white font-black text-base sm:text-lg rounded-full shadow-2xl shadow-[#7a7fc1]/40 transform active:scale-95 transition-all duration-200"
      >
        {priceText}
      </button>
    </div>
  )
}

export default StickyCTA
