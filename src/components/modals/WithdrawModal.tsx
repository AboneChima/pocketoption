'use client'

import { useState } from 'react'
import { X, Wallet, AlertCircle, CheckCircle, TrendingDown, Clock } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'

interface WithdrawModalProps {
  isOpen: boolean
  onClose: () => void
  balance: number
  onWithdrawSuccess?: (newBalance?: number) => void
}

const CURRENCIES = [
  { value: 'BTC', label: 'Bitcoin (BTC)', icon: '₿' },
  { value: 'ETH', label: 'Ethereum (ETH)', icon: 'Ξ' },
  { value: 'USDT', label: 'Tether (USDT)', icon: '₮' },
  { value: 'BNB', label: 'Binance Coin (BNB)', icon: 'BNB' },
]

const NETWORKS = {
  BTC: ['Bitcoin Network'],
  ETH: ['ERC20'],
  USDT: ['TRC20', 'ERC20', 'BEP20'],
  BNB: ['BEP20', 'BEP2'],
}

const GAS_FEES = {
  'Bitcoin Network': 2.50,
  'ERC20': 5.00,
  'TRC20': 1.00,
  'BEP20': 0.50,
  'BEP2': 0.50,
}

export default function WithdrawModal({ isOpen, onClose, balance, onWithdrawSuccess }: WithdrawModalProps) {
  const { user } = useAuth()
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('USDT')
  const [network, setNetwork] = useState('TRC20')
  const [walletAddress, setWalletAddress] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const withdrawAmount = parseFloat(amount)
    const gasFee = GAS_FEES[network as keyof typeof GAS_FEES] || 1.00
    const totalAmount = withdrawAmount + gasFee

    // Validation
    if (!amount || withdrawAmount <= 0) {
      toast.error('Please enter a valid withdrawal amount', {
        icon: '⚠️',
        duration: 4000
      })
      return
    }

    if (withdrawAmount < 1) {
      toast.error('Minimum withdrawal amount is $1.00', {
        icon: '⚠️',
        duration: 4000
      })
      return
    }

    if (totalAmount > balance) {
      toast.error(
        `Insufficient balance. You need $${totalAmount.toFixed(2)} (including $${gasFee.toFixed(2)} gas fee)`,
        { duration: 5000 }
      )
      return
    }

    if (!walletAddress.trim()) {
      toast.error('Please enter your wallet address')
      return
    }

    if (walletAddress.length < 20) {
      toast.error('Invalid wallet address')
      return
    }

    setIsSubmitting(true)

    try {
      if (!user || !user.id) {
        toast.error('Please login to withdraw')
        return
      }

      const response = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          amount: withdrawAmount,
          currency,
          walletAddress,
          network,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.details) {
          toast.error(
            `Insufficient balance!\n\nWithdrawal: $${data.details.withdrawalAmount.toFixed(2)}\nGas Fee: $${data.details.gasFee.toFixed(2)}\nTotal: $${data.details.totalRequired.toFixed(2)}\n\nYour Balance: $${data.details.currentBalance.toFixed(2)}\nShortfall: $${data.details.shortfall.toFixed(2)}`,
            { duration: 8000 }
          )
        } else {
          throw new Error(data.error || 'Failed to process withdrawal')
        }
        return
      }

      toast.success(
        `Withdrawal request submitted! 🎉\n\nAmount: $${withdrawAmount.toFixed(2)}\nGas fee: $${gasFee.toFixed(2)}\nTotal: $${(withdrawAmount + gasFee).toFixed(2)}\n\nYour request is pending admin approval. You will be notified once processed.`,
        {
          duration: 8000,
          icon: '⏳',
          style: {
            background: '#1e40af',
            color: '#fff',
            border: '1px solid #3b82f6'
          }
        }
      )

      // Reset form
      setAmount('')
      setWalletAddress('')
      
      // Call success callback to refresh history
      if (onWithdrawSuccess) {
        onWithdrawSuccess()
      }

      // Close modal
      onClose()
    } catch (error: any) {
      console.error('Withdrawal error:', error)
      toast.error(error.message || 'Failed to process withdrawal')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency)
    // Set default network for the selected currency
    const networks = NETWORKS[newCurrency as keyof typeof NETWORKS]
    if (networks && networks.length > 0) {
      setNetwork(networks[0])
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-gradient-to-b from-[#12192A] to-[#0E1320] rounded-2xl max-w-md w-full border border-[#1e2435] shadow-2xl animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#1e2435]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <TrendingDown className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Withdraw Funds</h2>
              <p className="text-sm text-gray-400">Request a withdrawal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#1e2435] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Balance Info */}
        <div className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-[#1e2435]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Available Balance</p>
              <p className="text-2xl font-bold text-white">${balance.toFixed(2)}</p>
            </div>
            <Wallet className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Currency Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              className="w-full bg-[#1e2435] border border-[#252d42] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
            >
              {CURRENCIES.map((curr) => (
                <option key={curr.value} value={curr.value}>
                  {curr.icon} {curr.label}
                </option>
              ))}
            </select>
          </div>

          {/* Network Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Network
            </label>
            <select
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              className="w-full bg-[#1e2435] border border-[#252d42] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
            >
              {NETWORKS[currency as keyof typeof NETWORKS]?.map((net) => (
                <option key={net} value={net}>
                  {net}
                </option>
              ))}
            </select>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Amount (USD)
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="1"
                step="0.01"
                className="w-full bg-[#1e2435] border border-[#252d42] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => {
                  const gasFee = GAS_FEES[network as keyof typeof GAS_FEES] || 1.00
                  const maxAmount = Math.max(0, balance - gasFee)
                  setAmount(maxAmount.toFixed(2))
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-400 hover:text-blue-300 font-medium"
              >
                MAX
              </button>
            </div>
            {amount && parseFloat(amount) > 0 && (
              <div className="mt-2 text-sm space-y-1">
                <div className="flex justify-between text-gray-400">
                  <span>Withdrawal amount:</span>
                  <span className="text-white">${parseFloat(amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Gas fee ({network}):</span>
                  <span className="text-yellow-400">${(GAS_FEES[network as keyof typeof GAS_FEES] || 1.00).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-300 font-semibold pt-1 border-t border-[#252d42]">
                  <span>Total deducted:</span>
                  <span className="text-white">${(parseFloat(amount) + (GAS_FEES[network as keyof typeof GAS_FEES] || 1.00)).toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Wallet Address Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Wallet Address
            </label>
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder={`Enter your ${currency} wallet address`}
              className="w-full bg-[#1e2435] border border-[#252d42] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors font-mono text-sm"
            />
          </div>

          {/* Warning */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-200">
              <p className="font-medium mb-1">Important Notice</p>
              <p className="text-yellow-300/80">
                Please double-check your wallet address and network before submitting. Funds sent to incorrect addresses cannot be recovered.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !amount || !walletAddress}
            className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-red-500/25"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-5 h-5" />
                <span>Submit Withdrawal Request</span>
              </>
            )}
          </button>

          {/* Info */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex items-start space-x-3">
            <Clock className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-200">
              <p className="font-medium mb-1">Admin Approval Required</p>
              <p className="text-blue-300/80">
                Your withdrawal request will be reviewed by our admin team. Processing typically takes 5-30 minutes during business hours.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
