import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import apiClient from '@/services/api';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'customer' | 'barber';
  phoneNumber: string;
  profileImage?: string;
  completedOnboarding?: boolean;
  isVerified?: boolean;
}

/**
 * Custom hook to handle authentication redirects
 * Redirects authenticated users away from auth pages to their appropriate homepage
 */
export const useAuthRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      console.log('=== useAuthRedirect: Starting authentication check ===');
      
      // Check if user is authenticated
      const isAuth = authService.isAuthenticated();
      const currentUser = authService.getCurrentUser();
      const token = localStorage.getItem('token');
      
      console.log('Authentication status:', {
        isAuthenticated: isAuth,
        hasToken: !!token,
        currentUser: currentUser,
        currentPath: window.location.pathname
      });
      
      if (!isAuth) {
        console.log('User is not authenticated, staying on current page');
        return; // User is not authenticated, stay on current page
      }

      try {
        console.log('Making API call to /auth/profile...');
        // Get current user profile from API to ensure we have latest data
        const response = await apiClient.get<{
          user: User;
        }>('/auth/profile');

        console.log('API response received:', response.data);

        if (response.data.user) {
          const user = response.data.user;
          console.log('User data from API:', user);
          
          // Update local storage with latest user data
          localStorage.setItem('user', JSON.stringify(user));

          // Check onboarding status and redirect accordingly
          if (!user.completedOnboarding) {
            // User hasn't completed onboarding
            console.log('User has not completed onboarding, redirecting to onboarding page');
            navigate('/onboarding', { replace: true });
            return;
          }

          // Check if user has a role assigned
          if (!user.role) {
            // No role assigned, send to onboarding
            console.log('User has no role assigned, redirecting to onboarding page');
            navigate('/onboarding', { replace: true });
            return;
          }

          // User is authenticated and has completed onboarding, redirect to appropriate homepage
          if (user.role === 'customer') {
            console.log('Authenticated customer, redirecting to customer homepage');
            navigate('/home', { replace: true });
          } else if (user.role === 'barber') {
            console.log('Authenticated barber, redirecting to barber dashboard');
            navigate('/barber/dashboard', { replace: true });
          }
        }
      } catch (error) {
        console.error('Error checking user profile for redirect:', error);
        console.log('Using fallback to local storage data...');
        // If API call fails, use local storage data as fallback
        const localUser = authService.getCurrentUser();
        console.log('Local user data:', localUser);
        
        if (localUser) {
          // Check onboarding status from local storage
          if (!localUser.completedOnboarding) {
            navigate('/onboarding', { replace: true });
            return;
          }

          // Check role from local storage
          if (!localUser.role) {
            navigate('/onboarding', { replace: true });
            return;
          }

          // Redirect based on role
          if (localUser.role === 'customer') {
            navigate('/home', { replace: true });
          } else if (localUser.role === 'barber') {
            navigate('/barber/dashboard', { replace: true });
          }
        }
      }
    };

    checkAuthAndRedirect();
  }, [navigate]);
};

/**
 * Get the appropriate redirect path for a user
 */
export const getRedirectPath = (user: User | null): string => {
  if (!user) {
    return '/login';
  }

  // Check onboarding status
  if (!user.completedOnboarding || !user.role) {
    return '/onboarding';
  }

  // Return appropriate homepage based on role
  if (user.role === 'customer') {
    return '/home';
  } else if (user.role === 'barber') {
    return '/barber/dashboard';
  }

  // Fallback
  return '/onboarding';
};

/**
 * Hook to get the current user's appropriate homepage path
 */
export const useUserHomePath = (): string => {
  const user = authService.getCurrentUser();
  return getRedirectPath(user);
};

export default useAuthRedirect;
