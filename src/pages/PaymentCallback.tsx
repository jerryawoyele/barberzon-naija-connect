import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import paymentService from '@/services/payment.service';

/**
 * Transaction details interface
 */
interface TransactionDetails {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'payment' | 'refund';
  amount: number;
  reference: string;
  status: 'pending' | 'successful' | 'failed';
  paymentMethod?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Payment callback component for handling Paystack payment callbacks
 */
const PaymentCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionDetails, setTransactionDetails] = useState<TransactionDetails | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get reference from URL query parameters
        const searchParams = new URLSearchParams(location.search);
        const reference = searchParams.get('reference');

        if (!reference) {
          setError('Payment reference not found');
          setLoading(false);
          return;
        }

        // Verify payment
        const response = await paymentService.handlePaystackCallback(reference);
        
        setTransactionDetails(response.data.transaction);
        setSuccess(true);
        
        toast({
          title: 'Payment successful',
          description: 'Your payment has been processed successfully',
          variant: 'default'
        });
      } catch (error) {
        console.error('Payment verification error:', error);
        setError('Failed to verify payment. Please contact support.');
        
        toast({
          title: 'Payment verification failed',
          description: 'We could not verify your payment. Please contact support.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [location.search, toast]);

  const handleContinue = () => {
    // Redirect based on transaction type
    if (transactionDetails?.type === 'deposit') {
      navigate('/wallet');
    } else if (transactionDetails?.type === 'payment') {
      navigate('/bookings');
    } else {
      navigate('/home');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-xl">
        <div className="flex flex-col items-center text-center">
          {loading ? (
            <>
              <Loader2 className="h-16 w-16 text-green-600 animate-spin mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment</h1>
              <p className="text-gray-600">Please wait while we verify your payment...</p>
            </>
          ) : success ? (
            <>
              <CheckCircle className="h-16 w-16 text-green-600 mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful</h1>
              <p className="text-gray-600 mb-4">Your payment has been processed successfully.</p>
              
              {transactionDetails && (
                <div className="bg-gray-50 p-4 rounded-lg w-full mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">₦{transactionDetails.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Reference:</span>
                    <span className="font-medium">{transactionDetails.reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">
                      {new Date(transactionDetails.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
              
              <Button 
                onClick={handleContinue}
                className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-lg font-medium rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Continue
              </Button>
            </>
          ) : (
            <>
              <XCircle className="h-16 w-16 text-red-600 mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
              <p className="text-gray-600 mb-6">{error || 'An error occurred during payment verification.'}</p>
              
              <div className="flex flex-col space-y-3 w-full">
                <Button 
                  onClick={() => navigate('/wallet')}
                  className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-lg font-medium rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  Try Again
                </Button>
                
                <Button 
                  onClick={() => navigate('/home')}
                  variant="outline"
                  className="w-full h-12 text-lg font-medium rounded-xl transition-all duration-300 hover:scale-105"
                >
                  Go to Home
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PaymentCallback;
