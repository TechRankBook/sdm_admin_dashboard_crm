
import React from 'react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  LayoutDashboard,
  Calendar,
  Users,
  Car,
  MapPin,
  DollarSign,
  BarChart3,
  MessageSquare,
  FileText,
  Bell,
  Settings,
  UserCog,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Bookings', href: '/bookings', icon: Calendar },
  { name: 'Drivers', href: '/drivers', icon: Users },
  { name: 'Vehicles', href: '/vehicles', icon: Car },
  { name: 'Live Tracking', href: '/live-tracking', icon: MapPin },
  { name: 'Pricing', href: '/pricing', icon: DollarSign },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Communication', href: '/communication', icon: MessageSquare },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'User Management', href: '/users', icon: UserCog },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Settings', href: '/settings', icon: Settings },
]

interface SidebarProps {
  open: boolean
  onToggle: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ open, onToggle }) => {
  const NavigationItem = ({ item }: { item: typeof navigation[0] }) => {
    const content = (
      <NavLink
        to={item.href}
        className={({ isActive }) =>
          cn(
            ' px-2 py-2 text-sm font-medium rounded-lg transition-colors ',
            isActive? 'bg-primary text-primary-foreground':'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            open ? 'justify-start flex items-center':'justify-center',
            
          )
        }
      >
        <item.icon className={cn("h-5 w-5 flex-shrink-0", open ? "mr-3" : "")} />
        {open && <span className="truncate">{item.name}</span>}
      </NavLink>
    )

    if (!open) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent side="right" className="ml-2">
            {item.name}
          </TooltipContent>
        </Tooltip>
      )
    }

    return content
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          'bg-background border-r border-border flex flex-col transition-all duration-300 ease-in-out relative shadow-lg',
          open ? 'w-56' : 'w-16'
        )}
      >
        {/* Header with Logo and Toggle */}
        <div className={cn("p-4 border-b border-border", open ? "px-6" : "px-4")}>
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0">
              <div className="w-8 h-8  rounded-lg flex items-center justify-center flex-shrink-0">
                {/* <span className="text-primary-foreground font-bold text-sm">FM</span> */}
                <img src="/logo1.png" alt="Logo" className="h-10 bg-cover" />
              </div>
              {open && (
                <div className="ml-3 min-w-0">
                  <h1 className="text-lg font-semibold text-foreground truncate">SDM-Emobility</h1>
                </div>
              )}
            </div>
            {/* <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className={cn(
                "h-8 w-8 flex-shrink-0 transition-transform duration-300",
                !open && "ml-0"
              )}
            >
              {open ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button> */}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 ">
          {navigation.map((item) => (
            <NavigationItem key={item.name} item={item} />
          ))}
        </nav>

        {/* Footer with User Info (when expanded) */}
        {open && (
          <div className="p-4 border-t border-border">
            <div className="text-xs text-muted-foreground">
              Admin Dashboard
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
