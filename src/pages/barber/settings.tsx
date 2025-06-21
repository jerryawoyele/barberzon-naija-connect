
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { Store, User, Clock, DollarSign, Bell, Shield, HelpCircle, LogOut, Camera, Edit, Plus, Trash2, Save } from 'lucide-react';

const BarberSettings = () => {
  const [shopInfo, setShopInfo] = useState({
    name: 'Kings Cut Barber Shop',
    address: '123 Victoria Island, Lagos',
    phone: '+234 803 123 4567',
    email: 'kingscutbarber@gmail.com',
    description: 'Premier barber shop offering traditional and modern cuts',
    image: 'photo-1585747860715-2ba37e788b70'
  });

  const [services, setServices] = useState([
    { id: '1', name: 'Haircut', price: 5000, duration: 30, active: true },
    { id: '2', name: 'Beard Trim', price: 2500, duration: 15, active: true },
    { id: '3', name: 'Traditional Cut', price: 4500, duration: 30, active: true },
    { id: '4', name: 'Afro Cut', price: 5500, duration: 40, active: true },
    { id: '5', name: 'Hot Towel', price: 1500, duration: 10, active: true },
    { id: '6', name: 'Premium Cut', price: 7500, duration: 60, active: false }
  ]);

  const [businessHours, setBusinessHours] = useState({
    monday: { open: '09:00', close: '18:00', closed: false },
    tuesday: { open: '09:00', close: '18:00', closed: false },
    wednesday: { open: '09:00', close: '18:00', closed: false },
    thursday: { open: '09:00', close: '18:00', closed: false },
    friday: { open: '09:00', close: '19:00', closed: false },
    saturday: { open: '08:00', close: '20:00', closed: false },
    sunday: { open: '10:00', close: '16:00', closed: false }
  });

  const [isEditing, setIsEditing] = useState({
    shop: false,
    services: false,
    hours: false
  });

  const calculatePlatformFee = (price: number) => Math.round(price * 0.08);
  
  const calculateNetPrice = (price: number) => price - calculatePlatformFee(price);

  const MenuSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-4">
        {title}
      </h3>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {children}
      </div>
    </div>
  );

  const ServiceItem = ({ service, onToggle, onEdit, onDelete }: any) => (
    <div className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0">
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">{service.name}</h4>
          <div className="flex items-center space-x-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={service.active}
                onChange={() => onToggle(service.id)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Customer Pays</p>
            <p className="font-semibold text-gray-900">₦{(service.price + calculatePlatformFee(service.price)).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-600">You Receive</p>
            <p className="font-semibold text-green-600">₦{service.price.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-600">Duration</p>
            <p className="font-semibold text-gray-900">{service.duration} min</p>
          </div>
        </div>
        <div className="mt-1 text-xs text-gray-500">
          Platform fee: ₦{calculatePlatformFee(service.price)} (8%)
        </div>
      </div>
      <div className="flex space-x-2 ml-4">
        <button
          onClick={() => onEdit(service.id)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
        >
          <Edit size={16} />
        </button>
        <button
          onClick={() => onDelete(service.id)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );

  const toggleService = (serviceId: string) => {
    setServices(prev => prev.map(service => 
      service.id === serviceId 
        ? { ...service, active: !service.active }
        : service
    ));
  };

  const settingsMenuItems = [
    {
      icon: Bell,
      title: 'Notification Settings',
      subtitle: 'Manage booking alerts and reminders',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Shield,
      title: 'Privacy & Security',
      subtitle: 'Account security and data settings',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: HelpCircle,
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      color: 'bg-orange-100 text-orange-600'
    },
    {
      icon: LogOut,
      title: 'Sign Out',
      subtitle: 'Sign out of your barber account',
      color: 'bg-red-100 text-red-600'
    }
  ];

  return (
    <Layout userType="barber">
      <Header title="Settings" />
      
      <div className="px-4 py-4">
        {/* Shop Profile */}
        <MenuSection title="Shop Profile">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">Shop Information</h4>
              <button
                onClick={() => setIsEditing(prev => ({ ...prev, shop: !prev.shop }))}
                className="flex items-center text-green-700 text-sm font-medium"
              >
                <Edit size={16} className="mr-1" />
                {isEditing.shop ? 'Cancel' : 'Edit'}
              </button>
            </div>
            
            <div className="flex items-start space-x-4 mb-4">
              <div className="relative">
                <img
                  src={`https://images.unsplash.com/${shopInfo.image}?w=80&h=80&fit=crop`}
                  alt={shopInfo.name}
                  className="w-20 h-20 rounded-xl object-cover"
                />
                {isEditing.shop && (
                  <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <Camera size={14} className="text-white" />
                  </button>
                )}
              </div>
              
              <div className="flex-1">
                {isEditing.shop ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={shopInfo.name}
                      onChange={(e) => setShopInfo(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                      type="text"
                      value={shopInfo.address}
                      onChange={(e) => setShopInfo(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <textarea
                      value={shopInfo.description}
                      onChange={(e) => setShopInfo(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      rows={3}
                    />
                    <button className="flex items-center text-green-700 text-sm font-medium">
                      <Save size={16} className="mr-1" />
                      Save Changes
                    </button>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{shopInfo.name}</h3>
                    <p className="text-gray-600 text-sm">{shopInfo.address}</p>
                    <p className="text-gray-600 text-sm mt-2">{shopInfo.description}</p>
                    <div className="flex space-x-4 mt-2 text-sm text-gray-500">
                      <span>{shopInfo.phone}</span>
                      <span>{shopInfo.email}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </MenuSection>

        {/* Services & Pricing */}
        <MenuSection title="Services & Pricing">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">Service Menu</h4>
              <div className="flex space-x-2">
                <button className="flex items-center text-green-700 text-sm font-medium">
                  <Plus size={16} className="mr-1" />
                  Add Service
                </button>
              </div>
            </div>
            
            {/* Platform Fee Info */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Pricing Note:</strong> All prices shown are what you receive. 
                Customers pay an additional 8% platform fee automatically.
              </p>
            </div>
            
            <div className="space-y-0 border border-gray-200 rounded-lg overflow-hidden">
              {services.map((service) => (
                <ServiceItem
                  key={service.id}
                  service={service}
                  onToggle={toggleService}
                  onEdit={(id: string) => console.log('Edit service:', id)}
                  onDelete={(id: string) => console.log('Delete service:', id)}
                />
              ))}
            </div>
          </div>
        </MenuSection>

        {/* Business Hours */}
        <MenuSection title="Business Hours">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">Operating Hours</h4>
              <button
                onClick={() => setIsEditing(prev => ({ ...prev, hours: !prev.hours }))}
                className="flex items-center text-green-700 text-sm font-medium"
              >
                <Edit size={16} className="mr-1" />
                {isEditing.hours ? 'Save' : 'Edit'}
              </button>
            </div>
            
            <div className="space-y-3">
              {Object.entries(businessHours).map(([day, hours]) => (
                <div key={day} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-gray-900 capitalize w-20">{day}</span>
                    {isEditing.hours && (
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={hours.closed}
                          onChange={(e) => setBusinessHours(prev => ({
                            ...prev,
                            [day]: { ...prev[day as keyof typeof prev], closed: e.target.checked }
                          }))}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-600">Closed</span>
                      </label>
                    )}
                  </div>
                  
                  {hours.closed ? (
                    <span className="text-gray-500 text-sm">Closed</span>
                  ) : (
                    <div className="flex items-center space-x-2">
                      {isEditing.hours ? (
                        <>
                          <input
                            type="time"
                            value={hours.open}
                            onChange={(e) => setBusinessHours(prev => ({
                              ...prev,
                              [day]: { ...prev[day as keyof typeof prev], open: e.target.value }
                            }))}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                          />
                          <span>-</span>
                          <input
                            type="time"
                            value={hours.close}
                            onChange={(e) => setBusinessHours(prev => ({
                              ...prev,
                              [day]: { ...prev[day as keyof typeof prev], close: e.target.value }
                            }))}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                          />
                        </>
                      ) : (
                        <span className="text-sm text-gray-600">
                          {hours.open} - {hours.close}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </MenuSection>

        {/* App Settings */}
        <MenuSection title="App Settings">
          {settingsMenuItems.map((item, index) => (
            <button
              key={index}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${item.color}`}>
                  <item.icon size={20} />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-600">{item.subtitle}</p>
                </div>
              </div>
            </button>
          ))}
        </MenuSection>

        {/* App Version */}
        <div className="text-center text-sm text-gray-400 mt-8 mb-4">
          <p>Barberzon Nigeria - Barber Dashboard v1.0.0</p>
        </div>
      </div>
    </Layout>
  );
};

export default BarberSettings;
