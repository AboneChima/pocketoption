'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Wallet, AlertCircle, CheckCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface CryptoOption {
  id: string
  name: string
  symbol: string
  icon: string
  minWithdraw: number
  maxWithdraw: number
  network?: string
}

const cryptoOptions: CryptoOption[] = [
  {
    id: 'btc',
    name: 'Bitcoin',
    symbol: 'BTC',
    icon: '₿',
    minWithdraw: 10,
    maxWithdraw: 10000000
  },
  {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'ETH',
    icon: 'Ξ',
    minWithdraw: 10,
    maxWithdraw: 10000000
  },
  {
    id: 'bnb',
    name: 'Binance Coin',
    symbol: 'BNB',
    icon: 'B',
    minWithdraw: 10,
    maxWithdraw: 10000000
  },
  {
    id: 'usdt',
    name: 'Tether',
    symbol: 'USDT',
    icon: '₮',
    minWithdraw: 10,
    maxWithdraw: 10000000,
    network: 'TRC20'
  }
]

export default function WithdrawPage() {
  const router = useRouter()
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoOption>(cryptoOptions[0])
  const [amount, setAmount] = useState('')
  const [walletAddress, setWalletAddress] = useState('')
  const [userBalance, setUserBalance] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingBalance, setIsLoadingBalance] = useState(true)

  useEffect(() => {
    fetchUserBalance()
  }, [])

  const fetchUserBalance = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUserBalance(data.user.balance || 0)
      }
    } catch (error) {
      console.error('Error fetching balance:', error)
    } finally {
      setIsLoadingBalance(false)
    }
  }

  const handleWithdraw = async () => {
    if (!amount || !walletAddress) {
      toast.error('Please fill in all fields')
      return
    }

    const withdrawAmount = parseFloat(amount)
    
    if (withdrawAmount < selectedCrypto.minWithdraw || withdrawAmount > selectedCrypto.maxWithdraw) {
      toast.error(`Amount must be between $${selectedCrypto.minWithdraw} and $${selectedCrypto.maxWithdraw.toLocaleString()}`)
      return
    }

    if (withdrawAmount > userBalance) {
      toast.error(`Insufficient balance. Available: $${userBalance.toFixed(2)}`)
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: withdrawAmount,
          currency: selectedCrypto.symbol,
          walletAddress: walletAddress
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        setAmount('')
        setWalletAddress('')
        fetchUserBalance() // Refresh balance
      } else {
        toast.error(data.error || 'Withdrawal failed')
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => router.back()}
            className="mr-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">Withdraw Funds</h1>
            <p className="text-gray-300 mt-2">Withdraw your funds to your crypto wallet.</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Balance Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8 border border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Wallet className="w-8 h-8 text-blue-400 mr-3" />
                <div>
                  <p className="text-gray-300 text-sm">Available Balance</p>
                  <p className="text-2xl font-bold text-white">
                    {isLoadingBalance ? (
                      <div className="animate-pulse bg-gray-600 h-8 w-32 rounded"></div>
                    ) : (
                      `$${userBalance.toFixed(2)}`
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Withdrawal Form */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
            {/* Currency Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Select Currency
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {cryptoOptions.map((crypto) => (
                  <button
                    key={crypto.id}
                    onClick={() => setSelectedCrypto(crypto)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedCrypto.id === crypto.id
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">{crypto.icon}</div>
                      <p className="text-white text-sm font-semibold">{crypto.symbol}</p>
                      {crypto.network && (
                        <p className="text-blue-400 text-xs">{crypto.network}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount (USD)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  min={selectedCrypto.minWithdraw}
                  max={Math.min(selectedCrypto.maxWithdraw, userBalance)}
                  className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={() => setAmount(userBalance.toString())}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 text-sm hover:text-blue-300"
                >
                  Max
                </button>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Min: ${selectedCrypto.minWithdraw}</span>
                <span>Max: ${Math.min(selectedCrypto.maxWithdraw, userBalance).toLocaleString()}</span>
              </div>
            </div>

            {/* Wallet Address Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {selectedCrypto.name} Wallet Address
              </label>
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder={`Enter your ${selectedCrypto.symbol} wallet address`}
                className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 font-mono text-sm"
              />
            </div>

            {/* Withdrawal Info */}
            <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-200">
                  <p className="font-semibold mb-1">Important Information:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Withdrawals are processed manually and may take 1-24 hours</li>
                    <li>• Double-check your wallet address before submitting</li>
                    <li>• Minimum withdrawal: ${selectedCrypto.minWithdraw}</li>
                    <li>• Network fees may apply depending on blockchain congestion</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleWithdraw}
              disabled={!amount || !walletAddress || isLoading || parseFloat(amount || '0') > userBalance}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Request Withdrawal
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}