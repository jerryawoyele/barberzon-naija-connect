
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Scissors, Star, Clock, Shield } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Scissors,
      title: 'Expert Barbers',
      description: 'Connect with skilled barbers in Lagos, Abuja, and Port Harcourt'
    },
    {
      icon: Clock,
      title: 'Real-time Booking',
      description: 'Book instantly with live availability and get confirmed appointments'
    },
    {
      icon: Star,
      title: 'Quality Assured',
      description: 'Rated barbers with verified reviews from real customers'
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Safe Naira payments with transparent pricing - no hidden fees'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="px-4 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-700 rounded-lg flex items-center justify-center">
            <Scissors className="text-white" size={20} />
          </div>
          <span className="text-xl font-bold text-green-700">Barberzon</span>
        </div>
        <div className="space-x-3">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/login')}
            className="text-green-700"
          >
            Login
          </Button>
          <Button 
            onClick={() => navigate('/signup')}
            className="bg-green-700 hover:bg-green-800"
          >
            Sign Up
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 py-12 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Book Your Perfect
            <span className="text-green-700 block">Barber in Nigeria</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Nigeria's premier barber booking platform. Connect with skilled barbers, 
            book appointments instantly, and enjoy transparent Naira pricing.
          </p>
          <div className="space-y-4 md:space-y-0 md:space-x-4 md:flex justify-center">
            <Button 
              size="lg"
              onClick={() => navigate('/signup')}
              className="bg-green-700 hover:bg-green-800 w-full md:w-auto"
            >
              Get Started - It's Free
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => navigate('/barber/signup')}
              className="border-green-700 text-green-700 hover:bg-green-50 w-full md:w-auto"
            >
              Join as a Barber
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Barberzon?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="text-green-700" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 py-16 bg-green-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-12">
            Trusted by Nigerians Nationwide
          </h2>
          <div className="grid grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold text-yellow-300 mb-2">500+</div>
              <div className="text-green-100">Expert Barbers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-yellow-300 mb-2">10K+</div>
              <div className="text-green-100">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-yellow-300 mb-2">50K+</div>
              <div className="text-green-100">Bookings Completed</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 bg-gray-50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of Nigerians who trust Barberzon for their grooming needs.
          </p>
          <Button 
            size="lg"
            onClick={() => navigate('/signup')}
            className="bg-green-700 hover:bg-green-800"
          >
            Create Free Account
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 bg-gray-900 text-center">
        <p className="text-gray-400">
          © 2024 Barberzon Nigeria. Made with ❤️ for Nigerian barbers and customers.
        </p>
      </footer>
    </div>
  );
};

export default Landing;
