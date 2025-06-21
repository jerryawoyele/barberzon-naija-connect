
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Calendar, Wallet, Bell, User, BarChart3, Users, CreditCard, Settings } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  userType?: 'customer' | 'barber';
}

const Layout = ({ children, userType = 'customer' }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const customerNavItems = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: Calendar, label: 'Bookings', path: '/bookings' },
    { icon: Wallet, label: 'Wallet', path: '/wallet' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  const barberNavItems = [
    { icon: BarChart3, label: 'Dashboard', path: '/barber/dashboard' },
    { icon: Calendar, label: 'Appointments', path: '/barber/appointments' },
    { icon: Users, label: 'Customers', path: '/barber/customers' },
    { icon: CreditCard, label: 'Payments', path: '/barber/payments' },
    { icon: Settings, label: 'Settings', path: '/barber/settings' },
  ];

  const navItems = userType === 'customer' ? customerNavItems : barberNavItems;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pb-20">
        {children}
      </main>
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 backdrop-blur-lg bg-white/95 shadow-lg">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center px-3 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                  isActive 
                    ? 'text-green-700 bg-green-50 shadow-md' 
                    : 'text-gray-500 hover:text-green-600 hover:bg-gray-50'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
