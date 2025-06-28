import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '@/services/auth.service';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'customer' | 'barber';
  phoneNumber?: string;
  profileImage?: string;
  completedOnboarding?: boolean;
}

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: any) => Promise<void>;
  logout: () => void;
  refetchUser: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch user profile from API
  const fetchUserProfile = async (): Promise<User | null> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      try {
        const response = await fetch('/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          return data.user;
        }
      } catch (apiError) {
        console.log('API not available, falling back to localStorage');
      }

      // Fallback to localStorage
      const localUser = authService.getCurrentUser();
      if (localUser) {
        return {
          ...localUser,
          completedOnboarding: localUser.completedOnboarding ?? false
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsLoading(false);
          return;
        }

        // Try to fetch fresh user data from API
        const userData = await fetchUserProfile();
        if (userData) {
          setUser(userData);
        } else {
          // Fallback to localStorage
          const localUser = authService.getCurrentUser();
          if (localUser) {
            setUser(localUser);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Check for onboarding redirect after user is loaded
  useEffect(() => {
    if (user && !isLoading) {
      const currentPath = location.pathname;
      
      // Skip redirect if user is already on onboarding page
      if (currentPath === '/onboarding') return;
      
      // Skip redirect if user is on auth pages
      if (currentPath.startsWith('/auth') || 
          currentPath === '/login' || 
          currentPath === '/signup' ||
          currentPath === '/barber/login' ||
          currentPath === '/barber/signup' ||
          currentPath === '/verify-email' ||
          currentPath === '/verification-pending' ||
          currentPath === '/' || 
          currentPath === '/landing') return;

      // Force redirect to onboarding if not completed
      if (user.completedOnboarding === false || user.completedOnboarding === undefined) {
        console.log('User onboarding incomplete, redirecting...', user);
        navigate('/onboarding', { replace: true });
        return;
      }
    }
  }, [user, isLoading, navigate, location.pathname]);

  const login = async (credentials: any) => {
    try {
      setIsLoading(true);
      
      // Use appropriate login method based on current route
      let response;
      if (location.pathname.includes('/barber')) {
        response = await authService.loginBarber(credentials);
      } else {
        response = await authService.login(credentials);
      }

      if (response.status === 'success') {
        // Fetch fresh user data
        const userData = await fetchUserProfile();
        if (userData) {
          setUser(userData);
          
          // Check onboarding status and redirect accordingly
          if (!userData.completedOnboarding) {
            navigate('/onboarding', { replace: true });
          } else {
            const dashboardPath = userData.role === 'barber' ? '/barber/dashboard' : '/home';
            navigate(dashboardPath, { replace: true });
          }
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    authService.logout();
  };

  const refetchUser = async () => {
    try {
      const userData = await fetchUserProfile();
      if (userData) {
        setUser(userData);
        // Update localStorage as well
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        // Fallback to localStorage if API fails
        const localUser = authService.getCurrentUser();
        if (localUser) {
          setUser({
            ...localUser,
            completedOnboarding: localUser.completedOnboarding ?? false
          });
        }
      }
    } catch (error) {
      console.error('Error refetching user:', error);
      // Fallback to localStorage
      const localUser = authService.getCurrentUser();
      if (localUser) {
        setUser({
          ...localUser,
          completedOnboarding: localUser.completedOnboarding ?? false
        });
      }
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refetchUser
  };
};
