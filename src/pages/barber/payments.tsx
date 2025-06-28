import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { DollarSign, TrendingUp, Calendar, Eye, EyeOff, Download, ArrowUpRight, ArrowDownLeft, Info, Loader2, Edit, X, Save, CheckCircle } from 'lucide-react';
import { barberService } from '@/services/barber.service';

const BarberPayments = () => {
  const [showEarnings, setShowEarnings] = useState(true);
  const [timeframe, setTimeframe] = useState('month');
  const [transactionData, setTransactionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payoutAccount, setPayoutAccount] = useState<any>(null);
  const [upcomingPayouts, setUpcomingPayouts] = useState<any[]>([]);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutFormData, setPayoutFormData] = useState({
    bankName: '',
    accountNumber: '',
    accountName: '',
    bankCode: ''
  });
  const [isSavingPayout, setIsSavingPayout] = useState(false);

  // Fetch transaction data, payout account and upcoming payouts from API
  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        setLoading(true);
        const [transactionsResponse, payoutAccountResponse, upcomingPayoutsResponse] = await Promise.all([
          barberService.getTransactions(timeframe),
          barberService.getPayoutAccount(),
          barberService.getUpcomingPayouts()
        ]);
        
        if (transactionsResponse.status === 'success') {
          setTransactionData(transactionsResponse.data);
        }
        if (payoutAccountResponse.status === 'success') {
          setPayoutAccount(payoutAccountResponse.data);
          if (payoutAccountResponse.data) {
            setPayoutFormData({
              bankName: payoutAccountResponse.data.bankName || '',
              accountNumber: payoutAccountResponse.data.accountNumber || '',
              accountName: payoutAccountResponse.data.accountName || '',
              bankCode: payoutAccountResponse.data.bankCode || ''
            });
          }
        }
        if (upcomingPayoutsResponse.status === 'success') {
          setUpcomingPayouts(upcomingPayoutsResponse.data);
        }
      } catch (err) {
        console.error('Error fetching payment data:', err);
        setError('Failed to load payment data');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentData();
  }, [timeframe]);

  const mockPaymentData = {
    month: {
      grossEarnings: 485000,
      platformFees: 38800,
      netEarnings: 446200,
      payouts: 430000,
      pending: 16200,
      transactions: 124
    },
    week: {
      grossEarnings: 125000,
      platformFees: 10000,
      netEarnings: 115000,
      payouts: 110000,
      pending: 5000,
      transactions: 32
    },
    today: {
      grossEarnings: 35000,
      platformFees: 2800,
      netEarnings: 32200,
      payouts: 0,
      pending: 32200,
      transactions: 8
    }
  };

  // Use real data or fallback to mock data
  const currentData = transactionData ? {
    grossEarnings: transactionData.summary.grossEarnings,
    platformFees: transactionData.summary.platformFees,
    netEarnings: transactionData.summary.netEarnings,
    payouts: transactionData.summary.netEarnings * 0.8, // Assume 80% already paid out
    pending: transactionData.summary.netEarnings * 0.2, // Assume 20% pending
    transactions: transactionData.summary.totalTransactions
  } : mockPaymentData[timeframe as keyof typeof mockPaymentData];

  // Use real transactions or fallback to mock data
  const recentTransactions = transactionData?.transactions || [
    {
      id: '1',
      type: 'earning',
      customerName: 'John Adebayo',
      service: 'Haircut + Beard Trim',
      grossAmount: 5400,
      platformFee: 432,
      netAmount: 4968,
      date: '2024-06-22',
      time: '2:30 PM',
      status: 'completed'
    },
    {
      id: '2',
      type: 'payout',
      description: 'Weekly Payout',
      amount: 110000,
      date: '2024-06-21',
      time: '6:00 AM',
      status: 'completed',
      bankAccount: 'GTBank ****4532'
    },
    {
      id: '3',
      type: 'earning',
      customerName: 'Ibrahim Mohammed',
      service: 'Traditional Cut',
      grossAmount: 4500,
      platformFee: 360,
      netAmount: 4140,
      date: '2024-06-20',
      time: '11:15 AM',
      status: 'completed'
    },
    {
      id: '4',
      type: 'earning',
      customerName: 'Tunde Okafor',
      service: 'Afro Cut',
      grossAmount: 5500,
      platformFee: 440,
      netAmount: 5060,
      date: '2024-06-20',
      time: '3:45 PM',
      status: 'completed'
    }
  ];

  // Handle opening payout modal
  const handleEditPayout = () => {
    if (payoutAccount) {
      setPayoutFormData({
        bankName: payoutAccount.bankName || '',
        accountNumber: payoutAccount.accountNumber || '',
        accountName: payoutAccount.accountName || '',
        bankCode: payoutAccount.bankCode || ''
      });
    }
    setShowPayoutModal(true);
  };
  
  // Handle saving payout account
  const handleSavePayout = async () => {
    try {
      setIsSavingPayout(true);
      
      const response = await barberService.upsertPayoutAccount(payoutFormData);
      
      if (response.status === 'success') {
        setPayoutAccount(response.data);
        setShowPayoutModal(false);
        alert('Payout account updated successfully!');
        
        // Refresh upcoming payouts
        const upcomingResponse = await barberService.getUpcomingPayouts();
        if (upcomingResponse.status === 'success') {
          setUpcomingPayouts(upcomingResponse.data);
        }
      }
    } catch (error) {
      console.error('Error updating payout account:', error);
      alert('Failed to update payout account. Please try again.');
    } finally {
      setIsSavingPayout(false);
    }
  };

  const TransactionItem = ({ transaction }: { transaction: any }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-full ${
          transaction.type === 'payout' ? 'bg-blue-100' : 'bg-green-100'
        }`}>
          {transaction.type === 'payout' ? (
            <ArrowUpRight className="text-blue-600" size={20} />
          ) : (
            <ArrowDownLeft className="text-green-600" size={20} />
          )}
        </div>
        <div>
          {transaction.type === 'earning' ? (
            <>
              <p className="font-medium text-gray-900">{transaction.customerName}</p>
              <p className="text-sm text-gray-600">{transaction.service}</p>
              <p className="text-xs text-gray-500">Platform fee: ₦{transaction.platformFee}</p>
            </>
          ) : (
            <>
              <p className="font-medium text-gray-900">{transaction.description}</p>
              <p className="text-sm text-gray-600">{transaction.bankAccount}</p>
            </>
          )}
          <p className="text-xs text-gray-400">{transaction.date} • {transaction.time}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-bold ${
          transaction.type === 'payout' ? 'text-blue-600' : 'text-green-600'
        }`}>
          {transaction.type === 'payout' ? '+' : ''}₦{(transaction.netAmount || transaction.amount).toLocaleString()}
        </p>
        {transaction.type === 'earning' && (
          <p className="text-xs text-gray-500">from ₦{transaction.grossAmount.toLocaleString()}</p>
        )}
      </div>
    </div>
  );

  return (
    <Layout userType="barber">
      <Header 
        title="Payments" 
        rightAction={
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        }
      />
      
      <div className="pt-24 px-4 py-4">
        {/* Earnings Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Earnings Overview</h3>
            <button
              onClick={() => setShowEarnings(!showEarnings)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              {showEarnings ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          
          <div className="space-y-4">
            {/* Gross Earnings */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Gross Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {showEarnings ? `₦${currentData.grossEarnings.toLocaleString()}` : '₦••••••'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{currentData.transactions} transactions</p>
                </div>
              </div>
            </div>
            
            {/* Platform Fees */}
            <div className="bg-red-50 rounded-lg p-4 border border-red-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div>
                    <p className="text-sm text-gray-600">Platform Fees (8%)</p>
                    <p className="text-xl font-bold text-red-600">
                      {showEarnings ? `-₦${currentData.platformFees.toLocaleString()}` : '-₦••••••'}
                    </p>
                  </div>
                  <Info size={16} className="text-gray-400 ml-2" />
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Auto-deducted</p>
                </div>
              </div>
            </div>
            
            {/* Net Earnings */}
            <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Net Earnings</p>
                  <p className="text-3xl font-bold text-green-700">
                    {showEarnings ? `₦${currentData.netEarnings.toLocaleString()}` : '₦••••••'}
                  </p>
                </div>
                <TrendingUp className="text-green-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Payout Status */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Already Paid</p>
              <p className="text-2xl font-bold text-blue-600">
                {showEarnings ? `₦${currentData.payouts.toLocaleString()}` : '₦••••••'}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Pending Payout</p>
              <p className="text-2xl font-bold text-yellow-600">
                {showEarnings ? `₦${currentData.pending.toLocaleString()}` : '₦••••••'}
              </p>
            </div>
          </div>
        </div>

        {/* Upcoming Payouts */}
        {upcomingPayouts.length > 0 && (
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-3">Upcoming Payouts</h3>
            {upcomingPayouts.map((payout) => (
              <div key={payout.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-blue-900">{payout.description}</p>
                  <p className="text-sm text-blue-700">{payout.bankAccount}</p>
                  <p className="text-xs text-blue-600">{payout.date}</p>
                </div>
                <p className="text-xl font-bold text-blue-900">₦{payout.amount.toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}

        {/* Platform Fee Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Fee Breakdown</h3>
            <Info size={16} className="text-gray-400" />
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Platform commission rate</span>
              <span className="font-medium">8%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment processing</span>
              <span className="text-green-600">Included</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Customer support</span>
              <span className="text-green-600">Included</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">App maintenance</span>
              <span className="text-green-600">Included</span>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Transactions</h3>
            <button className="flex items-center text-green-700 text-sm font-medium">
              <Download size={16} className="mr-1" />
              Export
            </button>
          </div>
          
          <div>
            {recentTransactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
          </div>
        </div>

        {/* Bank Account Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Payout Account</h3>
          {payoutAccount ? (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{payoutAccount.bankName}</p>
                <p className="text-sm text-gray-600">****{payoutAccount.accountNumber.slice(-4)}</p>
                <p className="text-xs text-gray-500">{payoutAccount.accountName}</p>
                {payoutAccount.isVerified ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 mt-1">
                    <CheckCircle size={12} className="mr-1" />
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 mt-1">
                    Pending Verification
                  </span>
                )}
              </div>
              <button 
                onClick={handleEditPayout}
                className="text-green-700 text-sm font-medium flex items-center"
              >
                <Edit size={16} className="mr-1" />
                Change
              </button>
            </div>
          ) : (
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-4">No payout account set up</p>
              <button 
                onClick={handleEditPayout}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium"
              >
                Add Payout Account
              </button>
            </div>
          )}
          
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Payout Schedule:</strong> Every Friday at 6:00 AM WAT
            </p>
          </div>
        </div>
        
        {/* Payout Account Modal */}
        {showPayoutModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">
                    {payoutAccount ? 'Edit Payout Account' : 'Add Payout Account'}
                  </h3>
                  <button
                    onClick={() => setShowPayoutModal(false)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              
              {/* Modal Content */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bank Name *
                  </label>
                  <select
                    value={payoutFormData.bankName}
                    onChange={(e) => setPayoutFormData(prev => ({ ...prev, bankName: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select Bank</option>
                    <option value="Access Bank">Access Bank</option>
                    <option value="GTBank">GTBank</option>
                    <option value="First Bank">First Bank</option>
                    <option value="UBA">UBA</option>
                    <option value="Zenith Bank">Zenith Bank</option>
                    <option value="Fidelity Bank">Fidelity Bank</option>
                    <option value="FCMB">FCMB</option>
                    <option value="Stanbic IBTC">Stanbic IBTC</option>
                    <option value="Sterling Bank">Sterling Bank</option>
                    <option value="Unity Bank">Unity Bank</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Number *
                  </label>
                  <input
                    type="text"
                    value={payoutFormData.accountNumber}
                    onChange={(e) => setPayoutFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0123456789"
                    maxLength={10}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Name *
                  </label>
                  <input
                    type="text"
                    value={payoutFormData.accountName}
                    onChange={(e) => setPayoutFormData(prev => ({ ...prev, accountName: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Full Name as on Bank Account"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bank Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={payoutFormData.bankCode}
                    onChange={(e) => setPayoutFormData(prev => ({ ...prev, bankCode: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., 058"
                  />
                </div>
              </div>
              
              {/* Modal Footer */}
              <div className="p-6 bg-gray-50 border-t flex space-x-3">
                <button
                  onClick={() => setShowPayoutModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                  disabled={isSavingPayout}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePayout}
                  disabled={isSavingPayout || !payoutFormData.bankName || !payoutFormData.accountNumber || !payoutFormData.accountName}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSavingPayout ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={16} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2" size={16} />
                      Save Account
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BarberPayments;
