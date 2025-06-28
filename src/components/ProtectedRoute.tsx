import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '@/services';
import { useToast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  userType?: 'customer' | 'barber' | ('customer' | 'barber')[];
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
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  
  // Fetch user profile to check onboarding status
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isAuthenticated) {
        setIsLoadingProfile(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsLoadingProfile(false);
          return;
        }

        console.log('🔍 ProtectedRoute: Checking user profile...');
        
        try {
          const response = await fetch('/api/auth/profile', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            console.log('✅ ProtectedRoute: Database profile loaded:', {
              role: data.user.role,
              completedOnboarding: data.user.completedOnboarding,
              id: data.user.id
            });
            setUserProfile(data.user);
            
            // Update localStorage with fresh data from database
            const updatedLocalUser = {
              ...authService.getCurrentUser(),
              ...data.user
            };
            localStorage.setItem('user', JSON.stringify(updatedLocalUser));
            
            setIsLoadingProfile(false);
            return;
          } else {
            console.log('⚠️ ProtectedRoute: API response not OK:', response.status);
          }
        } catch (apiError) {
          console.log('⚠️ ProtectedRoute: API not available, using localStorage fallback:', apiError);
        }

        // Fallback to localStorage
        const localUser = authService.getCurrentUser();
        if (localUser) {
          console.log('📱 ProtectedRoute: Using localStorage profile:', {
            role: localUser.role,
            completedOnboarding: localUser.completedOnboarding,
            id: localUser.id
          });
          setUserProfile({
            ...localUser,
            completedOnboarding: localUser.completedOnboarding ?? false
          });
        }
      } catch (error) {
        console.error('❌ ProtectedRoute: Error fetching user profile:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to access this page',
        variant: 'destructive',
      });
    }
  }, [isAuthenticated, userType, user?.role, toast]);

  if (!isAuthenticated) {
    // Redirect to login page with return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Show loading while checking user profile
  if (isLoadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check onboarding completion for protected routes
  if (userProfile && (userProfile.completedOnboarding === false || userProfile.completedOnboarding === undefined)) {
    console.log('🚫 ProtectedRoute: Onboarding incomplete, redirecting to /onboarding');
    console.log('   - completedOnboarding:', userProfile.completedOnboarding);
    console.log('   - current path:', location.pathname);
    
    // Skip onboarding check for the onboarding page itself
    if (location.pathname !== '/onboarding') {
      return <Navigate to="/onboarding" replace />;
    }
  } else if (userProfile && userProfile.completedOnboarding === true) {
    console.log('✅ ProtectedRoute: Onboarding completed, allowing access');
    console.log('   - completedOnboarding:', userProfile.completedOnboarding);
    console.log('   - current path:', location.pathname);
  }

  // If userType is specified, check if user has the correct role
  if (userType) {
    // Handle array of allowed user types
    if (Array.isArray(userType)) {
      const isAllowed = userType.some(type => {
        if (type === 'customer' && authService.isCustomer()) return true;
        if (type === 'barber' && authService.isBarber()) return true;
        return false;
      });
      
      if (!isAllowed) {
        // If user is not allowed, redirect based on their current role
        // Redirect all users to the unified login page
        return <Navigate to="/login" state={{ from: location }} replace />;
      }
    } else {
      // Handle single user type (existing logic)
      if (userType === 'customer' && !authService.isCustomer()) {
        // Redirect non-customers to unified login
        return <Navigate to="/login" state={{ from: location }} replace />;
      }
      
      if (userType === 'barber' && !authService.isBarber()) {
        // Redirect non-barbers to unified login
        return <Navigate to="/login" state={{ from: location }} replace />;
      }
    }
  }

  // User is authenticated and has the correct role
  return <>{children}</>;
};

export default ProtectedRoute;
