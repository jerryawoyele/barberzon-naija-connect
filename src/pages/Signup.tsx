
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Scissors, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { authService } from '@/services';
import { useToast } from '@/hooks/use-toast';
import GoogleAuthButton from '@/components/GoogleAuthButton';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';

const Signup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  useAuthRedirect();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Password mismatch',
        description: 'Passwords do not match. Please try again.',
        variant: 'destructive'
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Remove confirmPassword from the data sent to the API
      const { confirmPassword, ...registerData } = formData;
      
      // Request email verification instead of direct registration
      const response = await authService.requestEmailVerification(formData.email);
      
      if (response.status === 'success') {
        toast({
          title: 'Verification email sent',
          description: 'Please check your inbox to complete registration',
          variant: 'default'
        });
        
        // Store registration data in localStorage for later use
        localStorage.setItem('pendingRegistration', JSON.stringify(registerData));
        
        // Navigate to verification pending page
        navigate('/verification-pending', { state: { email: formData.email } });
      } else {
        toast({
          title: 'Registration failed',
          description: response.message || 'Please check your information and try again',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration failed',
        description: 'An error occurred during registration. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex flex-col">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg px-4 py-6 flex items-center shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="mr-3 p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105"
        >
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
            <Scissors className="text-white" size={22} />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">Barberzon</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 pt-32">
        <div className="w-full max-w-md animate-fade-in">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">Create Account</h1>
              <p className="text-gray-600 text-lg">Join thousands of happy customers and barbers</p>
            </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
<GoogleAuthButton 
                userType="customer" 
                onSuccess={(user) => {
                  if (!user.completedOnboarding) {
                    navigate('/onboarding');
                  } else {
                    navigate(user.role === 'barber' ? '/barber/dashboard' : '/home');
                  }
                }}
              />

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="h-12 rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500 transition-all duration-200"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Create a strong password"
                    className="h-12 rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500 pr-12 transition-all duration-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    className="h-12 rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500 pr-12 transition-all duration-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex items-start">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500 mt-1 transition-colors" 
                  required 
                />
                <span className="ml-2 text-sm text-gray-600">
                  I agree to the{' '}
                  <button type="button" className="text-green-600 hover:text-green-700 transition-colors">
                    Terms of Service
                  </button>
                  {' '}and{' '}
                  <button type="button" className="text-green-600 hover:text-green-700 transition-colors">
                    Privacy Policy
                  </button>
                </span>
              </div>
              
              <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                <p>After signing up, we'll send a verification link to your email. You'll need to verify your email before you can log in.</p>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-lg font-medium rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
              
            </form>
          </div>

          <div className="mt-8 text-center space-y-4">
            <p className="text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-green-600 hover:text-green-700 font-medium transition-colors"
              >
                Sign in here
              </button>
            </p>
            
            <p className="text-xs text-gray-500">
              After registration, you'll complete an onboarding process to specify whether you're a customer or barber and set up your profile.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
