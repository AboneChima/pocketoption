'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
  ArrowLeft, 
  Copy, 
  QrCode, 
  DollarSign, 
  Check,
  AlertCircle,
  Shield,
  Clock,
  Wallet,
  X,
  Info,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import QRCode from 'react-qr-code'
import MobileBottomNav from '@/components/MobileBottomNav'
import DesktopSidebar from '@/components/DesktopSidebar'
import { toast } from 'react-hot-toast'

import { depositFunds } from '@/lib/firebaseFunctions'

interface CryptoOption {
  id: string
  name: string
  symbol: string
  address: string
  network: string
  icon: string
  color: string
}

const cryptoOptions: CryptoOption[] = [
  {
    id: 'btc',
    name: 'Bitcoin',
    symbol: 'BTC',
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    network: 'Bitcoin Network',
    icon: 'â‚¿',
    color: 'from-orange-500 to-orange-600'
  },
  {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'ETH',
    address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d4d4',
    network: 'Ethereum (ERC-20)',
    icon: 'Îž',
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'bnb',
    name: 'BNB',
    symbol: 'BNB',
    address: 'bnb1grpf0955h0ykzq3ar5nmum7y6gdfl6lxfn46h2',
    network: 'BNB Smart Chain',
    icon: 'B',
    color: 'from-yellow-500 to-yellow-600'
  },
  {
    id: 'usdt',
    name: 'Tether',
    symbol: 'USDT',
    address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d4d4',
    network: 'Ethereum (ERC-20)',
    icon: 'â‚®',
    color: 'from-green-500 to-green-600'
  }
]

export default function TopUpPage() {
  const router = useRouter()
  const { user, updateBalance } = useAuth()
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoOption | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [amount, setAmount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [addressCopied, setAddressCopied] = useState(false)

  const handleCryptoSelect = (crypto: CryptoOption) => {
    setSelectedCrypto(crypto)
    setShowModal(true)
  }

  const copyAddress = async () => {
    if (selectedCrypto) {
      await navigator.clipboard.writeText(selectedCrypto.address)
      setAddressCopied(true)
      toast.success('Address copied to clipboard!')
      setTimeout(() => setAddressCopied(false), 2000)
    }
  }

  const isValidAmount = () => {
    const num = parseFloat(amount)
    return num >= 500 && num <= 10000000
  }

    const handleDeposit = async () => {
    if (!selectedCrypto || !isValidAmount()) return
    if (!user?.id) {
      toast.error('Please login to submit a deposit')
      router.push('/auth/login')
      return
    }

    setIsProcessing(true)
    try {
      const depositAmount = parseFloat(amount)
      const data = await depositFunds(depositAmount, 'crypto', {
        currency: selectedCrypto.symbol,
        address: selectedCrypto.address,
        network: selectedCrypto.network || 'mainnet'
      })

      toast.success(data?.message || 'Deposit request submitted successfully. Waiting for admin approval.', {
        duration: 5000,
        icon: ''
      })

      setShowModal(false)
      setSelectedCrypto(null)
      setAmount('')
    } catch (error) {
      console.error('Deposit error:', error)
      toast.error('Failed to submit deposit. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 text-white">
      <div className="flex">
        <DesktopSidebar balance={user?.balance || 0} />
        
        <div className="flex-1 lg:ml-0">
          {/* Header */}
          <div className="bg-gray-900/95 backdrop-blur-md border-b border-gray-800 sticky top-0 z-40">
            <div className="max-w-md mx-auto lg:max-w-4xl px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors lg:hidden"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h1 className="text-xl font-bold">Top Up Account</h1>
                    <p className="text-sm text-gray-400">Add funds to your trading account</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Current Balance</p>
                  <p className="text-lg font-bold text-green-400">${user?.balance?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-md mx-auto lg:max-w-4xl px-4 py-6 pb-20 lg:pb-6">
            {/* Deposit Information */}
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-6 mb-8 border border-blue-500/20">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Wallet className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">Crypto Deposits</h3>
                  <div className="space-y-2 text-sm text-gray-300">
                    <div className="flex justify-between">
                      <span>Minimum Deposit:</span>
                      <span className="text-green-400">$500</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Maximum Deposit:</span>
                      <span className="text-green-400">$10,000,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Processing Fee:</span>
                      <span className="text-green-400">0% (Free)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Processing Time:</span>
                      <span className="text-blue-400">Instant</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Crypto Selection */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-6 text-center">Choose Cryptocurrency</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {cryptoOptions.map((crypto) => (
                  <button
                    key={crypto.id}
                    onClick={() => handleCryptoSelect(crypto)}
                    className="group relative overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-gray-600 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${crypto.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                    
                    <div className="relative z-10 flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${crypto.color} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                        {crypto.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                          {crypto.name}
                        </h3>
                        <p className="text-sm text-gray-400">{crypto.symbol}</p>
                        <p className="text-xs text-gray-500 mt-1">{crypto.network}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-400 mb-1">Secure & Protected</h4>
                  <p className="text-sm text-gray-300">
                    All crypto deposits are processed securely. Send only the selected cryptocurrency to the provided address.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      {showModal && selectedCrypto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${selectedCrypto.color} flex items-center justify-center text-white font-bold`}>
                    {selectedCrypto.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Deposit {selectedCrypto.name}
                    </h3>
                    <p className="text-sm text-gray-500">{selectedCrypto.network}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Wallet Address */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Wallet Address
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border">
                    <p className="text-sm font-mono text-gray-900 dark:text-white break-all">
                      {selectedCrypto.address}
                    </p>
                  </div>
                  <button
                    onClick={copyAddress}
                    className={`p-3 rounded-lg border transition-all duration-200 ${
                      addressCopied
                        ? 'bg-green-100 border-green-300 text-green-600'
                        : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {addressCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* QR Code */}
              <div className="mb-6 text-center">
                <div className="inline-block p-4 bg-white rounded-lg shadow-sm">
                  <QRCode
                    value={selectedCrypto.address}
                    size={128}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 flex items-center justify-center">
                  <QrCode className="w-3 h-3 mr-1" />
                  Scan to copy address
                </p>
              </div>

              {/* Amount Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Deposit Amount (USD)
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount (min $500)"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
                {amount && (
                  <div className="mt-2">
                    {isValidAmount() ? (
                      <div className="flex items-center text-green-600 text-sm">
                        <Check className="w-4 h-4 mr-2" />
                        Amount is valid
                      </div>
                    ) : (
                      <div className="flex items-center text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Amount must be between $500 - $10,000,000
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Important Notice */}
              <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Important:</strong> Send only {selectedCrypto.symbol} to this address. 
                      Sending other cryptocurrencies may result in permanent loss.
                    </p>
                  </div>
                </div>
              </div>

              {/* Deposit Button */}
              <Button
                onClick={handleDeposit}
                disabled={!amount || !isValidAmount() || isProcessing}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-5 h-5" />
                    <span>I Have Deposited</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      <MobileBottomNav />
    </div>
  )
}


