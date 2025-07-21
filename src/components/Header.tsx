
import React from 'react'
import { Menu, Bell, User, Settings, LogOut, Eye, Edit3 ,PanelLeftClose,PanelLeftOpen, PanelLeft } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { UserAvatar } from '@/components/ui/user-avatar'

interface HeaderProps {
  onMenuClick: () => void
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { signOut, user } = useAuth()
  const navigate = useNavigate()

  // Extract admin info from user
  const adminEmail = user?.email || 'admin@fleetmanager.com'
  const adminName = user?.user_metadata?.full_name || 'Admin User'

  const handleViewProfile = () => {
    navigate('/profile')
  }

  const handleEditProfile = () => {
    navigate('/profile?edit=true')
  }

  const handleLogOut = async () => {
    await signOut()
  }

  return (
    <header className="bg-background border-b border-border px-6 py-3 shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="flex items-center"
          >
          <PanelLeft className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </Button>

          {/* Admin Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-3 px-3 py-1">
                <UserAvatar
                  name={adminName}
                  email={adminEmail}
                  size="sm"
                  showOnlineStatus={true}
                />
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-medium">{adminName}</span>
                  <span className="text-xs text-muted-foreground">Administrator</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-background border border-border shadow-lg">
              {/* Profile Header */}
              <DropdownMenuLabel className="p-4">
                <div className="flex items-center space-x-3">
                  <UserAvatar
                    name={adminName}
                    email={adminEmail}
                    size="md"
                    showOnlineStatus={true}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{adminName}</p>
                    <p className="text-xs text-muted-foreground truncate">{adminEmail}</p>
                    <div className="flex items-center mt-1">
                      <div className="h-2 w-2 bg-green-500 rounded-full mr-1"></div>
                      <span className="text-xs text-green-600">Online</span>
                    </div>
                  </div>
                </div>
              </DropdownMenuLabel>
              
              <DropdownMenuSeparator />
              
              {/* Profile Actions */}
              <DropdownMenuItem onClick={handleViewProfile} className="flex items-center space-x-2 cursor-pointer">
                <Eye className="h-4 w-4" />
                <span>View Profile</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={handleEditProfile} className="flex items-center space-x-2 cursor-pointer">
                <Edit3 className="h-4 w-4" />
                <span>Edit Profile</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => navigate('/settings')} className="flex items-center space-x-2 cursor-pointer">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              {/* Log Out */}
              <DropdownMenuItem onClick={handleLogOut} className="flex items-center space-x-2 cursor-pointer text-red-600 focus:text-red-600">
                <LogOut className="h-4 w-4" />
                <span>Log Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
