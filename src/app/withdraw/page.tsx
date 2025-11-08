'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft, Clock, TrendingDown, Wallet } from 'lucide-react'
import DesktopSidebar from '@/components/DesktopSidebar'
import MobileBottomNav from '@/components/MobileBottomNav'
import WithdrawModal from '@/components/modals/WithdrawModal'
import WithdrawalHistory from '@/components/WithdrawalHistory'
import { PageLoader } from '@/components/ui/UnifiedLoader'

export default function WithdrawPage() {
  const { user, loading, refreshUser } = useAuth()
  const router = useRouter()
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [balance, setBalance] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && user.balance !== undefined) {
      setBalance(user.balance)
    }
  }, [user])

  const handleWithdrawSuccess = async (newBalance?: number) => {
    // Update balance immediately if provided
    if (newBalance !== undefined) {
      setBalance(newBalance)
    }
    
    // Refresh user data from server in background
    setTimeout(async () => {
      if (refreshUser) {
        await refreshUser()
      }
    }, 100)
    
    // Trigger history refresh
    setRefreshKey(prev => prev + 1)
  }

  if (loading) {
    return <PageLoader />
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F1419] via-[#12192A] to-[#1A2332] text-white">
      <DesktopSidebar balance={balance} />

      <div className="lg:ml-64 flex flex-col min-h-screen pb-20 lg:pb-0">
        {/* Header */}
        <header className="bg-gradient-to-r from-[#12192A] to-[#1A2332] border-b border-[#1e2435] px-4 lg:px-8 py-4 lg:py-6 shadow-lg">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.back()}
                  className="p-2 hover:bg-[#1e2435] rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-400" />
                </button>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white">Withdraw Funds</h1>
                  <p className="text-sm text-gray-400 mt-1">Request withdrawals to your crypto wallet</p>
                </div>
              </div>
              <button
                onClick={() => setShowWithdrawModal(true)}
                className="group relative bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 px-6 py-2.5 rounded-xl font-semibold text-white transition-all duration-300 flex items-center space-x-2 shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 hover:scale-105 active:scale-95"
              >
                <TrendingDown className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                <span className="text-sm">Withdraw</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
              {/* Balance Card */}
              <div className="md:col-span-2 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-transparent backdrop-blur-xl rounded-2xl p-6 lg:p-8 border border-blue-500/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-2 flex items-center space-x-2">
                      <Wallet className="w-4 h-4" />
                      <span>Available Balance</span>
                    </p>
                    <p className="text-4xl lg:text-5xl font-bold text-white mb-1">
                      ${balance.toFixed(2)}
                    </p>
                    <p className="text-sm text-green-400">Ready for instant withdrawal</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm">
                    <Wallet className="w-12 h-12 text-blue-400" />
                  </div>
                </div>
              </div>

              {/* Quick Info Card */}
              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <div className="p-2 rounded-lg bg-blue-500/20 w-fit mb-3">
                      <Clock className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">Admin Approval</h3>
                    <p className="text-sm text-gray-400">5-30 minutes</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-blue-500/20">
                    <p className="text-xs text-gray-400">Gas fees from $0.50</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Withdrawal History */}
            <WithdrawalHistory key={refreshKey} />
          </div>
        </main>

        <MobileBottomNav />
      </div>

      {/* Withdraw Modal */}
      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        balance={balance}
        onWithdrawSuccess={handleWithdrawSuccess}
      />
    </div>
  )
}
