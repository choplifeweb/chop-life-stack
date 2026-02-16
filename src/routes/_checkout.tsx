import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/_checkout")({
  component: CheckoutLayout,
})

function CheckoutLayout() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default CheckoutLayout
