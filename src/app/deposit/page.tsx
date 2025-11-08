'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Copy, QrCode, Check, X, Info, DollarSign, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import QRCode from 'react-qr-code';
import MobileBottomNav from '@/components/MobileBottomNav';
import DesktopSidebar from '@/components/DesktopSidebar';
import { depositFunds } from '@/lib/firebaseFunctions';

interface CryptoOption {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  address: string;
  minAmount: number;
  maxAmount: number;
  gradient: string;
  network?: string;
}

const cryptoOptions: CryptoOption[] = [
  {
    id: 'usdt',
    name: 'Tether',
    symbol: 'USDT',
    icon: '₮',
    address: 'TJxZA88VxvCyfe4JDcbXXEVYrsRWPMxWUN',
    minAmount: 10,
    maxAmount: 10000000,
    gradient: 'from-green-500 to-emerald-600',
    network: 'TRC20'
  },
  {
    id: 'btc',
    name: 'Bitcoin',
    symbol: 'BTC',
    icon: '₿',
    address: 'bc1qfej7ukyjvy5peatf8tw8xp20gvp23nuhxrt636',
    minAmount: 10,
    maxAmount: 10000000,
    gradient: 'from-orange-500 to-amber-600'
  },
  {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'ETH',
    icon: 'Ξ',
    address: '0xED1bc43b0aE3948669Bc53087256E7fD3584a1Dc',
    minAmount: 10,
    maxAmount: 10000000,
    gradient: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'bnb',
    name: 'BNB',
    symbol: 'BNB',
    icon: 'B',
    address: '0xED1bc43b0aE3948669Bc53087256E7fD3584a1Dc',
    minAmount: 10,
    maxAmount: 10000000,
    gradient: 'from-yellow-500 to-orange-600'
  }
];

