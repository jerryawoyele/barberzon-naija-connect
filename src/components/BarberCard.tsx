
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Clock } from 'lucide-react';

interface BarberCardProps {
  id: string;
  name: string;
  shopName: string;
  rating: number;
  distance: string;
  isAvailable: boolean;
  image: string;
  specialties: string[];
  price: number;
  onBook: (id: string) => void;
}

const BarberCard = ({
  id,
  name,
  shopName,
  rating,
  distance,
  isAvailable,
  image,
  specialties,
  price,
  onBook
}: BarberCardProps) => {
  const navigate = useNavigate();
  const platformFee = Math.round(price * 0.08);
  const totalPrice = price + platformFee;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
      <div className="flex items-start space-x-3">
        <div className="relative">
          <img
            src={`https://images.unsplash.com/${image}?w=60&h=60&fit=crop&crop=face`}
            alt={name}
            className="w-14 h-14 rounded-full object-cover"
          />
          <div
            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
              isAvailable ? 'bg-green-500' : 'bg-gray-400'
            }`}
          />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">{name}</h3>
              <p className="text-gray-600 text-sm">{shopName}</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-green-700">₦{totalPrice.toLocaleString()}</div>
              <div className="text-xs text-gray-500">inc. ₦{platformFee} fee</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
            <div className="flex items-center">
              <Star size={14} className="text-yellow-500 mr-1" />
              <span>{rating}</span>
            </div>
            <div className="flex items-center">
              <MapPin size={14} className="mr-1" />
              <span>{distance}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1 mt-2">
            {specialties.slice(0, 2).map((specialty) => (
              <span
                key={specialty}
                className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full"
              >
                {specialty}
              </span>
            ))}
          </div>
          
          <div className="flex space-x-2 mt-3">
            <button
              onClick={() => navigate(`/barber/profile/${id}`)}
              className="flex-1 py-2 px-4 rounded-lg font-medium text-sm border border-green-600 text-green-600 hover:bg-green-50 transition-colors"
            >
              View Profile
            </button>
            <button
              onClick={() => onBook(id)}
              disabled={!isAvailable}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                isAvailable
                  ? 'bg-green-700 text-white hover:bg-green-800'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isAvailable ? 'Book Now' : 'Unavailable'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarberCard;
