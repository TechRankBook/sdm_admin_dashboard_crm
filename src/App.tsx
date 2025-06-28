
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from '@/context/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Layout } from '@/components/Layout'
import { Login } from '@/pages/Login'
import { Dashboard } from '@/pages/Dashboard'
import { Bookings } from '@/pages/Bookings'
import { Drivers } from '@/pages/Drivers'
import { Vehicles } from '@/pages/Vehicles'
import { LiveTracking } from '@/pages/LiveTracking'
import { Pricing } from '@/pages/Pricing'
import { Analytics } from '@/pages/Analytics'
import { Communication } from '@/pages/Communication'
import { Documents } from '@/pages/Documents'
import { AdminProfile } from '@/pages/AdminProfile'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error: any) => {
        console.error(`Query failed (attempt ${failureCount + 1}):`, error.message)
        return failureCount < 2 // Retry up to 2 times
      },
    },
  },
});

const App = () => {
  console.log("App: Starting Fleet Management Dashboard")
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<ProtectedRoute />}>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="bookings" element={<Bookings />} />
                  <Route path="drivers" element={<Drivers />} />
                  <Route path="vehicles" element={<Vehicles />} />
                  <Route path="live-tracking" element={<LiveTracking />} />
                  <Route path="pricing" element={<Pricing />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="communication" element={<Communication />} />
                  <Route path="documents" element={<Documents />} />
                  <Route path="profile" element={<AdminProfile />} />
                  <Route path="notifications" element={<div className="p-6">Notifications page coming soon...</div>} />
                  <Route path="settings" element={<div className="p-6">Settings page coming soon...</div>} />
                </Route>
              </Route>
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  )
};

export default App;
