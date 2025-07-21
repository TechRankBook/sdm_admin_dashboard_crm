
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from '@/context/AuthContext'
import { AuthenticatedApp } from '@/components/AuthenticatedApp'
import { AuthErrorBoundary } from '@/components/AuthErrorBoundary'

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
        <AuthErrorBoundary>
          <AuthProvider>
            <AuthenticatedApp />
          </AuthProvider>
        </AuthErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  )
};

export default App;
