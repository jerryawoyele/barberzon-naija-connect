import React, { useState, useEffect } from 'react';
import { User, Clock, Coffee, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Barber {
  id: string;
  name: string;
  profileImage?: string;
  status: 'available' | 'busy' | 'break' | 'offline';
  currentCustomer?: string;
  estimatedFinishTime?: string;
  seatNumber: number;
}

interface BarberShop3DProps {
  shopId: string;
  shopName: string;
  totalSeats: number;
  barbers: Barber[];
  onSeatClick?: (seatNumber: number, barber?: Barber) => void;
  isBookingMode?: boolean;
}

const BarberShop3D: React.FC<BarberShop3DProps> = ({
  shopId,
  shopName,
  totalSeats,
  barbers,
  onSeatClick,
  isBookingMode = false
}) => {
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [animationFrame, setAnimationFrame] = useState(0);

  // Animation for busy barbers (pulsing effect)
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationFrame(prev => (prev + 1) % 60);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Create seat layout (arrange seats in a realistic shop layout)
  const createSeatLayout = () => {
    const seats = [];
    const seatsPerRow = Math.ceil(Math.sqrt(totalSeats));
    
    for (let i = 1; i <= totalSeats; i++) {
      const barber = barbers.find(b => b.seatNumber === i);
      const row = Math.floor((i - 1) / seatsPerRow);
      const col = (i - 1) % seatsPerRow;
      
      seats.push({
        seatNumber: i,
        barber,
        position: { row, col },
        isOccupied: !!barber,
        status: barber?.status || 'empty'
      });
    }
    
    return seats;
  };

  const seats = createSeatLayout();

  const getSeatColor = (status: string, isSelected: boolean) => {
    const baseColors = {
      available: 'bg-green-400',
      busy: 'bg-red-400',
      break: 'bg-yellow-400',
      offline: 'bg-gray-400',
      empty: 'bg-gray-200'
    };

    const glowColors = {
      available: 'shadow-green-300',
      busy: 'shadow-red-300',
      break: 'shadow-yellow-300',
      offline: 'shadow-gray-300',
      empty: 'shadow-gray-200'
    };

    let colorClass = baseColors[status as keyof typeof baseColors] || baseColors.empty;
    let glowClass = glowColors[status as keyof typeof glowColors] || glowColors.empty;

    if (isSelected) {
      colorClass += ' ring-4 ring-blue-500';
    }

    if (status === 'busy' && animationFrame % 20 < 10) {
      colorClass = colorClass.replace('bg-red-400', 'bg-red-500');
    }

    return `${colorClass} ${glowClass} shadow-lg`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle size={16} className="text-white" />;
      case 'busy':
        return <User size={16} className="text-white" />;
      case 'break':
        return <Coffee size={16} className="text-white" />;
      case 'offline':
        return <XCircle size={16} className="text-white" />;
      default:
        return null;
    }
  };

  const handleSeatClick = (seat: any) => {
    if (isBookingMode && seat.status !== 'available') {
      return; // Can't book unavailable seats
    }
    
    setSelectedSeat(seat.seatNumber);
    
    // If in booking mode and seat is available, trigger booking
    if (isBookingMode && seat.status === 'available' && seat.barber) {
      onSeatClick?.(seat.seatNumber, seat.barber);
    } else {
      onSeatClick?.(seat.seatNumber, seat.barber);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Available';
      case 'busy': return 'Busy';
      case 'break': return 'On Break';
      case 'offline': return 'Offline';
      default: return 'Empty';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{shopName} - Live View</span>
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span>Available</span>
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <span>Busy</span>
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <span>Break</span>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* 3D Shop Layout */}
        <div className="relative bg-gradient-to-b from-amber-50 to-amber-100 rounded-xl p-8 mb-6" style={{ perspective: '1200px' }}>
          {/* Lighting effects */}
          <div className="absolute top-4 left-1/4 w-6 h-6 bg-yellow-200 rounded-full opacity-70 blur-sm"></div>
          <div className="absolute top-4 right-1/4 w-6 h-6 bg-yellow-200 rounded-full opacity-70 blur-sm"></div>
          
          {/* Shop Floor */}
          <div 
            className="relative grid gap-8 p-8 bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-lg shadow-2xl border border-gray-200"
            style={{
              gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(totalSeats))}, 1fr)`,
              transform: 'rotateX(8deg) rotateY(-3deg)',
              transformStyle: 'preserve-3d',
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
            }}
          >
            {/* Back Wall with Mirrors */}
            <div 
              className="absolute -top-8 left-0 right-0 h-12 bg-gradient-to-b from-gray-400 via-gray-200 to-gray-300 rounded-t-lg shadow-lg border-t border-gray-400"
              style={{ transform: 'translateZ(20px)' }}
            >
              {/* Wall decorations */}
              <div className="absolute top-2 left-4 w-2 h-2 bg-gray-500 rounded-full"></div>
              <div className="absolute top-2 right-4 w-2 h-2 bg-gray-500 rounded-full"></div>
              <div className="absolute top-1 left-1/2 transform -translate-x-1/2 text-xs font-bold text-gray-600">{shopName}</div>
            </div>
            
            {/* Side walls for depth */}
            <div className="absolute -left-4 top-0 bottom-0 w-4 bg-gradient-to-r from-gray-300 to-gray-200 opacity-60" style={{ transform: 'rotateY(-90deg) translateZ(2px)' }}></div>
            <div className="absolute -right-4 top-0 bottom-0 w-4 bg-gradient-to-l from-gray-300 to-gray-200 opacity-60" style={{ transform: 'rotateY(90deg) translateZ(2px)' }}></div>
            
            {/* Barber Stations */}
            {seats.map((seat) => (
              <div
                key={seat.seatNumber}
                className="relative flex flex-col items-center cursor-pointer group"
                onClick={() => handleSeatClick(seat)}
                style={{ transform: 'translateZ(20px)' }}
              >
                {/* Mirror */}
                <div className="w-16 h-20 bg-gradient-to-b from-gray-100 via-gray-200 to-gray-300 rounded-t-lg mb-2 border border-gray-400 shadow-lg relative">
                  {/* Mirror reflection effect */}
                  <div className="absolute inset-1 bg-gradient-to-br from-white/30 to-transparent rounded-t-lg"></div>
                  <div className="absolute top-2 left-2 w-2 h-2 bg-white/50 rounded-full"></div>
                </div>
                
                {/* Barber Chair - Clean Simple Design */}
                <div className="relative flex flex-col items-center" style={{ transform: 'translateZ(10px)' }}>
                  {/* Chair Back */}
                  <div className={`
                    w-12 h-14 rounded-lg cursor-pointer
                    transform hover:scale-105 transition-all duration-200
                    relative border-2 border-white shadow-md
                  `}
                  style={{ 
                    backgroundColor: seat.status === 'available' ? '#10b981' :
                                   seat.status === 'busy' ? '#ef4444' :
                                   seat.status === 'break' ? '#f59e0b' :
                                   seat.status === 'offline' ? '#6b7280' :
                                   '#9ca3af'
                  }}
                  >
                    {/* Clean highlight */}
                    <div className="absolute inset-1 rounded-md bg-white/30"></div>
                    
                    {/* Seat Number */}
                    <div className="absolute top-1 left-1 text-xs font-bold text-white bg-black/60 rounded-full w-4 h-4 flex items-center justify-center">
                      {seat.seatNumber}
                    </div>
                    
                    {/* Status Icon */}
                    <div className="absolute top-1 right-1">
                      {getStatusIcon(seat.status)}
                    </div>
                    
                    {/* Barber Avatar in headrest area */}
                    {seat.barber && (
                      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full overflow-hidden bg-white border-2 border-white/50">
                        {seat.barber.profileImage ? (
                          <img 
                            src={seat.barber.profileImage} 
                            alt={seat.barber.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                            <User size={12} className="text-gray-600" />
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Busy indicator animation */}
                    {seat.status === 'busy' && (
                      <div 
                        className="absolute inset-0 rounded-t-lg border-2 border-white/50 animate-ping"
                        style={{ animationDuration: '2s' }}
                      ></div>
                    )}
                  </div>
                  
                  {/* Chair Seat */}
                  <div className="w-14 h-8 rounded-lg border-2 border-white shadow-md"
                    style={{ 
                      backgroundColor: seat.status === 'available' ? '#10b981' :
                                     seat.status === 'busy' ? '#ef4444' :
                                     seat.status === 'break' ? '#f59e0b' :
                                     seat.status === 'offline' ? '#6b7280' :
                                     '#9ca3af'
                    }}
                  >
                    {/* Simple highlight */}
                    <div className="absolute inset-1 rounded-md bg-white/30"></div>
                  </div>
                </div>
                
                {/* Simple Chair Base */}
                <div className="w-6 h-3 bg-gray-600 rounded-full shadow-sm" style={{ transform: 'translateZ(-2px)' }}></div>
                
                {/* Barber Info */}
                {seat.barber && (
                  <div className="mt-2 text-center min-h-[3rem]">
                    <p className="text-xs font-medium text-gray-800 truncate max-w-16">
                      {seat.barber.name}
                    </p>
                    <p className={`text-xs ${
                      seat.status === 'available' ? 'text-green-600' :
                      seat.status === 'busy' ? 'text-red-600' :
                      seat.status === 'break' ? 'text-yellow-600' :
                      'text-gray-500'
                    }`}>
                      {getStatusText(seat.status)}
                    </p>
                    {seat.status === 'busy' && seat.barber.estimatedFinishTime && (
                      <p className="text-xs text-gray-500 flex items-center justify-center">
                        <Clock size={10} className="mr-1" />
                        {seat.barber.estimatedFinishTime}
                      </p>
                    )}
                  </div>
                )}
                
                {!seat.barber && (
                  <div className="mt-2 text-center min-h-[3rem]">
                    <p className="text-xs text-gray-500">Empty Seat</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Entrance/Exit */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-6">
            <div className="w-20 h-4 bg-gradient-to-t from-gray-400 to-gray-300 rounded-t-lg flex items-center justify-center">
              <span className="text-xs text-gray-700 font-semibold">ENTRANCE</span>
            </div>
          </div>
        </div>

        {/* Selected Seat Info */}
        {selectedSeat && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Seat {selectedSeat} Selected</h4>
            {(() => {
              const seat = seats.find(s => s.seatNumber === selectedSeat);
              const barber = seat?.barber;
              
              if (!barber) {
                return <p className="text-gray-600">This seat is currently empty.</p>;
              }
              
              return (
                <div className="space-y-2">
                  <p><span className="font-medium">Barber:</span> {barber.name}</p>
                  <p><span className="font-medium">Status:</span> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      barber.status === 'available' ? 'bg-green-100 text-green-800' :
                      barber.status === 'busy' ? 'bg-red-100 text-red-800' :
                      barber.status === 'break' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {getStatusText(barber.status)}
                    </span>
                  </p>
                  {barber.status === 'busy' && barber.currentCustomer && (
                    <p><span className="font-medium">Current Customer:</span> {barber.currentCustomer}</p>
                  )}
                  {barber.status === 'busy' && barber.estimatedFinishTime && (
                    <p><span className="font-medium">Estimated Finish:</span> {barber.estimatedFinishTime}</p>
                  )}
                  
                  {isBookingMode && barber.status === 'available' && (
                    <div className="pt-2">
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        Book with {barber.name}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Shop Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">
              {barbers.filter(b => b.status === 'available').length}
            </div>
            <div className="text-xs text-gray-600">Available</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-lg font-bold text-red-600">
              {barbers.filter(b => b.status === 'busy').length}
            </div>
            <div className="text-xs text-gray-600">Busy</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-lg font-bold text-yellow-600">
              {barbers.filter(b => b.status === 'break').length}
            </div>
            <div className="text-xs text-gray-600">On Break</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-600">
              {totalSeats - barbers.length}
            </div>
            <div className="text-xs text-gray-600">Empty Seats</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BarberShop3D;
