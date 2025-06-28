
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from '@/context/AuthContext'
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="login" element={<Login />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="bookings" element={<Bookings />} />
              <Route path="drivers" element={<Drivers />} />
              <Route path="vehicles" element={<Vehicles />} />
              <Route path="live-tracking" element={<LiveTracking />} />
              <Route path="pricing" element={<Pricing />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="communication" element={<Communication />} />
              <Route path="documents" element={<Documents />} />
              <Route path="notifications" element={<div className="p-6">Notifications page coming soon...</div>} />
              <Route path="settings" element={<div className="p-6">Settings page coming soon...</div>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
