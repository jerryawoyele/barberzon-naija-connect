
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

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  useAuthRedirect();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumber: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await authService.login(formData);
      
      if (response.status === 'success') {
        toast({
          title: 'Login successful',
          description: 'Welcome back to Barberzon!',
          variant: 'default'
        });
        
        // Check if user has completed onboarding
        const user = authService.getCurrentUser();
        if (!user.completedOnboarding) {
          navigate('/onboarding');
        } else {
          // Redirect based on user role
          if (user.role === 'customer') {
            navigate('/home');
          } else if (user.role === 'barber') {
            navigate('/barber/dashboard');
          } else {
            navigate('/');
          }
        }
      } else {
        toast({
          title: 'Login failed',
          description: response.message || 'Please check your credentials and try again',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login failed',
        description: 'An error occurred during login. Please try again.',
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
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Welcome Back</h1>
            <p className="text-gray-600 text-lg">Sign in to your Barberzon account</p>
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

              <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-gray-700 font-medium">Phone Number or Email</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="text"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number or email"
                  className="h-12 rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500 transition-all duration-200"
                  required
                />
                <p className="text-xs text-gray-500">You can use either your registered phone number or email address</p>
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
                    placeholder="Enter your password"
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

              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500 transition-colors" />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <button type="button" className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors">
                  Forgot password?
                </button>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-lg font-medium rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
              
            </form>
          </div>

          <div className="mt-8 text-center space-y-4">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/signup')}
                className="text-green-600 hover:text-green-700 font-medium transition-colors"
              >
                Sign up here
              </button>
            </p>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
