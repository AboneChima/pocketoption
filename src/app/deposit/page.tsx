'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Copy, QrCode, Check, X, Info, DollarSign, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import QRCode from 'react-qr-code';
import MobileBottomNav from '@/components/MobileBottomNav';
import DesktopSidebar from '@/components/DesktopSidebar';

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
    minAmount: 500,
    maxAmount: 10000000,
    gradient: 'from-green-400 to-green-600',
    network: 'TRC20'
  },
  {
    id: 'btc',
    name: 'Bitcoin',
    symbol: 'BTC',
    icon: '₿',
    address: 'bc1qfej7ukyjvy5peatf8tw8xp20gvp23nuhxrt636',
    minAmount: 500,
    maxAmount: 10000000,
    gradient: 'from-orange-400 to-orange-600'
  },
  {
    id: 'bnb',
    name: 'BNB',
    symbol: 'BNB',
    icon: 'B',
    address: '0xED1bc43b0aE3948669Bc53087256E7fD3584a1Dc',
    minAmount: 500,
    maxAmount: 10000000,
    gradient: 'from-yellow-400 to-yellow-600'
  },
  {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'ETH',
    icon: 'Ξ',
    address: '0xED1bc43b0aE3948669Bc53087256E7fD3584a1Dc',
    minAmount: 500,
    maxAmount: 10000000,
    gradient: 'from-blue-400 to-blue-600'
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
      // Show processing message
      toast.loading('Transaction received, awaiting network confirmation...', { id: 'deposit-processing' });

      // Simulate network confirmation delay
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Create deposit record
      const depositRecord = {
        userId: user?.id,
        currency: selectedCrypto.symbol,
        amount: depositAmount,
        status: 'Confirmed',
        address: selectedCrypto.address,
        createdAt: new Date().toISOString()
      };

      // Save to localStorage for demo purposes
      const existingDeposits = JSON.parse(localStorage.getItem('deposits') || '[]');
      existingDeposits.push(depositRecord);
      localStorage.setItem('deposits', JSON.stringify(existingDeposits));

      // Update user balance
      await updateBalance(depositAmount);

      // Show success message
      toast.dismiss('deposit-processing');
      toast.success('Deposit successful! Funds added to your account.', {
        duration: 5000,
        icon: '🎉'
      });

      // Close modal and reset
      setShowModal(false);
      setSelectedCrypto(null);
      setAmount('');
      
    } catch (error) {
      toast.dismiss('deposit-processing');
      toast.error('Deposit failed. Please try again.');
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
    <div className="min-h-screen bg-gradient-to-br from-[#0F1419] via-[#12192A] to-[#1A2332] text-white flex">
      {/* Desktop Sidebar */}
      <DesktopSidebar balance={user?.balance || 0} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col pb-20 lg:pb-0">
        {/* Header */}
        <header className="bg-gradient-to-r from-[#12192A] to-[#1A2332] border-b border-[#1e2435] px-4 lg:px-8 py-4">
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
        </header>

        {/* Content */}
        <div className="flex-1 p-4 lg:p-8">
          <div className="max-w-4xl mx-auto">
            {/* Crypto Selection Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {cryptoOptions.map((crypto) => (
                <button
                  key={crypto.id}
                  onClick={() => handleCryptoSelect(crypto)}
                  className="group relative bg-gradient-to-br from-[#1e2435] to-[#252d42] border border-[#2a3441] rounded-xl p-6 hover:border-[#3b82f6] transition-all duration-300 hover:scale-105"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${crypto.gradient} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300`} />
                  
                  <div className="relative z-10 text-center">
                    <div className={`w-12 h-12 mx-auto mb-3 bg-gradient-to-br ${crypto.gradient} rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                      {crypto.icon}
                    </div>
                    <h3 className="font-semibold text-white mb-1">{crypto.name}</h3>
                    <p className="text-gray-400 text-sm">{crypto.symbol}</p>
                    {crypto.network && (
                      <span className="inline-block mt-2 px-2 py-1 bg-[#3b82f6] bg-opacity-20 text-[#3b82f6] text-xs rounded-full">
                        {crypto.network}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Info Section */}
            <div className="mt-8 bg-gradient-to-br from-[#1e2435] to-[#252d42] border border-[#2a3441] rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-white mb-2">Deposit Information</h3>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• Minimum deposit: $500</li>
                    <li>• Maximum deposit: $10,000,000</li>
                    <li>• Processing fee: 0%</li>
                    <li>• Network fee: 0%</li>
                    <li>• Funds are credited instantly after confirmation</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
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

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}