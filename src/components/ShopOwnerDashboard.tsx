import React, { useState, useEffect } from 'react';
import { Bell, Users, Store, CheckCircle, XCircle, Clock, Star, Phone, Mail, MapPin, Calendar } from 'lucide-react';
import { barbershopService, JoinRequest } from '@/services/barbershop.service';

interface ShopOwnerDashboardProps {
  shopId?: string;
}

const ShopOwnerDashboard: React.FC<ShopOwnerDashboardProps> = ({ shopId }) => {
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<JoinRequest | null>(null);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  
  // Simple notification system
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    // For now, using alert - can be replaced with toast library later
    alert(message);
  };

  useEffect(() => {
    fetchJoinRequests();
  }, [filter]);

  const fetchJoinRequests = async () => {
    try {
      setLoading(true);
      const response = await barbershopService.getIncomingJoinRequests(
        filter === 'all' ? undefined : filter
      );
      
      if (response.status === 'success') {
        setJoinRequests(response.data);
      }
    } catch (error) {
      console.error('Error fetching join requests:', error);
      showNotification('Failed to load join requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: string, seatNumber?: number) => {
    try {
      setProcessingRequest(requestId);
      const response = await barbershopService.respondToJoinRequest(requestId, 'approve', seatNumber);
      
      if (response.status === 'success') {
        showNotification('Barber join request approved successfully!', 'success');
        fetchJoinRequests(); // Refresh the list
        setSelectedRequest(null);
      }
    } catch (error) {
      console.error('Error approving request:', error);
      showNotification('Failed to approve join request', 'error');
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      setProcessingRequest(requestId);
      const response = await barbershopService.respondToJoinRequest(requestId, 'reject');
      
      if (response.status === 'success') {
        showNotification('Barber join request rejected', 'info');
        fetchJoinRequests(); // Refresh the list
        setSelectedRequest(null);
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      showNotification('Failed to reject join request', 'error');
    } finally {
      setProcessingRequest(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock size={12} className="mr-1" />
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle size={12} className="mr-1" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle size={12} className="mr-1" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const RequestCard = ({ request }: { request: JoinRequest }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          <img
            src={request.barber?.profileImage || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face`}
            alt={request.barber?.fullName}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{request.barber?.fullName}</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
              {request.barber?.phoneNumber && (
                <div className="flex items-center">
                  <Phone size={14} className="mr-1" />
                  {request.barber.phoneNumber}
                </div>
              )}
              {request.barber?.email && (
                <div className="flex items-center">
                  <Mail size={14} className="mr-1" />
                  {request.barber.email}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <div className="flex items-center">
                <Star size={14} className="text-yellow-500 mr-1" />
                <span className="text-sm font-medium">{request.barber?.rating || 0}</span>
                <span className="text-xs text-gray-500 ml-1">({request.barber?.totalReviews || 0} reviews)</span>
              </div>
            </div>
          </div>
        </div>
        <div className="text-right">
          {getStatusBadge(request.status)}
          <p className="text-xs text-gray-500 mt-1">
            {new Date(request.createdAt).toLocaleDateString('en-NG', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* Specialties */}
      {request.barber?.specialties && request.barber.specialties.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Specialties:</p>
          <div className="flex flex-wrap gap-2">
            {request.barber.specialties.map((specialty, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Message */}
      {request.message && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-1">Message:</p>
          <p className="text-sm text-gray-600 italic">"{request.message}"</p>
        </div>
      )}

      {/* Seat Request */}
      {request.seatNumber && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            <strong>Requested Seat:</strong> #{request.seatNumber}
          </p>
        </div>
      )}

      {/* Action Buttons for Pending Requests */}
      {request.status === 'pending' && (
        <div className="flex space-x-3">
          <button
            onClick={() => setSelectedRequest(request)}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
            disabled={processingRequest === request.id}
          >
            <CheckCircle size={16} className="inline mr-2" />
            Approve
          </button>
          <button
            onClick={() => handleRejectRequest(request.id)}
            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
            disabled={processingRequest === request.id}
          >
            <XCircle size={16} className="inline mr-2" />
            Reject
          </button>
        </div>
      )}

      {/* Status Display for Processed Requests */}
      {request.status !== 'pending' && (
        <div className="text-center py-2">
          <p className="text-sm text-gray-600">
            Request {request.status} on{' '}
            {new Date(request.updatedAt).toLocaleDateString('en-NG', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>
      )}
    </div>
  );

  // Seat Selection Modal for Approval
  const SeatSelectionModal = () => {
    const [selectedSeat, setSelectedSeat] = useState<number | undefined>(selectedRequest?.seatNumber);
    const totalSeats = selectedRequest?.shop?.totalSeats || 6;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Approve Join Request
          </h3>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              Assign <strong>{selectedRequest?.barber?.fullName}</strong> to a seat:
            </p>
            
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: totalSeats }, (_, i) => i + 1).map(seatNum => (
                <button
                  key={seatNum}
                  onClick={() => setSelectedSeat(seatNum)}
                  className={`p-3 rounded-lg border-2 text-center font-medium transition-colors ${
                    selectedSeat === seatNum
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  Seat {seatNum}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setSelectedRequest(null)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={processingRequest === selectedRequest?.id}
            >
              Cancel
            </button>
            <button
              onClick={() => handleApproveRequest(selectedRequest!.id, selectedSeat)}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              disabled={processingRequest === selectedRequest?.id}
            >
              {processingRequest === selectedRequest?.id ? 'Approving...' : 'Approve'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const filteredRequests = joinRequests;
  const pendingCount = joinRequests.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="text-yellow-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Requests</p>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {joinRequests.filter(r => r.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="text-blue-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{joinRequests.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1">
        <div className="flex space-x-1">
          {[
            { key: 'pending', label: 'Pending', count: joinRequests.filter(r => r.status === 'pending').length },
            { key: 'approved', label: 'Approved', count: joinRequests.filter(r => r.status === 'approved').length },
            { key: 'rejected', label: 'Rejected', count: joinRequests.filter(r => r.status === 'rejected').length },
            { key: 'all', label: 'All', count: joinRequests.length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Join Requests List */}
      <div>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading join requests...</p>
          </div>
        ) : filteredRequests.length > 0 ? (
          <div>
            {filteredRequests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No {filter !== 'all' ? filter : ''} join requests
            </h3>
            <p className="text-gray-600">
              {filter === 'pending' 
                ? "No pending join requests at the moment." 
                : "No join requests found for the selected filter."
              }
            </p>
          </div>
        )}
      </div>

      {/* Seat Selection Modal */}
      {selectedRequest && <SeatSelectionModal />}
    </div>
  );
};

export default ShopOwnerDashboard;
