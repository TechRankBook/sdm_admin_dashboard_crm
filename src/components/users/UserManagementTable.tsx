import React, { useState } from 'react'
import { UserManagementRecord } from '@/types/user-management'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MoreHorizontal, Eye, Shield, ShieldOff, Trash2, UserCog, Phone } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface UserManagementTableProps {
  users: UserManagementRecord[]
  onViewUser: (user: UserManagementRecord) => void
  onBlockUser: (userId: string, reason: string) => void
  onUnblockUser: (userId: string) => void
  onDeleteUser: (userId: string) => void
  onChangeRole: (userId: string, newRole: string) => void
}

export const UserManagementTable: React.FC<UserManagementTableProps> = ({
  users,
  onViewUser,
  onBlockUser,
  onUnblockUser,
  onDeleteUser,
  onChangeRole
}) => {
  const [blockDialog, setBlockDialog] = useState<{ open: boolean; user?: UserManagementRecord }>({ open: false })
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; user?: UserManagementRecord }>({ open: false })
  const [roleDialog, setRoleDialog] = useState<{ open: boolean; user?: UserManagementRecord }>({ open: false })
  const [blockReason, setBlockReason] = useState('')
  const [newRole, setNewRole] = useState('')

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      blocked: 'destructive',
      suspended: 'secondary'
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {status}
      </Badge>
    )
  }

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800',
      driver: 'bg-blue-100 text-blue-800',
      customer: 'bg-green-100 text-green-800',
      vendor: 'bg-orange-100 text-orange-800'
    }

    return (
      <Badge className={colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {role}
      </Badge>
    )
  }

  const handleBlock = () => {
    if (blockDialog.user && blockReason.trim()) {
      onBlockUser(blockDialog.user.id, blockReason)
      setBlockDialog({ open: false })
      setBlockReason('')
    }
  }

  const handleDelete = () => {
    if (deleteDialog.user) {
      onDeleteUser(deleteDialog.user.id)
      setDeleteDialog({ open: false })
    }
  }

  const handleRoleChange = () => {
    if (roleDialog.user && newRole) {
      onChangeRole(roleDialog.user.id, newRole)
      setRoleDialog({ open: false })
      setNewRole('')
    }
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.profile_picture_url} />
                      <AvatarFallback>
                        {user.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.full_name || 'Unknown'}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{getRoleBadge(user.role)}</TableCell>
                <TableCell>{getStatusBadge(user.status)}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user.phone_no}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {user.last_login_at 
                      ? formatDistanceToNow(new Date(user.last_login_at), { addSuffix: true })
                      : 'Never'
                    }
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewUser(user)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setRoleDialog({ open: true, user })}>
                        <UserCog className="h-4 w-4 mr-2" />
                        Change Role
                      </DropdownMenuItem>
                      {user.status === 'active' ? (
                        <DropdownMenuItem 
                          onClick={() => setBlockDialog({ open: true, user })}
                          className="text-destructive"
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Block User
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => onUnblockUser(user.id)}>
                          <ShieldOff className="h-4 w-4 mr-2" />
                          Unblock User
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => setDeleteDialog({ open: true, user })}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Block User Dialog */}
      <Dialog open={blockDialog.open} onOpenChange={(open) => setBlockDialog({ open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block User</DialogTitle>
            <DialogDescription>
              Are you sure you want to block {blockDialog.user?.full_name}? 
              Please provide a reason for blocking this user.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="blockReason">Reason for blocking</Label>
              <Textarea
                id="blockReason"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Enter reason for blocking this user..."
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockDialog({ open: false })}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleBlock}
              disabled={!blockReason.trim()}
            >
              Block User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {deleteDialog.user?.full_name}? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog open={roleDialog.open} onOpenChange={(open) => setRoleDialog({ open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Change the role for {roleDialog.user?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newRole">New Role</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="driver">Driver</SelectItem>
                  <SelectItem value="vendor">Vendor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialog({ open: false })}>
              Cancel
            </Button>
            <Button onClick={handleRoleChange} disabled={!newRole}>
              Change Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}