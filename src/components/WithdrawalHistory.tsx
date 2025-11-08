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
        setWithdrawals(Array.isArray(data) ? data : [])
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
          <div className="space-y-4">
            {withdrawals.map((withdrawal) => (
              <div
                key={withdrawal.id}
                className="bg-[#1e2435]/50 rounded-xl p-4 border border-[#252d42] hover:border-[#2d3548] transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(withdrawal.status)}
                    <div>
                      <p className="text-white font-medium">
                        {formatCurrency(withdrawal.amount)}
                      </p>
                      <p className="text-sm text-gray-400">
                        {withdrawal.currency} • {withdrawal.network}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      withdrawal.status
                    )}`}
                  >
                    {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between text-gray-400">
                    <span>Wallet Address:</span>
                    <span className="font-mono text-xs text-gray-300">
                      {withdrawal.walletAddress.slice(0, 8)}...{withdrawal.walletAddress.slice(-8)}
                    </span>
                  </div>
                  {withdrawal.gasFee && (
                    <div className="flex items-center justify-between text-gray-400">
                      <span>Gas Fee:</span>
                      <span className="text-yellow-400">
                        {formatCurrency(withdrawal.gasFee)}
                      </span>
                    </div>
                  )}
                  {withdrawal.totalAmount && (
                    <div className="flex items-center justify-between text-gray-400 font-semibold">
                      <span>Total Deducted:</span>
                      <span className="text-white">
                        {formatCurrency(withdrawal.totalAmount)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-gray-400">
                    <span>{withdrawal.status === 'completed' ? 'Completed:' : 'Requested:'}</span>
                    <span className="text-gray-300">
                      {new Date(withdrawal.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {withdrawal.processedAt && withdrawal.processedAt !== withdrawal.createdAt && (
                    <div className="flex items-center justify-between text-gray-400">
                      <span>Processed:</span>
                      <span className="text-gray-300">
                        {new Date(withdrawal.processedAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {withdrawal.adminNote && (
                    <div className="mt-3 p-3 bg-[#12192A] rounded-lg border border-[#1e2435]">
                      <p className="text-xs text-gray-400 mb-1">Note:</p>
                      <p className="text-sm text-gray-300">{withdrawal.adminNote}</p>
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