export default function DepositPage() {
  const { user, updateBalance } = useAuth();
  const router = useRouter();
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoOption | null>(null);
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const handleCryptoSelect = (crypto: CryptoOption) => {
    setSelectedCrypto(crypto);
    setShowModal(true);
    setAmount('');
    setCopiedAddress(false);
  };

  const handleCopyAddress = async () => {
    if (!selectedCrypto) return;
    
    try {
      await navigator.clipboard.writeText(selectedCrypto.address);
      setCopiedAddress(true);
      toast.success('Address copied to clipboard!');
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (err) {
      toast.error('Failed to copy address');
    }
  };

  const handleDeposit = async () => {
    if (!selectedCrypto || !amount) return;

    const depositAmount = parseFloat(amount);
    
    // Validate amount
    if (isNaN(depositAmount) || depositAmount < selectedCrypto.minAmount) {
      toast.error(`Minimum deposit amount is $${selectedCrypto.minAmount.toLocaleString()}`);
      return;
    }
    
    if (depositAmount > selectedCrypto.maxAmount) {
      toast.error(`Maximum deposit amount is $${selectedCrypto.maxAmount.toLocaleString()}`);
      return;
    }

    setIsProcessing(true);

    try {
      // Check if user is authenticated
      if (!user || !user.id) {
        toast.error('Please login to make a deposit');
        return;
      }

      // Show processing message
      toast.loading('Creating deposit request...', { id: 'deposit-processing' });

      // Create deposit directly via API with user ID from AuthContext
      const response = await fetch('/api/firebase/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          amount: depositAmount,
          method: 'crypto',
          metadata: {
            currency: selectedCrypto.symbol,
            address: selectedCrypto.address,
            network: selectedCrypto.network || 'mainnet'
          }
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create deposit request');
      }

      const result = await response.json();

      // Show success message with admin approval notification
      toast.dismiss('deposit-processing');
      toast.success(
        'Deposit request submitted successfully! 🎉\n\nYour deposit is now pending admin approval. You will be notified once it\'s processed.',
        {
          duration: 8000,
          icon: '⏳',
          style: {
            background: '#1e2435',
            color: '#fff',
            border: '1px solid #2a3441',
            borderRadius: '12px',
            padding: '16px',
            maxWidth: '400px',
          },
        }
      );

      // Also show an info toast about the process
      setTimeout(() => {
        toast(
          '💡 Tip: Admin approval usually takes 5-15 minutes during business hours.',
          {
            duration: 6000,
            icon: 'ℹ️',
            style: {
              background: '#1e40af',
              color: '#fff',
              border: '1px solid #3b82f6',
              borderRadius: '12px',
            },
          }
        );
      }, 2000);

      // Close modal and reset
      setShowModal(false);
      setSelectedCrypto(null);
      setAmount('');
      
    } catch (error: any) {
      toast.dismiss('deposit-processing');
      toast.error(error.message || 'Deposit failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const closeModal = () => {
    if (isProcessing) return;
    setShowModal(false);
    setSelectedCrypto(null);
    setAmount('');
    setCopiedAddress(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F1419] via-[#12192A] to-[#1A2332] text-white">
      <DesktopSidebar balance={user?.balance || 0} />

      <div className="lg:ml-64 flex flex-col min-h-screen pb-20 lg:pb-0">
        {/* Header */}
        <header className="bg-gradient-to-r from-[#12192A] to-[#1A2332] border-b border-[#1e2435] px-4 lg:px-8 py-4 lg:py-6 shadow-lg">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="lg:hidden p-2 hover:bg-[#1e2435] rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold">Deposit Funds</h1>
                <p className="text-gray-400 text-sm">Choose your preferred cryptocurrency</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Info Banner */}
            <div className="mb-8 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-blue-500/20 rounded-2xl p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <Info className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-3">Quick Deposit Info</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-[#1e2435]/50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">Minimum</p>
                      <p className="text-lg font-bold text-green-400">$500</p>
                    </div>
                    <div className="bg-[#1e2435]/50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">Processing Fee</p>
                      <p className="text-lg font-bold text-green-400">0%</p>
                    </div>
                    <div className="bg-[#1e2435]/50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">Network Fee</p>
                      <p className="text-lg font-bold text-green-400">0%</p>
                    </div>
                    <div className="bg-[#1e2435]/50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">Processing</p>
                      <p className="text-lg font-bold text-blue-400">Instant</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Crypto Selection Cards */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Choose Payment Method</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {cryptoOptions.map((crypto) => (
                  <button
                    key={crypto.id}
                    onClick={() => handleCryptoSelect(crypto)}
                    className="group relative bg-gradient-to-br from-[#1e2435] to-[#252d42] border border-[#2a3441] rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/10"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${crypto.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`} />
                    
                    <div className="relative z-10 text-center">
                      <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${crypto.gradient} rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        {crypto.icon}
                      </div>
                      <h3 className="font-bold text-white mb-1 text-lg">{crypto.name}</h3>
                      <p className="text-gray-400 text-sm mb-2">{crypto.symbol}</p>
                      {crypto.network && (
                        <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30">
                          {crypto.network}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </main>

        <MobileBottomNav />
      </div>

      {/* Deposit Modal */}
      {showModal && selectedCrypto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#1e2435] rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#2a3441]">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 bg-gradient-to-br ${selectedCrypto.gradient} rounded-full flex items-center justify-center text-white font-bold`}>
                  {selectedCrypto.icon}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Deposit {selectedCrypto.name}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedCrypto.symbol} {selectedCrypto.network && `(${selectedCrypto.network})`}
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                disabled={isProcessing}
                className="p-2 hover:bg-gray-100 dark:hover:bg-[#252d42] rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Wallet Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Send funds to the wallet address below:
                </label>
                <div className="bg-gray-50 dark:bg-[#252d42] border border-gray-200 dark:border-[#2a3441] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-mono text-gray-900 dark:text-white break-all">
                      {selectedCrypto.address}
                    </span>
                    <button
                      onClick={handleCopyAddress}
                      className="ml-2 p-2 hover:bg-gray-200 dark:hover:bg-[#1e2435] rounded-lg transition-colors"
                    >
                      {copiedAddress ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      )}
                    </button>
                  </div>
                  
                  {/* QR Code */}
                  <div className="flex justify-center">
                    <div className="bg-white p-3 rounded-lg">
                      <QRCode value={selectedCrypto.address} size={120} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Deposit Limits */}
              <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Info className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Deposit Limits</span>
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                  <div>Minimum: ${selectedCrypto.minAmount.toLocaleString()}</div>
                  <div>Maximum: ${selectedCrypto.maxAmount.toLocaleString()}</div>
                  <div>Charge: 0%</div>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount (USD)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    min={selectedCrypto.minAmount}
                    max={selectedCrypto.maxAmount}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#252d42] border border-gray-200 dark:border-[#2a3441] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    disabled={isProcessing}
                  />
                </div>
              </div>

              {/* Deposit Button */}
              <button
                onClick={handleDeposit}
                disabled={!amount || isProcessing || parseFloat(amount) < selectedCrypto.minAmount}
                className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>I Have Deposited</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}