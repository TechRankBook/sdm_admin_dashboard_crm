import React from 'react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface UserAvatarProps {
  name?: string
  email?: string
  avatarUrl?: string
  size?: 'sm' | 'md' | 'lg'
  showOnlineStatus?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12'
}

const statusSizeClasses = {
  sm: 'h-2 w-2',
  md: 'h-3 w-3',
  lg: 'h-3 w-3'
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name = '',
  email = '',
  avatarUrl,
  size = 'md',
  showOnlineStatus = false,
  className
}) => {
  // Generate initials from name or email
  const getInitials = () => {
    if (name) {
      return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    
    if (email) {
      return email.charAt(0).toUpperCase()
    }
    
    return 'U'
  }

  return (
    <div className={cn('relative', className)}>
      <Avatar className={cn(sizeClasses[size])}>
        {avatarUrl && <AvatarImage src={avatarUrl} alt={name || email} />}
        <AvatarFallback className="bg-primary text-primary-foreground font-medium">
          {getInitials()}
        </AvatarFallback>
      </Avatar>
      
      {showOnlineStatus && (
        <div
          className={cn(
            'absolute bottom-0 right-0 rounded-full bg-green-500 ring-2 ring-background',
            statusSizeClasses[size]
          )}
        />
      )}
    </div>
  )
}