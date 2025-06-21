
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Scissors, Star, Clock, Shield, ArrowRight, Sparkles } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Scissors,
      title: 'Expert Barbers',
      description: 'Connect with skilled barbers in Lagos, Abuja, and Port Harcourt',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: Clock,
      title: 'Real-time Booking',
      description: 'Book instantly with live availability and get confirmed appointments',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Star,
      title: 'Quality Assured',
      description: 'Rated barbers with verified reviews from real customers',
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Safe Naira payments with transparent pricing - no hidden fees',
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 overflow-x-hidden">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-100 px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-2 animate-fade-in">
            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
              <Scissors className="text-white" size={24} />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">Barberzon</span>
          </div>
          <div className="space-x-3 animate-fade-in">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/login')}
              className="text-green-700 hover:bg-green-50 transition-all duration-300 hover:scale-105"
            >
              Login
            </Button>
            <Button 
              onClick={() => navigate('/signup')}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-28 px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="animate-fade-in">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-6">
              <Sparkles size={16} className="mr-2" />
              Nigeria's #1 Barber Booking Platform
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 animate-fade-in leading-tight">
            Book Your Perfect
            <span className="bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent block mt-2">
              Barber in Nigeria
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto animate-fade-in leading-relaxed">
            Nigeria's premier barber booking platform. Connect with skilled barbers, 
            book appointments instantly, and enjoy transparent Naira pricing.
          </p>
          
          <div className="space-y-4 md:space-y-0 md:space-x-6 md:flex justify-center animate-fade-in">
            <Button 
              size="lg"
              onClick={() => navigate('/signup')}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 w-full md:w-auto text-lg px-8 py-4 transition-all duration-300 hover:scale-105 shadow-xl group"
            >
              Get Started - It's Free
              <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => navigate('/barber/signup')}
              className="border-2 border-green-600 text-green-700 hover:bg-green-50 w-full md:w-auto text-lg px-8 py-4 transition-all duration-300 hover:scale-105"
            >
              Join as a Barber
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Barberzon?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the future of barber booking with our innovative platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index} 
                  className="text-center group hover:transform hover:scale-105 transition-all duration-300 animate-fade-in p-6 rounded-2xl hover:shadow-xl hover:bg-gray-50"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`w-20 h-20 ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <Icon size={32} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 py-20 bg-gradient-to-r from-green-600 to-green-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl font-bold text-white mb-16 animate-fade-in">
            Trusted by Nigerians Nationwide
          </h2>
          <div className="grid grid-cols-3 gap-8">
            {[
              { number: '500+', label: 'Expert Barbers' },
              { number: '10K+', label: 'Happy Customers' },
              { number: '50K+', label: 'Bookings Completed' }
            ].map((stat, index) => (
              <div 
                key={index}
                className="animate-fade-in hover:transform hover:scale-110 transition-all duration-300"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="text-5xl font-bold text-yellow-300 mb-3">{stat.number}</div>
                <div className="text-green-100 text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-2xl mx-auto text-center animate-fade-in">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            Join thousands of Nigerians who trust Barberzon for their grooming needs.
          </p>
          <Button 
            size="lg"
            onClick={() => navigate('/signup')}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-lg px-12 py-4 transition-all duration-300 hover:scale-105 shadow-xl group"
          >
            Create Free Account
            <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-12 bg-gray-900 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center">
              <Scissors className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold text-white">Barberzon</span>
          </div>
          <p className="text-gray-400 mb-4">
            © 2024 Barberzon Nigeria. Made with ❤️ for Nigerian barbers and customers.
          </p>
          <div className="flex justify-center space-x-6 text-sm text-gray-500">
            <button className="hover:text-green-400 transition-colors">Privacy Policy</button>
            <button className="hover:text-green-400 transition-colors">Terms of Service</button>
            <button className="hover:text-green-400 transition-colors">Contact Us</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
