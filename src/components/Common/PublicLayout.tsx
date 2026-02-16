import { Link as RouterLink, useRouterState } from "@tanstack/react-router"
import { Menu, X } from "lucide-react"
import { useState } from "react"

import { HeaderUserMenu } from "@/components/Common/HeaderUserMenu"
import { ContactPanel } from "@/components/Contact"
import { Button } from "@/components/ui/button"
import useAuth, { isLoggedIn } from "@/hooks/useAuth"
import "@/styles/custom.scss"

interface PublicLayoutProps {
  children: React.ReactNode
  headerBlur?: boolean
}

type InternalNavLink = {
  to: "/" | "/experience-gallery" | "/about-us" | "/calendar-events"
  label: string
  external?: false
}

type ExternalNavLink = {
  to: string
  label: string
  external: true
}

type NavLink = InternalNavLink | ExternalNavLink

const navLinks: NavLink[] = [
  { to: "/", label: "Home" },
  { to: "/experience-gallery", label: "Experience Gallery" },
  { to: "/calendar-events", label: "Calendar Events" },
  { to: "/about-us", label: "About Us" },
]

export function PublicLayout({ children, headerBlur = true }: PublicLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [contactPanelOpen, setContactPanelOpen] = useState(false)
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname
  const { user } = useAuth()
  const authenticated = isLoggedIn() && user

  return (
    <div className="public-layout min-h-svh flex flex-col">
      <header className={`site-header ${headerBlur && !mobileMenuOpen ? "site-header--blur" : ""} ${mobileMenuOpen ? "site-header--mobile-open" : ""}`}>
        <div className="site-header__container">
          <RouterLink to="/" className="site-header__logo">
            <img
              src="/assets/images/chop_life_logo_white.png"
              alt="Chop Life"
              className="h-16 w-auto"
            />
          </RouterLink>

          <nav className="site-header__nav">
            {navLinks.map((link) =>
              "external" in link && link.external ? (
                <a
                  key={link.to}
                  href={link.to}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nav-link"
                >
                  {link.label}
                </a>
              ) : (
                <RouterLink
                  key={link.to}
                  to={link.to}
                  className={`nav-link ${currentPath === link.to ? "nav-link--active" : ""}`}
                >
                  {link.label}
                </RouterLink>
              )
            )}
            <button
              type="button"
              className="nav-link"
              onClick={() => setContactPanelOpen(true)}
            >
              Contact Us
            </button>
          </nav>

          <div className="site-header__actions">
            <div className="hidden md:flex items-center gap-2">
              {authenticated ? (
                <HeaderUserMenu />
              ) : (
                <>
                  {/* <Button variant="ghost" size="sm" asChild className="site-header__btn">
                    <RouterLink to="/login">Log In</RouterLink>
                  </Button>
                  <Button size="sm" asChild className="site-header__btn site-header__btn--primary">
                    <RouterLink to="/signup">Sign Up</RouterLink>
                  </Button> */}
                </>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="site-header__mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="mobile-menu px-6">
            <nav className="flex flex-col">
              {navLinks.map((link) =>
                "external" in link && link.external ? (
                  <a
                    key={link.to}
                    href={link.to}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mobile-menu__link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ) : (
                  <RouterLink
                    key={link.to}
                    to={link.to}
                    className={`mobile-menu__link ${currentPath === link.to ? "mobile-menu__link--active" : ""}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </RouterLink>
                )
              )}
              <button
                type="button"
                className="mobile-menu__link"
                onClick={() => {
                  setMobileMenuOpen(false)
                  setContactPanelOpen(true)
                }}
              >
                Contact Us
              </button>
            </nav>
            <div className="mobile-menu__actions">
              {authenticated ? (
                <HeaderUserMenu />
              ) : (
                <>
                  {/* <Button variant="ghost" size="sm" asChild className="flex-1 site-header__btn">
                    <RouterLink to="/login">Log In</RouterLink>
                  </Button>
                  <Button size="sm" asChild className="flex-1 site-header__btn site-header__btn--primary">
                    <RouterLink to="/signup">Sign Up</RouterLink>
                  </Button> */}
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="public-layout__main flex-1">
        {children}
      </main>

      <ContactPanel
        isOpen={contactPanelOpen}
        onClose={() => setContactPanelOpen(false)}
      />
    </div>
  )
}
