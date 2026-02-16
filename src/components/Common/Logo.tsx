import { Link } from "@tanstack/react-router"

import { cn } from "@/lib/utils"
// import logo from "/assets/images/chop-life-logo.png"

interface LogoProps {
  variant?: "full" | "icon" | "responsive"
  className?: string
  asLink?: boolean
}

export function Logo({
  variant = "full",
  className,
  asLink = true,
}: LogoProps) {
  const content =
    variant === "responsive" ? (
      <>
        {/* <img
          src={logo}
          alt="Chop Life"
          className={cn(
            "h-6 w-auto group-data-[collapsible=icon]:hidden",
            className,
          )}
        /> */}
        <span
          className={cn(
            "text-xl font-bold group-data-[collapsible=icon]:hidden",
            className,
          )}
        >
          Chop Life
        </span>
        {/* <img
          src={logo}
          alt="Chop Life"
          className={cn(
            "size-5 hidden group-data-[collapsible=icon]:block",
            className,
          )}
        /> */}
        <span
          className={cn(
            "text-sm font-bold hidden group-data-[collapsible=icon]:block",
            className,
          )}
        >
          CL
        </span>
      </>
    ) : (
      // <img
      //   src={logo}
      //   alt="Chop Life"
      //   className={cn(variant === "full" ? "h-6 w-auto" : "size-5", className)}
      // />
      <span
        className={cn(
          variant === "full" ? "text-xl font-bold" : "text-sm font-bold",
          className,
        )}
      >
        {variant === "full" ? "Chop Life" : "CL"}
      </span>
    )

  if (!asLink) {
    return content
  }

  return <Link to="/">{content}</Link>
}
