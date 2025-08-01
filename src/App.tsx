
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from '@/context/AuthContext';

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Donors from "./pages/Donors";
import AddDonor from "./pages/AddDonor";
import EditDonor from "./pages/EditDonor";
import DonatedIndividuals from "./pages/DonatedIndividuals";
import BloodGroups from "./pages/BloodGroups";
import Campaigns from "./pages/Campaigns";
import Messages from "./pages/Messages";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected routes */}
        <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
        <Route path="/donors" element={<ProtectedRoute><Donors /></ProtectedRoute>} />
        <Route path="/donors/new" element={<ProtectedRoute><AddDonor /></ProtectedRoute>} />
        <Route path="/donors/:id/edit" element={<ProtectedRoute><EditDonor /></ProtectedRoute>} />
        <Route path="/donated-individuals" element={<ProtectedRoute><DonatedIndividuals /></ProtectedRoute>} />
        <Route path="/blood-groups" element={<ProtectedRoute><BloodGroups /></ProtectedRoute>} />
        <Route path="/campaigns" element={<ProtectedRoute><Campaigns /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        
        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppRoutes />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
