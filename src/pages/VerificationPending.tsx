import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Scissors, Mail, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services';

const VerificationPending = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Get email from state
  const email = location.state?.email || '';
  const role = location.state?.role || 'customer';
  
  const handleResendVerification = async () => {
    if (!email) {
      toast({
        title: 'Error',
        description: 'Email address is missing. Please go back and try again.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      const response = await authService.requestEmailVerification(email);
      
      if (response.status === 'success') {
        toast({
          title: 'Verification email sent',
          description: 'A new verification email has been sent to your inbox.',
          variant: 'default'
        });
      } else {
        toast({
          title: 'Failed to send email',
          description: response.message || 'An error occurred while sending the verification email.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error resending verification email:', error);
      toast({
        title: 'Error',
        description: 'Failed to resend verification email. Please try again later.',
        variant: 'destructive'
      });
    }
  };
  
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
            <div className="py-10 flex flex-col items-center">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                <Mail size={40} className="text-green-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Check Your Email</h2>
              
              <p className="text-gray-600 mb-2">
                We've sent a verification link to:
              </p>
              
              <p className="text-green-600 font-medium mb-6">
                {email || 'your email address'}
              </p>
              
              <p className="text-gray-600 mb-8">
                Please check your inbox and click on the verification link to complete your {role === 'customer' ? 'customer' : 'barber'} registration.
              </p>
              
              <div className="space-y-3 w-full">
                <Button 
                  onClick={handleResendVerification}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                >
                  Resend Verification Email
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => navigate(role === 'customer' ? '/signup' : '/barber/signup')}
                  className="w-full flex items-center justify-center"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Back to Sign Up
                </Button>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>Didn't receive an email? Check your spam folder or try resending the verification email.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationPending;
