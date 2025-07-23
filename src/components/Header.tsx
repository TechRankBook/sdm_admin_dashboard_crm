
import React, { useState } from 'react'
import { Menu, Bell, User, Settings, LogOut, Eye, Edit3, PanelLeft, Check, Trash2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { UserAvatar } from '@/components/ui/user-avatar'
import { useProfile } from '@/hooks/useProfile'
import { useUserNotifications } from '@/hooks/useUserNotifications'
import { formatDistanceToNow } from 'date-fns'

interface HeaderProps {
  onMenuClick: () => void
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { signOut, user } = useAuth()
  const navigate = useNavigate()
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  
  // Use profile hook for dynamic user data
  const { profile, profileLoading } = useProfile()
  
  // Use user notifications hook
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    notificationsLoading 
  } = useUserNotifications()

  // Extract user info from profile or fallback to auth user
  const userName = profile?.full_name || user?.user_metadata?.full_name || 'User'
  const userEmail = profile?.email || user?.email || 'user@example.com'
  const userAvatar = profile?.profile_picture_url || user?.user_metadata?.avatar_url

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
          <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="flex items-center justify-between p-4 border-b">
                <h4 className="font-semibold">Notifications</h4>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAllAsRead()}
                    className="text-xs"
                  >
                    Mark all read
                  </Button>
                )}
              </div>
              <ScrollArea className="h-80">
                {notificationsLoading ? (
                  <div className="flex items-center justify-center h-20">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-20 text-muted-foreground">
                    <Bell className="h-8 w-8 mb-2" />
                    <p className="text-sm">No notifications</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 hover:bg-muted/50 transition-colors ${
                          !notification.read ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h5 className={`text-sm font-medium truncate ${
                                !notification.read ? 'font-semibold' : ''
                              }`}>
                                {notification.title}
                              </h5>
                              {!notification.read && (
                                <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                            </p>
                          </div>
                          <div className="flex items-center space-x-1 ml-2">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                                className="h-6 w-6 p-0"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              {notifications.length > 0 && (
                <div className="p-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      navigate('/notifications')
                      setNotificationsOpen(false)
                    }}
                  >
                    View all notifications
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          {/* Admin Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-3 px-3 py-1">
                <UserAvatar
                  name={userName}
                  email={userEmail}
                  avatarUrl={userAvatar}
                  size="sm"
                  showOnlineStatus={true}
                />
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-medium">{userName}</span>
                  <span className="text-xs text-muted-foreground">
                    {user?.user_metadata?.role || 'User'}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-background border border-border shadow-lg">
              {/* Profile Header */}
              <DropdownMenuLabel className="p-4">
                <div className="flex items-center space-x-3">
                  <UserAvatar
                    name={userName}
                    email={userEmail}
                    avatarUrl={userAvatar}
                    size="md"
                    showOnlineStatus={true}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{userName}</p>
                    <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
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
