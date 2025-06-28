import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Clock, User, MapPin, Star, Phone, Calendar as CalendarIcon, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { bookingService } from '@/services';

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  barber: {
    id: string;
    name: string;
    profileImage?: string;
    specialties?: string[];
    rating?: number;
    seatNumber: number;
  };
  shop: {
    id: string;
    name: string;
    address: string;
    services?: any[];
  };
  onBookingComplete?: (booking: any) => void;
}

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
];

const services = [
  { id: 'haircut', name: 'Haircut', price: 3000, duration: 45 },
  { id: 'beard-trim', name: 'Beard Trim', price: 1500, duration: 20 },
  { id: 'hair-wash', name: 'Hair Wash', price: 1000, duration: 15 },
  { id: 'styling', name: 'Hair Styling', price: 2000, duration: 30 },
  { id: 'hot-towel', name: 'Hot Towel Treatment', price: 1500, duration: 15 },
  { id: 'facial', name: 'Basic Facial', price: 3500, duration: 60 }
];

const BookingModal: React.FC<BookingModalProps> = ({ open, onOpenChange, barber, shop, onBookingComplete }) => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedServices, setSelectedServices] = useState<string[]>(['haircut']);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setSelectedDate(undefined);
      setSelectedTime('');
      setSelectedServices(['haircut']);
      setNotes('');
    }
  }, [open]);

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceId)) {
        // Don't allow removing the last service
        if (prev.length === 1) return prev;
        return prev.filter(id => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  };

  const calculateTotal = () => {
    return selectedServices.reduce((total, serviceId) => {
      const service = services.find(s => s.id === serviceId);
      return total + (service?.price || 0);
    }, 0);
  };

  const calculateDuration = () => {
    return selectedServices.reduce((total, serviceId) => {
      const service = services.find(s => s.id === serviceId);
      return total + (service?.duration || 0);
    }, 0);
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: 'Missing Information',
        description: 'Please select both date and time for your appointment.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const bookingData = {
        barberId: barber.id,
        shopId: shop.id,
        bookingDate: selectedDate.toISOString().split('T')[0],
        bookingTime: selectedTime,
        services: selectedServices.map(serviceId => {
          const service = services.find(s => s.id === serviceId);
          return {
            id: serviceId,
            name: service?.name || '',
            price: service?.price || 0,
            duration: service?.duration || 0
          };
        }),
        notes
      };

      const response = await bookingService.createBooking(bookingData);
      
      if (response.status === 'success') {
        toast({
          title: 'Booking Confirmed!',
          description: `Your appointment with ${barber.name} has been booked for ${selectedDate.toLocaleDateString()} at ${selectedTime}.`,
        });
        onBookingComplete?.(response.data);
        onOpenChange(false);
      } else {
        throw new Error(response.message || 'Failed to create booking');
      }
    } catch (error: any) {
      toast({
        title: 'Booking Failed',
        description: error.message || 'Failed to book appointment. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Disable past dates
  const disabledDays = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Book Appointment</span>
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              <X size={20} />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Barber Info */}
          <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
            <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden">
              {barber.profileImage ? (
                <img 
                  src={barber.profileImage}
                  alt={barber.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                  <User size={24} className="text-gray-600" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{barber.name}</h3>
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <MapPin size={14} className="mr-1" />
                {shop.name} - Seat {barber.seatNumber}
              </div>
              {barber.rating && (
                <div className="flex items-center text-sm text-gray-600">
                  <Star size={14} className="mr-1 text-yellow-500" />
                  {barber.rating}/5.0 rating
                </div>
              )}
              {barber.specialties && barber.specialties.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {barber.specialties.map((specialty) => (
                    <Badge key={specialty} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Services Selection */}
          <div>
            <h4 className="font-semibold mb-3">Select Services</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {services.map((service) => (
                <div
                  key={service.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedServices.includes(service.id)
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleServiceToggle(service.id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{service.name}</div>
                      <div className="text-sm text-gray-600">{service.duration} min</div>
                    </div>
                    <div className="text-green-600 font-semibold">₦{service.price.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Date Selection */}
          <div>
            <h4 className="font-semibold mb-3">Select Date</h4>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={disabledDays}
              className="rounded-md border"
            />
          </div>

          {/* Time Selection */}
          <div>
            <h4 className="font-semibold mb-3">Select Time</h4>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  className={`p-2 border rounded-lg text-sm transition-all ${
                    selectedTime === time
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <h4 className="font-semibold mb-3">Additional Notes (Optional)</h4>
            <Textarea
              placeholder="Any specific requests or preferences..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          {/* Booking Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-3">Booking Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{selectedDate ? selectedDate.toLocaleDateString() : 'Not selected'}</span>
              </div>
              <div className="flex justify-between">
                <span>Time:</span>
                <span>{selectedTime || 'Not selected'}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span>{calculateDuration()} minutes</span>
              </div>
              <div className="flex justify-between">
                <span>Services:</span>
                <span>{selectedServices.length} service(s)</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span className="text-green-600">₦{calculateTotal().toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleBooking} 
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={!selectedDate || !selectedTime || isLoading}
            >
              {isLoading ? 'Booking...' : `Book for ₦${calculateTotal().toLocaleString()}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
