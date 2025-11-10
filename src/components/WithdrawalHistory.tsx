'use client'

import { useEffect, useState } from 'react'
import { Clock, CheckCircle, XCircle, TrendingDown, RefreshCw } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

interface Withdrawal {
  id: string
  amount: number
  currency: string
  walletAddress: string
  network: string
  gasFee?: number
  totalAmount?: number
  status: 'pending' | 'completed' | 'rejected'
  adminNote?: string
  createdAt: string
  processedAt?: string
}

export default function WithdrawalHistory() {
  const { user } = useAuth()
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchWithdrawals = async () => {
    if (!user || !user.id) return
    
    try {
      const response = await fetch(`/api/withdrawals?userId=${user.id}`, {
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const withdrawalsList = Array.isArray(data) ? data : (data.withdrawals || [])
        console.log('Fetched withdrawals:', withdrawalsList.length)
        setWithdrawals(withdrawalsList)
      }
    } catch (error) {
      console.error('Failed to fetch withdrawals:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchWithdrawals()
    }
  }, [user])
  
  // Force refresh when component remounts (via key prop change)
  useEffect(() => {
    if (user) {
      fetchWithdrawals()
    }
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchWithdrawals()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-400" />
      default:
        return <Clock className="w-5 h-5 text-yellow-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    }
  }

  if (loading) {
    return (
      <div className="bg-[#12192A]/50 backdrop-blur-xl rounded-2xl border border-[#1e2435] p-8">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#12192A]/50 backdrop-blur-xl rounded-2xl border border-[#1e2435] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-[#1e2435]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <TrendingDown className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Withdrawal History</h3>
              <p className="text-sm text-gray-400">Track your withdrawal requests</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-lg bg-[#1e2435] hover:bg-[#252d42] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {withdrawals.length === 0 ? (
          <div className="text-center py-12">
            <TrendingDown className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">No withdrawal requests yet</p>
            <p className="text-gray-500 text-sm">Your withdrawal history will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {withdrawals.map((withdrawal) => (
              <div
                key={withdrawal.id}
                className="group bg-gradient-to-r from-[#1A2332]/80 to-[#12192A]/80 rounded-xl p-5 hover:from-[#1e2838] hover:to-[#151d2e] transition-all duration-300 border border-[#252d42]/30 hover:border-[#3d4a5c]/50 hover:shadow-lg hover:shadow-red-500/5"
              >
                {/* Header: Status + Amount */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl transition-transform duration-300 group-hover:scale-110 ${
                      withdrawal.status === 'completed'
                        ? 'bg-gradient-to-br from-green-500/20 via-emerald-500/15 to-green-600/10 border border-green-500/40 shadow-lg shadow-green-500/10'
                        : withdrawal.status === 'rejected'
                        ? 'bg-gradient-to-br from-red-500/20 via-pink-500/15 to-red-600/10 border border-red-500/40 shadow-lg shadow-red-500/10'
                        : 'bg-gradient-to-br from-yellow-500/20 via-orange-500/15 to-yellow-600/10 border border-yellow-500/40 shadow-lg shadow-yellow-500/10'
                    }`}>
                      {getStatusIcon(withdrawal.status)}
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg">
                        {formatCurrency(withdrawal.amount)}
                      </p>
                      <p className="text-sm text-gray-400 font-medium">
                        {withdrawal.currency} • {withdrawal.network}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide border ${getStatusColor(
                      withdrawal.status
                    )}`}
                  >
                    {withdrawal.status}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="space-y-3">
                  {/* Wallet Address */}
                  <div className="bg-[#12192A]/50 rounded-lg p-3 border border-[#1e2435]">
                    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Wallet Address</p>
                    <p className="font-mono text-sm text-gray-300 break-all">
                      {withdrawal.walletAddress}
                    </p>
                  </div>

                  {/* Financial Details */}
                  <div className="grid grid-cols-2 gap-3">
                    {withdrawal.gasFee && (
                      <div className="bg-[#12192A]/50 rounded-lg p-3 border border-[#1e2435]">
                        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Gas Fee</p>
                        <p className="text-sm font-semibold text-yellow-400">
                          {formatCurrency(withdrawal.gasFee)}
                        </p>
                      </div>
                    )}
                    {withdrawal.totalAmount && (
                      <div className="bg-[#12192A]/50 rounded-lg p-3 border border-[#1e2435]">
                        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Total Deducted</p>
                        <p className="text-sm font-bold text-white">
                          {formatCurrency(withdrawal.totalAmount)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Timestamps */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-[#12192A]/50 rounded-lg p-3 border border-[#1e2435]">
                      <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                        {withdrawal.status === 'completed' ? 'Completed' : 'Requested'}
                      </p>
                      <p className="text-sm text-gray-300">
                        {new Date(withdrawal.createdAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {withdrawal.processedAt && withdrawal.processedAt !== withdrawal.createdAt && (
                      <div className="bg-[#12192A]/50 rounded-lg p-3 border border-[#1e2435]">
                        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Processed</p>
                        <p className="text-sm text-gray-300">
                          {new Date(withdrawal.processedAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Admin Note */}
                  {withdrawal.adminNote && (
                    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 border border-blue-500/20">
                      <p className="text-xs text-blue-400 mb-2 uppercase tracking-wide font-semibold">Admin Note</p>
                      <p className="text-sm text-gray-200">{withdrawal.adminNote}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
