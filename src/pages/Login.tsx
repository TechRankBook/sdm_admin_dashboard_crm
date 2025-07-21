
import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { AlertCircle, Loader2 } from 'lucide-react'

export const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, isAuthenticated, isAdmin } = useAuth()

  // No need to redirect here - AuthenticatedApp handles all routing
  console.log("Login: Rendering login page - isAuthenticated:", isAuthenticated, "isAdmin:", isAdmin)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Login: Attempting login for:", email)
    
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)

    try {
      const { error } = await signIn(email, password)
      
      if (error) {
        console.error("Login: Authentication error:", error.message)
        
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password')
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Please verify your email address before logging in')
        } else {
          toast.error(error.message)
        }
      } else {
        console.log("Login: Authentication successful, waiting for role verification")
        toast.success('Login successful!')
        // Navigation will happen automatically via AuthenticatedApp
      }
    } catch (error: any) {
      console.error("Login: Unexpected error:", error.message)
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto  h-16  rounded-lg flex items-center justify-center mb-4">
             <img src="/logo.png" alt="Logo" className="h-10 bg-cover" />
          </div>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>
            Sign in to access the fleet management dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Administrator Access Only</p>
              <p className="text-xs text-amber-700 mt-1">
                Only users with administrator privileges can access this dashboard
              </p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
