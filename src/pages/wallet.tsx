import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import paymentService from '@/services/payment.service';
import Layout from '@/components/Layout';

/**
 * Transaction interface
 */
interface Transaction {
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
 * Wallet page component
 */
const WalletPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [balance, setBalance] = useState<number>(0);
  const [currency, setCurrency] = useState<string>('NGN');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [fundAmount, setFundAmount] = useState<string>('');
  const [fundingWallet, setFundingWallet] = useState<boolean>(false);
  const [openFundDialog, setOpenFundDialog] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('all');

  // Fetch wallet balance and transactions
  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        setLoading(true);
        
        // Get wallet balance
        const walletResponse = await paymentService.getWalletBalance();
        if (walletResponse.status === 'success') {
          setBalance(walletResponse.data.balance);
          setCurrency(walletResponse.data.currency);
        }
        
        // Get transaction history
        const transactionsResponse = await paymentService.getTransactionHistory();
        if (transactionsResponse.status === 'success') {
          setTransactions(transactionsResponse.data.transactions);
        }
      } catch (error) {
        console.error('Error fetching wallet data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load wallet data. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchWalletData();
  }, [toast]);

  // Handle fund wallet
  const handleFundWallet = async () => {
    try {
      // Validate amount
      const amount = parseFloat(fundAmount);
      if (isNaN(amount) || amount <= 0) {
        toast({
          title: 'Invalid amount',
          description: 'Please enter a valid amount greater than zero.',
          variant: 'destructive'
        });
        return;
      }
      
      setFundingWallet(true);
      
      // Initialize payment
      const response = await paymentService.fundWallet(amount);
      
      if (response.status === 'success') {
        // Close dialog
        setOpenFundDialog(false);
        
        // Redirect to payment page
        window.location.href = response.data.authorization_url;
      } else {
        toast({
          title: 'Payment initialization failed',
          description: response.message || 'Failed to initialize payment. Please try again.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error funding wallet:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while funding your wallet. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setFundingWallet(false);
    }
  };

  // Filter transactions based on active tab
  const filteredTransactions = transactions.filter(transaction => {
    if (activeTab === 'all') return true;
    return transaction.type === activeTab;
  });

  // Get transaction icon based on type
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowUpRight className="h-4 w-4 text-green-500" />;
      case 'withdrawal':
        return <ArrowDownLeft className="h-4 w-4 text-red-500" />;
      case 'payment':
        return <ArrowDownLeft className="h-4 w-4 text-orange-500" />;
      case 'refund':
        return <ArrowUpRight className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get transaction status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'successful':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  // Format amount with sign based on transaction type
  const formatAmount = (amount: number, type: string) => {
    if (type === 'deposit' || type === 'refund') {
      return `+${amount.toLocaleString()}`;
    } else {
      return `-${amount.toLocaleString()}`;
    }
  };

  // Get amount color based on transaction type
  const getAmountColor = (type: string) => {
    if (type === 'deposit' || type === 'refund') {
      return 'text-green-600';
    } else {
      return 'text-red-600';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <h1 className="text-3xl font-bold mb-8">Wallet</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
          </div>
        ) : (
          <>
            {/* Balance Card */}
            <Card className="mb-8 bg-gradient-to-r from-green-600 to-green-700 text-white">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wallet className="mr-2" /> My Wallet
                </CardTitle>
                <CardDescription className="text-green-100">
                  Your current balance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">
                  {currency} {balance.toLocaleString()}
                </div>
              </CardContent>
              <CardFooter>
                <Dialog open={openFundDialog} onOpenChange={setOpenFundDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-white text-green-700 hover:bg-green-50">
                      <Plus className="mr-2 h-4 w-4" /> Fund Wallet
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Fund Your Wallet</DialogTitle>
                      <DialogDescription>
                        Enter the amount you want to add to your wallet.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="amount">Amount ({currency})</Label>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="Enter amount"
                          value={fundAmount}
                          onChange={(e) => setFundAmount(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={handleFundWallet}
                        disabled={fundingWallet}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {fundingWallet ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          'Proceed to Payment'
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
            
            {/* Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>
                  View all your wallet transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" onValueChange={setActiveTab}>
                  <div className="mb-4 overflow-x-auto">
                    <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground w-max min-w-full sm:w-auto">
                      <TabsTrigger value="all" className="whitespace-nowrap">All</TabsTrigger>
                      <TabsTrigger value="deposit" className="whitespace-nowrap">Deposits</TabsTrigger>
                      <TabsTrigger value="payment" className="whitespace-nowrap">Payments</TabsTrigger>
                      <TabsTrigger value="withdrawal" className="whitespace-nowrap">Withdrawals</TabsTrigger>
                      <TabsTrigger value="refund" className="whitespace-nowrap">Refunds</TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value={activeTab}>
                    {filteredTransactions.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No transactions found
                      </div>
                    ) : (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Type</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredTransactions.map((transaction) => (
                              <TableRow key={transaction.id}>
                                <TableCell>
                                  <div className="flex items-center">
                                    {getTransactionIcon(transaction.type)}
                                    <span className="ml-2 capitalize">
                                      {transaction.type}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="max-w-[200px] truncate">
                                  {transaction.description || '-'}
                                </TableCell>
                                <TableCell>
                                  {new Date(transaction.createdAt).toLocaleString()}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    {getStatusIcon(transaction.status)}
                                    <span className="ml-2 capitalize">
                                      {transaction.status}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className={`text-right font-medium ${getAmountColor(transaction.type)}`}>
                                  {formatAmount(transaction.amount, transaction.type)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
};

export default WalletPage;
