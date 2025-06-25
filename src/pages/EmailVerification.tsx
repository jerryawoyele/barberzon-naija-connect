import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Scissors, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { authService } from '@/services';
import { useToast } from '@/hooks/use-toast';

const EmailVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get token from URL
        const searchParams = new URLSearchParams(location.search);
        const token = searchParams.get('token');

        if (!token) {
          setIsVerifying(false);
          setIsSuccess(false);
          setErrorMessage('Verification token is missing');
          return;
        }

        // Get user data from localStorage
        const pendingRegistrationJson = localStorage.getItem('pendingRegistration');
        const pendingBarberRegistrationJson = localStorage.getItem('pendingBarberRegistration');
        
        let userData = null;
        
        if (pendingRegistrationJson) {
          const parsedData = JSON.parse(pendingRegistrationJson);
          userData = {
            ...parsedData,
            // Add default values for required fields if they don't exist
            fullName: parsedData.fullName || 'New Customer',
            phoneNumber: parsedData.phoneNumber || `c${Date.now().toString().slice(-10)}`
          };
        } else if (pendingBarberRegistrationJson) {
          const parsedData = JSON.parse(pendingBarberRegistrationJson);
          userData = {
            ...parsedData,
            // Add default values for required fields if they don't exist
            fullName: parsedData.fullName || 'New Barber',
            phoneNumber: parsedData.phoneNumber || `b${Date.now().toString().slice(-10)}`,
            hourlyRate: parsedData.hourlyRate || 0,
            specialties: parsedData.specialties || []
          };
        }

        // Verify email
        const response = await authService.verifyEmail(token, userData);

        if (response.status === 'success') {
          setIsSuccess(true);
          
          toast({
            title: 'Email verified successfully',
            description: 'Your account has been created. You will be redirected to the home page.',
            variant: 'default'
          });
          
          // Clear pending registration data
          localStorage.removeItem('pendingRegistration');
          localStorage.removeItem('pendingBarberRegistration');
          
          // Redirect based on user role
          setTimeout(() => {
            if (authService.isCustomer()) {
              navigate('/home');
            } else if (authService.isBarber()) {
              navigate('/barber/dashboard');
            } else {
              navigate('/');
            }
          }, 3000);
        } else {
          setIsSuccess(false);
          setErrorMessage(response.message || 'Failed to verify email');
        }
      } catch (error) {
        console.error('Email verification error:', error);
        setIsSuccess(false);
        setErrorMessage('An error occurred during email verification');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [location, navigate, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex flex-col">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg px-4 py-6 flex items-center shadow-sm">
        <div className="flex items-center space-x-2 mx-auto">
          <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
            <Scissors className="text-white" size={22} />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">Barberzon</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 pt-32">
        <div className="w-full max-w-md animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
            {isVerifying ? (
              <div className="py-10 flex flex-col items-center">
                <Loader2 size={60} className="text-green-600 animate-spin mb-6" />
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Verifying Your Email</h2>
                <p className="text-gray-600">Please wait while we verify your email address...</p>
              </div>
            ) : isSuccess ? (
              <div className="py-10 flex flex-col items-center">
                <CheckCircle size={60} className="text-green-600 mb-6" />
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Email Verified!</h2>
                <p className="text-gray-600 mb-6">Your email has been successfully verified. Your account is now active.</p>
                <p className="text-sm text-gray-500">You will be redirected to the home page in a few seconds...</p>
              </div>
            ) : (
              <div className="py-10 flex flex-col items-center">
                <XCircle size={60} className="text-red-600 mb-6" />
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Verification Failed</h2>
                <p className="text-gray-600 mb-6">{errorMessage || 'There was a problem verifying your email address.'}</p>
                <div className="space-y-3">
                  <Button 
                    onClick={() => navigate('/signup')}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                  >
                    Try Again
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/')}
                    className="w-full"
                  >
                    Go to Home Page
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
