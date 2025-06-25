import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '@/services';
import { useToast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  userType?: 'customer' | 'barber';
}

/**
 * A wrapper component for routes that require authentication
 * Redirects to login page if user is not authenticated
 * Can also check for specific user type (customer or barber)
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, userType }) => {
  const { toast } = useToast();
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser();
  
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to access this page',
        variant: 'destructive',
      });
    } else if (userType && user?.role !== userType) {
      toast({
        title: 'Access denied',
        description: `This page is only accessible to ${userType}s`,
        variant: 'destructive',
      });
    }
  }, [isAuthenticated, userType, user?.role, toast]);

  if (!isAuthenticated) {
    // Redirect to login page with return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If userType is specified, check if user has the correct role
  if (userType) {
    if (userType === 'customer' && !authService.isCustomer()) {
      // Redirect barbers to barber login
      return <Navigate to="/barber/login" state={{ from: location }} replace />;
    }
    
    if (userType === 'barber' && !authService.isBarber()) {
      // Redirect customers to customer login
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  }

  // User is authenticated and has the correct role
  return <>{children}</>;
};

export default ProtectedRoute;
