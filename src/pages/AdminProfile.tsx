
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { Admin } from '@/types/database'
import { User, Lock, Camera } from 'lucide-react'

export const AdminProfile: React.FC = () => {
  const { user } = useAuth()
  const [adminData, setAdminData] = useState<Admin | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [passwordChanging, setPasswordChanging] = useState(false)
  
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone_no: '',
    assigned_region: '',
  })
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  
  const [profilePicture, setProfilePicture] = useState<File | null>(null)

  useEffect(() => {
    if (user) {
      fetchAdminData()
    }
  }, [user])

  const fetchAdminData = async () => {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('id', user?.id)
        .single()

      if (error) throw error
      
      setAdminData(data)
      setProfileForm({
        full_name: data.full_name,
        phone_no: data.phone_no,
        assigned_region: data.assigned_region || '',
      })
    } catch (error) {
      console.error('Error fetching admin data:', error)
      toast.error('Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !adminData) return

    setUpdating(true)

    try {
      let profilePictureUrl = adminData.profile_picture_url

      // Upload new profile picture if provided
      if (profilePicture) {
        const fileExt = profilePicture.name.split('.').pop()
        const fileName = `admin-${user.id}-${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('drivers-profile-pictures')
          .upload(fileName, profilePicture)

        if (uploadError) throw uploadError
        
        const { data: { publicUrl } } = supabase.storage
          .from('drivers-profile-pictures')
          .getPublicUrl(fileName)
        
        profilePictureUrl = publicUrl
      }

      const { error } = await supabase
        .from('admins')
        .update({
          ...profileForm,
          profile_picture_url: profilePictureUrl,
        })
        .eq('id', user.id)

      if (error) throw error

      toast.success('Profile updated successfully')
      setProfilePicture(null)
      await fetchAdminData()
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setUpdating(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long')
      return
    }

    setPasswordChanging(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      })

      if (error) throw error

      toast.success('Password changed successfully')
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error('Failed to change password')
    } finally {
      setPasswordChanging(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!adminData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Unable to load profile data</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      <div className="grid gap-6">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your personal information and profile picture
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={adminData.profile_picture_url} />
                  <AvatarFallback>
                    {adminData.full_name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Label htmlFor="profile_picture" className="cursor-pointer">
                    <div className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800">
                      <Camera className="h-4 w-4" />
                      <span>Change Photo</span>
                    </div>
                  </Label>
                  <Input
                    id="profile_picture"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProfilePicture(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={profileForm.full_name}
                    onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={adminData.email}
                    disabled
                    className="bg-gray-100"
                  />
                  <p className="text-xs text-gray-500">Email cannot be changed here</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone_no">Phone Number</Label>
                  <Input
                    id="phone_no"
                    value={profileForm.phone_no}
                    onChange={(e) => setProfileForm({ ...profileForm, phone_no: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assigned_region">Assigned Region</Label>
                  <Input
                    id="assigned_region"
                    value={profileForm.assigned_region}
                    onChange={(e) => setProfileForm({ ...profileForm, assigned_region: e.target.value })}
                    placeholder="e.g., North District, Central Zone"
                  />
                </div>
              </div>

              <Button type="submit" disabled={updating}>
                {updating ? 'Updating...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password Change */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="h-5 w-5 mr-2" />
              Change Password
            </CardTitle>
            <CardDescription>
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current_password">Current Password</Label>
                <Input
                  id="current_password"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new_password">New Password</Label>
                <Input
                  id="new_password"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm New Password</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" disabled={passwordChanging}>
                {passwordChanging ? 'Changing...' : 'Change Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
