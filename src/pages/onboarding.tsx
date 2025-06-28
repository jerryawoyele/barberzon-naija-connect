import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Onboarding from '@/components/Onboarding';
import { useToast } from '@/hooks/use-toast';

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, refetchUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Check if user has already completed onboarding
      if (user.completedOnboarding) {
        // Redirect to appropriate dashboard
        const dashboardPath = user.role === 'barber' ? '/barber/dashboard' : '/home';
        navigate(dashboardPath, { replace: true });
        return;
      }
      setIsLoading(false);
    }
  }, [user, navigate]);

  const handleOnboardingComplete = async (userType: 'customer' | 'barber', data: any) => {
    console.log('🚀 Starting onboarding completion for:', userType, 'with data:', data);
    
    try {
      // Try the API first
      let apiSuccess = false;
      try {
        console.log('🌐 Attempting API call to /api/auth/onboarding/complete...');
        const response = await fetch('/api/auth/onboarding/complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            userType,
            ...data
          })
        });

        console.log('📡 API response status:', response.status, 'content-type:', response.headers.get('content-type'));

        if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
          const result = await response.json();
          console.log('✅ API response successful:', result);
          
          // Check if we got a new token (for role changes)
          if (result.newToken) {
            console.log('🔑 Received new token for role change, updating localStorage');
            localStorage.setItem('token', result.newToken);
            
            // Update the API client with new token
            const apiClient = await import('@/services/api');
            apiClient.default.setToken(result.newToken);
          }
          
          // Update user data in localStorage
          if (result.user) {
            localStorage.setItem('user', JSON.stringify(result.user));
          }
          
          toast({
            title: "Welcome to Barberzon!",
            description: result.newToken 
              ? "Your role has been updated successfully!" 
              : "Your profile has been set up successfully."
          });

          // Refresh user data
          if (refetchUser) await refetchUser();

          // Redirect to appropriate dashboard
          const dashboardPath = userType === 'barber' ? '/barber/dashboard' : '/home';
          navigate(dashboardPath, { replace: true });
          apiSuccess = true;
        } else {
          console.log('❌ API response not valid JSON or not OK, status:', response.status);
        }
      } catch (apiError) {
        console.log('🔄 API fetch failed, will use local completion:', apiError);
      }

      // Exit if API was successful
      if (apiSuccess) {
        console.log('✅ API onboarding completed successfully, exiting');
        return;
      }

      console.log('🏠 Falling back to local onboarding completion...');

      // Fallback: Local completion for testing
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('👤 Current user before update:', currentUser);
      
      const updatedUser = {
        ...currentUser,
        role: userType.toLowerCase(), // Use lowercase to match auth service
        completedOnboarding: true,
        onboardingData: data,
        // Update fullName and phoneNumber from onboarding data
        fullName: data.fullName || currentUser.fullName,
        phoneNumber: data.phoneNumber || currentUser.phoneNumber
      };
      
      console.log('👤 Updated user after onboarding:', updatedUser);
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      console.log('💾 User data saved to localStorage');
      
      toast({
        title: "Welcome to Barberzon!",
        description: "Your profile has been set up successfully. (Local mode)"
      });

      // Update user state
      console.log('🔄 Refetching user data...');
      if (refetchUser) {
        await refetchUser();
      }

      // Redirect to appropriate dashboard
      const dashboardPath = userType === 'barber' ? '/barber/dashboard' : '/home';
      console.log('🚀 Redirecting to:', dashboardPath);
      navigate(dashboardPath, { replace: true });
      
    } catch (error) {
      console.error('💥 Error completing onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to complete setup. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Show loading state while checking user status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, redirect to login
  if (!user) {
    navigate('/login', { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Onboarding
        isOpen={true}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
};

export default OnboardingPage;
