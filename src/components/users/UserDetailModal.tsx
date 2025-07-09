import React, { useState, useEffect } from 'react'
import { UserManagementRecord, UserActivity, ReviewRecord } from '@/types/user-management'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Star, MapPin, Calendar, Phone, Mail, CreditCard, Car, Award, Activity } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

interface UserDetailModalProps {
  user: UserManagementRecord | null
  open: boolean
  onClose: () => void
  onFetchActivities: (userId: string) => Promise<UserActivity[]>
  onFetchReviews: (userId: string) => Promise<ReviewRecord[]>
  onModerateReview: (reviewId: string, status: string, notes?: string) => void
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  user,
  open,
  onClose,
  onFetchActivities,
  onFetchReviews,
  onModerateReview
}) => {
  const [activities, setActivities] = useState<UserActivity[]>([])
  const [reviews, setReviews] = useState<ReviewRecord[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user && open) {
      loadUserData()
    }
  }, [user, open])

  const loadUserData = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const [activitiesData, reviewsData] = await Promise.all([
        onFetchActivities(user.id),
        onFetchReviews(user.id)
      ])
      setActivities(activitiesData)
      setReviews(reviewsData)
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-muted-foreground">({rating})</span>
      </div>
    )
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login': return <Activity className="h-4 w-4" />
      case 'booking_created': return <Car className="h-4 w-4" />
      case 'role_change': return <Award className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Header */}
          <div className="flex items-start space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.profile_picture_url} />
              <AvatarFallback className="text-lg">
                {user.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-xl font-semibold">{user.full_name || 'Unknown User'}</h3>
                <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                  {user.status}
                </Badge>
                <Badge variant="outline">{user.role}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>{user.phone_no}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {format(new Date(user.created_at), 'MMM dd, yyyy')}</span>
                </div>
                {user.last_login_at && (
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4" />
                    <span>Last login {formatDistanceToNow(new Date(user.last_login_at), { addSuffix: true })}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Role-specific Information */}
          {user.role === 'driver' && (
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Total Rides</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{user.total_rides || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Rating</CardTitle>
                </CardHeader>
                <CardContent>
                  {renderStars(user.driver_rating || 0)}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline">{user.driver_status}</Badge>
                </CardContent>
              </Card>
            </div>
          )}

          {user.role === 'customer' && (
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Loyalty Points</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{user.loyalty_points || 0}</div>
                </CardContent>
              </Card>
            </div>
          )}

          {user.role === 'vendor' && user.gst_number && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">GST Number</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-mono">{user.gst_number}</div>
              </CardContent>
            </Card>
          )}

          {user.role === 'admin' && user.assigned_region && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Assigned Region
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>{user.assigned_region}</div>
              </CardContent>
            </Card>
          )}

          {/* Tabs for detailed information */}
          <Tabs defaultValue="activities" className="w-full">
            <TabsList>
              <TabsTrigger value="activities">Recent Activity</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              {user.block_reason && (
                <TabsTrigger value="moderation">Moderation</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="activities" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                  <CardDescription>Latest user activities and interactions</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-4">Loading activities...</div>
                  ) : activities.length > 0 ? (
                    <div className="space-y-3">
                      {activities.slice(0, 10).map((activity) => (
                        <div key={activity.id} className="flex items-start space-x-3 py-2 border-b last:border-b-0">
                          <div className="mt-1">{getActivityIcon(activity.activity_type)}</div>
                          <div className="flex-1">
                            <div className="font-medium">{activity.description}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No recent activities
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>User Reviews</CardTitle>
                  <CardDescription>Reviews given by or received by this user</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-4">Loading reviews...</div>
                  ) : reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            {renderStars(review.rating || 0)}
                            <div className="flex items-center space-x-2">
                              <Badge variant={review.status === 'active' ? 'default' : 'secondary'}>
                                {review.status}
                              </Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onModerateReview(review.id, 
                                  review.status === 'active' ? 'flagged' : 'active'
                                )}
                              >
                                {review.status === 'active' ? 'Flag' : 'Approve'}
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm mb-2">{review.comment}</p>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(review.created_at), 'MMM dd, yyyy HH:mm')}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No reviews found
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {user.block_reason && (
              <TabsContent value="moderation" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Moderation Information</CardTitle>
                    <CardDescription>Details about moderation actions taken on this user</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Block Reason</h4>
                        <p className="text-sm bg-muted p-3 rounded">{user.block_reason}</p>
                      </div>
                      {user.blocked_at && (
                        <div>
                          <h4 className="font-medium mb-2">Blocked At</h4>
                          <p className="text-sm">{format(new Date(user.blocked_at), 'MMM dd, yyyy HH:mm')}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}