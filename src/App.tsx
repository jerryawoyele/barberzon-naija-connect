
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Index from "./pages/Index";
import BookingsPage from "./pages/bookings";
import WalletPage from "./pages/wallet";
import NotificationsPage from "./pages/notifications";
import ProfilePage from "./pages/profile";
import BarberDashboard from "./pages/barber/dashboard";
import BarberAppointments from "./pages/barber/appointments";
import BarberCustomers from "./pages/barber/customers";
import BarberPayments from "./pages/barber/payments";
import BarberSettings from "./pages/barber/settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Landing Page as Index */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Customer Routes */}
          <Route path="/home" element={<Index />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          
          {/* Barber Routes */}
          <Route path="/barber/dashboard" element={<BarberDashboard />} />
          <Route path="/barber/appointments" element={<BarberAppointments />} />
          <Route path="/barber/customers" element={<BarberCustomers />} />
          <Route path="/barber/payments" element={<BarberPayments />} />
          <Route path="/barber/settings" element={<BarberSettings />} />
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
