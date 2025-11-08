'use client'

import { useEffect, useState } from 'react'
import { TrendingDown, Clock, CheckCircle, XCircle, Loader } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface Withdrawal {
  id: string
  amount: number
  currency: string
  walletAddress: string
  network: string
  status: 'pending' | 'completed' | 'rejected'
  createdAt: string
  processedAt?: string
  adminNote?: string
}

export default function WithdrawalHistoryDashboard() {
  const { user } = useAuth()
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      fetchWithdrawals()
    }
  }, [user])

  const fetchWithdrawals = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/withdrawals?userId=${user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setWithdrawals(data.withdrawals || [])
      }
    } catch (error) {
      console.error('Failed to fetch withdrawals:', error)
    } finally {
      setLoading(false)
    }
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
        return 'text-green-400 bg-green-500/10 border-green-500/30'
      case 'rejected':
        return 'text-red-400 bg-red-500/10 border-red-500/30'
      default:
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {withdrawals.length === 0 ? (
        <div className="text-center py-12">
          <TrendingDown className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-2">No withdrawals yet</p>
          <p className="text-gray-500 text-sm">Your withdrawal history will appear here</p>
        </div>
      ) : (
        withdrawals.map((withdrawal) => (
          <div
            key={withdrawal.id}
            className="flex items-center justify-between p-4 bg-[#1e2435]/50 rounded-xl hover:bg-[#1e2435] transition-all duration-300"
          >
            <div className="flex items-center space-x-4">
              {getStatusIcon(withdrawal.status)}
              <div>
                <p className="text-sm font-medium text-white">
                  ${withdrawal.amount.toFixed(2)} {withdrawal.currency}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(withdrawal.createdAt).toLocaleDateString()} • {withdrawal.network}
                </p>
                {withdrawal.adminNote && withdrawal.status === 'rejected' && (
                  <p className="text-xs text-red-400 mt-1">{withdrawal.adminNote}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(withdrawal.status)}`}>
                {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
              </span>
              {withdrawal.status === 'pending' && (
                <p className="text-xs text-gray-400 mt-1">Processing...</p>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
