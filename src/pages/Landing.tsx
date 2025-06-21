import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Scissors, MapPin, Star, Users, Clock, Shield, ArrowRight, ChevronRight, Sparkles } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: MapPin,
      title: 'Find Nearby Barbers',
      description: 'Discover skilled barbers in your area with real-time availability'
    },
    {
      icon: Clock,
      title: 'Book Instantly',
      description: 'Schedule appointments in seconds with our smart booking system'
    },
    {
      icon: Star,
      title: 'Quality Assured',
      description: 'All barbers are verified with ratings and reviews from real customers'
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Safe and secure payment processing with multiple payment options'
    }
  ];

  const testimonials = [
    {
      name: 'Adebayo Johnson',
      location: 'Lagos',
      rating: 5,
      comment: 'Best barber booking app in Nigeria! Found my regular barber here.',
      image: 'photo-1472099645785-5658abf4ff4e'
    },
    {
      name: 'Emeka Okafor',
      location: 'Abuja',
      rating: 5,
      comment: 'As a barber, this app has doubled my customer base. Amazing!',
      image: 'photo-1507003211169-0a1dd7228f2d'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
              <Scissors className="text-white" size={22} />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">Barberzon</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/login')}
              className="hover:bg-green-50 hover:text-green-700 transition-all duration-200"
            >
              Sign In
            </Button>
            <Button 
              onClick={() => navigate('/signup')}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              Get Started
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
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 animate-fade-in">
              Why Choose Barberzon?
            </h2>
            <p className="text-xl text-gray-600 animate-fade-in">
              The smartest way to book barber appointments in Nigeria
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="text-green-600" size={28} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-green-600 to-green-700">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-fade-in">
            <Sparkles className="mx-auto text-green-200 mb-6" size={48} />
            <h2 className="text-4xl font-bold text-white mb-4">
              Hear from our satisfied customers
            </h2>
            <div className="grid grid-cols-2 gap-8">
              {testimonials.map((testimonial, index) => (
                <div 
                  key={index}
                  className="animate-fade-in hover:transform hover:scale-110 transition-all duration-300"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="flex items-center space-x-4">
                    <img src={testimonial.image} alt={testimonial.name} className="w-16 h-16 rounded-full" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{testimonial.name}</h3>
                      <p className="text-gray-600">{testimonial.location}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-gray-600">{testimonial.comment}</p>
                    <div className="mt-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-green-100 rounded-full" />
                        <span className="text-green-600">{testimonial.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA for Barbers */}
      <section className="py-20 px-4 bg-gradient-to-r from-green-600 to-green-700">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-fade-in">
            <Sparkles className="mx-auto text-green-200 mb-6" size={48} />
            <h2 className="text-4xl font-bold text-white mb-4">
              Are You a Barber?
            </h2>
            <p className="text-xl text-green-100 mb-8">
              Join thousands of barbers earning more with Barberzon
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Button 
                onClick={() => navigate('/barber/signup')}
                className="bg-white text-green-700 hover:bg-gray-100 px-8 py-3 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Join as a Barber
                <ChevronRight size={20} className="ml-2" />
              </Button>
            </div>
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
