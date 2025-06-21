
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { DollarSign, TrendingUp, Calendar, Eye, EyeOff, Download, ArrowUpRight, ArrowDownLeft, Info } from 'lucide-react';

const BarberPayments = () => {
  const [showEarnings, setShowEarnings] = useState(true);
  const [timeframe, setTimeframe] = useState('month');

  const paymentData = {
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

  const currentData = paymentData[timeframe as keyof typeof paymentData];

  const recentTransactions = [
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

  const upcomingPayouts = [
    {
      id: '1',
      amount: 32200,
      date: '2024-06-28',
      description: 'Weekly Payout',
      bankAccount: 'GTBank ****4532'
    }
  ];

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
      
      <div className="px-4 py-4">
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
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">GTBank</p>
              <p className="text-sm text-gray-600">****4532</p>
              <p className="text-xs text-gray-500">Emeka Okafor</p>
            </div>
            <button className="text-green-700 text-sm font-medium">Change</button>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Payout Schedule:</strong> Every Friday at 6:00 AM WAT
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BarberPayments;
