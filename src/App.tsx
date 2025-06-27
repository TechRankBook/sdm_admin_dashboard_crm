
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
              <Route path="drivers" element={<div className="p-6">Drivers page coming soon...</div>} />
              <Route path="vehicles" element={<div className="p-6">Vehicles page coming soon...</div>} />
              <Route path="live-tracking" element={<div className="p-6">Live tracking page coming soon...</div>} />
              <Route path="pricing" element={<div className="p-6">Pricing page coming soon...</div>} />
              <Route path="analytics" element={<div className="p-6">Analytics page coming soon...</div>} />
              <Route path="communication" element={<div className="p-6">Communication page coming soon...</div>} />
              <Route path="documents" element={<div className="p-6">Documents page coming soon...</div>} />
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
