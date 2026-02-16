import { Link as RouterLink } from "@tanstack/react-router";
import { CalendarPlus, ChevronDown, LayoutDashboard, LogOut, Settings } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useAuth from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/useMobile";
import { getInitials } from "@/utils";

export function HeaderUserMenu() {
  const { user, logout } = useAuth();
  const isMobile = useIsMobile();

  if (!user) return null;

  // Mobile: Display all items directly in full-screen list format
  if (isMobile) {
    return (
      <div className="header-user-menu--mobile">
        {/* User Info Header */}
        <div className="header-user-menu__header--mobile">
          <Avatar className="size-12 ring-2 ring-white/20">
            <AvatarFallback className="bg-gradient-to-br from-zinc-600 to-zinc-800 text-white text-base font-semibold">
              {getInitials(user.full_name || "User")}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-white truncate text-lg">{user.full_name}</span>
            <span className="text-sm text-white/50 truncate">{user.email}</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="header-user-menu__nav--mobile">
          {user.is_superuser && (
            <RouterLink to="/events/create" className="header-user-menu__link--mobile">
              <CalendarPlus className="size-5" />
              Create Event
            </RouterLink>
          )}
          <RouterLink to="/dashboard" className="header-user-menu__link--mobile">
            <LayoutDashboard className="size-5" />
            Dashboard
          </RouterLink>
          <RouterLink to="/settings" className="header-user-menu__link--mobile">
            <Settings className="size-5" />
            Settings
          </RouterLink>
        </nav>

        {/* Logout */}
        <button
          type="button"
          className="header-user-menu__link--mobile header-user-menu__link--logout"
          onClick={logout}
        >
          <LogOut className="size-5" />
          Log Out
        </button>
      </div>
    );
  }

  // Desktop: Use dropdown menu
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="header-user-menu__trigger group flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-white/10 transition-colors duration-200"
          data-testid="header-user-menu"
        >
          <Avatar className="header-user-menu__avatar size-8 ring-2 ring-white/20 group-hover:ring-white/40 transition-all duration-200">
            <AvatarFallback className="bg-gradient-to-br from-zinc-600 to-zinc-800 text-white text-sm font-semibold">
              {getInitials(user.full_name || "User")}
            </AvatarFallback>
          </Avatar>
          <span className="header-user-menu__name hidden sm:inline-block text-sm font-medium text-white">
            {user.full_name || user.email}
          </span>
          <ChevronDown className="hidden sm:block size-4 text-white/60 group-hover:text-white/80 transition-colors duration-200" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {/* User Info Header */}
        <div className="header-user-menu__header px-3 py-3 mb-1">
          <div className="flex items-center gap-3">
            <Avatar className="size-10 ring-2 ring-white/20">
              <AvatarFallback className="bg-gradient-to-br from-zinc-600 to-zinc-800 text-white text-sm font-semibold">
                {getInitials(user.full_name || "User")}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-white truncate">{user.full_name}</span>
              <span className="text-xs text-white/50 truncate">{user.email}</span>
            </div>
          </div>
        </div>
        <DropdownMenuSeparator />

        {/* Navigation Items */}
        <DropdownMenuGroup>
          {user.is_superuser && (
            <RouterLink to="/events/create">
              <DropdownMenuItem className="header-user-menu__item">
                <CalendarPlus className="size-4" />
                Create Event
              </DropdownMenuItem>
            </RouterLink>
          )}
          <RouterLink to="/dashboard">
            <DropdownMenuItem className="header-user-menu__item">
              <LayoutDashboard className="size-4" />
              Dashboard
            </DropdownMenuItem>
          </RouterLink>
          <RouterLink to="/settings">
            <DropdownMenuItem className="header-user-menu__item">
              <Settings className="size-4" />
              Settings
            </DropdownMenuItem>
          </RouterLink>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem
          className="header-user-menu__item header-user-menu__item--logout text-red-400 focus:text-red-300 focus:bg-red-500/20"
          onClick={logout}
        >
          <LogOut className="size-4" />
          Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
