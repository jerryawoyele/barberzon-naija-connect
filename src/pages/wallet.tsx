import React, { useState } from 'react';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, Eye, EyeOff, CreditCard, Banknote, Gift } from 'lucide-react';

const WalletPage = () => {
  const [showBalance, setShowBalance] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');

  const balance = 125750;
  
  const transactions = [
    {
      id: '1',
      type: 'debit',
      description: 'Haircut at Kings Cut Barber Shop',
      amount: 5400,
      platformFee: 400,
      date: '2024-06-22',
      time: '2:30 PM',
      status: 'completed'
    },
    {
      id: '2',
      type: 'credit',
      description: 'Wallet Top-up via GTBank',
      amount: 50000,
      platformFee: 0,
      date: '2024-06-20',
      time: '11:15 AM',
      status: 'completed'
    },
    {
      id: '3',
      type: 'debit',
      description: 'Beard Trim at Classic Cuts',
      amount: 4860,
      platformFee: 360,
      date: '2024-06-15',
      time: '4:20 PM',
      status: 'completed'
    }
  ];

  const paymentMethods = [
    {
      id: '1',
      type: 'card',
      name: 'GTBank Debit Card',
      last4: '4532',
      isDefault: true,
      icon: CreditCard
    },
    {
      id: '2',
      type: 'bank',
      name: 'First Bank Transfer',
      last4: '0123',
      isDefault: false,
      icon: Banknote
    },
    {
      id: '3',
      type: 'ussd',
      name: 'USSD Payment',
      last4: '*737#',
      isDefault: false,
      icon: Gift
    }
  ];

  const TransactionItem = ({ transaction }: { transaction: any }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-full ${
          transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
        }`}>
          {transaction.type === 'credit' ? (
            <ArrowDownLeft className="text-green-600" size={20} />
          ) : (
            <ArrowUpRight className="text-red-600" size={20} />
          )}
        </div>
        <div>
          <p className="font-medium text-gray-900">{transaction.description}</p>
          <p className="text-sm text-gray-500">{transaction.date} • {transaction.time}</p>
          {transaction.platformFee > 0 && (
            <p className="text-xs text-gray-400">Platform fee: ₦{transaction.platformFee}</p>
          )}
        </div>
      </div>
      <div className="text-right">
        <p className={`font-bold ${
          transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
        }`}>
          {transaction.type === 'credit' ? '+' : '-'}₦{transaction.amount.toLocaleString()}
        </p>
        <p className="text-xs text-gray-500">{transaction.status}</p>
      </div>
    </div>
  );

  const PaymentMethodItem = ({ method }: { method: any }) => {
    const Icon = method.icon;
    return (
      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 mb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <Icon size={20} className="text-gray-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{method.name}</p>
            <p className="text-sm text-gray-500">****{method.last4}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {method.isDefault && (
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
              Default
            </span>
          )}
          <button className="text-green-700 text-sm font-medium">Edit</button>
        </div>
      </div>
    );
  };

  return (
    <Layout userType="customer">
      <Header title="Wallet" />
      
      <div className="pt-24 px-4 py-4">
        {/* Balance Card */}
        <div className="bg-gradient-to-r from-green-700 to-green-800 rounded-xl p-6 mb-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Wallet Balance</h2>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="p-2 bg-white bg-opacity-20 rounded-lg"
            >
              {showBalance ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          
          <div className="mb-6">
            <p className="text-3xl font-bold">
              {showBalance ? `₦${balance.toLocaleString()}` : '₦••••••'}
            </p>
            <p className="text-green-100 text-sm">Available balance</p>
          </div>
          
          <div className="flex space-x-3">
            <button className="flex-1 bg-white text-green-700 py-3 px-4 rounded-lg font-medium flex items-center justify-center">
              <Plus size={20} className="mr-2" />
              Top Up
            </button>
            <button className="flex-1 bg-white bg-opacity-20 text-white py-3 px-4 rounded-lg font-medium">
              Transfer
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <CreditCard className="text-blue-600" size={24} />
            </div>
            <p className="text-sm font-medium text-gray-900">Add Card</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Banknote className="text-yellow-600" size={24} />
            </div>
            <p className="text-sm font-medium text-gray-900">Bank Transfer</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Gift className="text-purple-600" size={24} />
            </div>
            <p className="text-sm font-medium text-gray-900">USSD</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => setSelectedTab('overview')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              selectedTab === 'overview' 
                ? 'bg-white text-green-700 shadow-sm' 
                : 'text-gray-600'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setSelectedTab('transactions')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              selectedTab === 'transactions' 
                ? 'bg-white text-green-700 shadow-sm' 
                : 'text-gray-600'
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => setSelectedTab('methods')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              selectedTab === 'methods' 
                ? 'bg-white text-green-700 shadow-sm' 
                : 'text-gray-600'
            }`}
          >
            Payment Methods
          </button>
        </div>

        {/* Content */}
        {selectedTab === 'overview' && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Overview</h3>
            <p className="text-gray-500">This is the overview section.</p>
          </div>
        )}

        {selectedTab === 'transactions' && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Recent Transactions</h3>
            {transactions.length > 0 ? (
              <div>
                {transactions.map((transaction) => (
                  <TransactionItem key={transaction.id} transaction={transaction} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No transactions yet</p>
              </div>
            )}
          </div>
        )}

        {selectedTab === 'methods' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Payment Methods</h3>
              <button className="text-green-700 text-sm font-medium">Add New</button>
            </div>
            {paymentMethods.map((method) => (
              <PaymentMethodItem key={method.id} method={method} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default WalletPage;
