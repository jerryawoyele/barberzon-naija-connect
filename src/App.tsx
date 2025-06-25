
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect } from "react";
import { authService, apiClient } from "@/services";
import { GoogleOAuthProvider } from '@react-oauth/google';
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import EmailVerification from "./pages/EmailVerification";
import VerificationPending from "./pages/VerificationPending";
import PaymentCallback from "./pages/PaymentCallback";
import Index from "./pages/Index";
import BookingsPage from "./pages/bookings";
import WalletPage from "./pages/wallet";
import NotificationsPage from "./pages/notifications";
import ProfilePage from "./pages/profile";
import BarberLogin from "./pages/barber/login";
import BarberSignup from "./pages/barber/signup";
import BarberDashboard from "./pages/barber/dashboard";
import BarberAppointments from "./pages/barber/appointments";
import BarberCustomers from "./pages/barber/customers";
import BarberPayments from "./pages/barber/payments";
import BarberSettings from "./pages/barber/settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // Check for token on app load
  useEffect(() => {
    // Try to restore auth state from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      // Set the token in the API client
      apiClient.setToken(token);
      // Get current user info
      authService.getCurrentUser();
    }
  }, []);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-email" element={<EmailVerification />} />
            <Route path="/verification-pending" element={<VerificationPending />} />
            <Route path="/payment/callback" element={<PaymentCallback />} />
            
            {/* Customer Routes - Protected */}
            <Route path="/home" element={
              <ProtectedRoute userType="customer">
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/bookings" element={
              <ProtectedRoute userType="customer">
                <BookingsPage />
              </ProtectedRoute>
            } />
            <Route path="/wallet" element={
              <ProtectedRoute userType="customer">
                <WalletPage />
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute userType="customer">
                <NotificationsPage />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute userType="customer">
                <ProfilePage />
              </ProtectedRoute>
            } />
            
            {/* Barber Auth Routes - Public */}
            <Route path="/barber/login" element={<BarberLogin />} />
            <Route path="/barber/signup" element={<BarberSignup />} />
            
            {/* Barber Dashboard Routes - Protected */}
            <Route path="/barber/dashboard" element={
              <ProtectedRoute userType="barber">
                <BarberDashboard />
              </ProtectedRoute>
            } />
            <Route path="/barber/appointments" element={
              <ProtectedRoute userType="barber">
                <BarberAppointments />
              </ProtectedRoute>
            } />
            <Route path="/barber/customers" element={
              <ProtectedRoute userType="barber">
                <BarberCustomers />
              </ProtectedRoute>
            } />
            <Route path="/barber/payments" element={
              <ProtectedRoute userType="barber">
                <BarberPayments />
              </ProtectedRoute>
            } />
            <Route path="/barber/settings" element={
              <ProtectedRoute userType="barber">
                <BarberSettings />
              </ProtectedRoute>
            } />
          
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
