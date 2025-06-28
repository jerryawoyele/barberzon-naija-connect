import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services';
import { FcGoogle } from 'react-icons/fc';

interface GoogleAuthButtonProps {
  userType: 'customer' | 'barber';
  onSuccess?: (user: any) => void;
  className?: string;
}

const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({ 
  userType, 
  onSuccess,
  className = ''
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Google OAuth client ID
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  // Redirect URI
  const redirectUri = window.location.origin + '/auth/google/callback';

  // Function to handle Google login
  const handleGoogleLogin = () => {
    setIsLoading(true);

    // Create OAuth URL
    const scope = 'email profile';
    const responseType = 'code';
    const accessType = 'offline';
    const prompt = 'consent';

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${encodeURIComponent(scope)}&access_type=${accessType}&prompt=${prompt}&state=${userType}`;

    // Open popup window for Google auth
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      authUrl,
      'googleAuth',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    // Poll for redirect and extract code
    const pollTimer = window.setInterval(() => {
      try {
        if (!popup || popup.closed) {
          window.clearInterval(pollTimer);
          setIsLoading(false);
          return;
        }

        const currentUrl = popup.location.href;
        if (currentUrl.includes(redirectUri)) {
          window.clearInterval(pollTimer);
          popup.close();

          // Extract code from URL
          const url = new URL(currentUrl);
          const code = url.searchParams.get('code');
          const state = url.searchParams.get('state');
          
          if (code) {
            // Call backend to exchange code for tokens
            handleGoogleCallback(code, state as 'customer' | 'barber');
          } else {
            setIsLoading(false);
            toast({
              title: 'Authentication failed',
              description: 'Failed to get authorization code from Google',
              variant: 'destructive'
            });
          }
        }
      } catch (error) {
        // Ignore cross-origin errors while polling
        if (!(error instanceof DOMException && error.name === 'SecurityError')) {
          console.error('Google auth polling error:', error);
          window.clearInterval(pollTimer);
          setIsLoading(false);
        }
      }
    }, 500);
  };

  // Function to handle Google callback
  const handleGoogleCallback = async (code: string, state: 'customer' | 'barber') => {
    try {
      const response = await authService.googleAuth(code, state || userType);
      
      if (response.status === 'success') {
        toast({
          title: 'Authentication successful',
          description: response.message,
          variant: 'default'
        });
        
        if (onSuccess && response.data) {
          onSuccess(response.data.user);
        }
      } else {
        toast({
          title: 'Authentication failed',
          description: response.message || 'Failed to authenticate with Google',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Google auth error:', error);
      toast({
        title: 'Authentication failed',
        description: 'An error occurred during Google authentication',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className={`w-full h-12 rounded-xl border-gray-300 hover:bg-gray-50 flex items-center justify-center space-x-2 ${className}`}
      onClick={handleGoogleLogin}
      disabled={isLoading}
    >
      {isLoading ? (
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-green-600" />
      ) : (
        <>
          <FcGoogle className="h-5 w-5" />
          <span>Continue with Google</span>
        </>
      )}
    </Button>
  );
};

export default GoogleAuthButton;
