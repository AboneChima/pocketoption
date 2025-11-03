'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
  ArrowLeft, 
  User, 
  Settings, 
  Shield, 
  CreditCard,
  Bell,
  HelpCircle,
  LogOut,
  Edit3,
  Camera,
  Mail,
  Phone,
  MapPin,
  Calendar,
  TrendingUp,
  Award,
  Target,
  Activity,
  Wallet,
  BarChart3,
  Star,
  Crown,
  ChevronRight,
  Copy,
  Check,
  Globe,
  Lock,
  Smartphone,
  FileText,
  DollarSign,
  Users,
  Zap
} from 'lucide-react'
import MobileBottomNav from '@/components/MobileBottomNav'
import DesktopSidebar from '@/components/DesktopSidebar'
import { formatCurrency } from '@/lib/utils'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [userStats, setUserStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserStats()
  }, [])

  const fetchUserStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/stats')
      if (response.ok) {
        const stats = await response.json()
        setUserStats(stats)
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push('/auth')
  }

  const copyUserId = () => {
    navigator.clipboard.writeText(user?.id || 'USER123456')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const accountMenuItems = [
    {
      icon: Settings,
      title: 'Account Settings',
      description: 'Manage your account preferences',
      action: () => console.log('Account Settings'),
      color: 'blue'
    },
    {
      icon: Shield,
      title: 'Security & Privacy',
      description: 'Two-factor auth and security settings',
      action: () => console.log('Security'),
      color: 'green'
    },
    {
      icon: CreditCard,
      title: 'Payment Methods',
      description: 'Manage cards and payment options',
      action: () => console.log('Payment Methods'),
      color: 'purple'
    },
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Push notifications and trading alerts',
      action: () => console.log('Notifications'),
      color: 'yellow'
    }
  ]

  const supportMenuItems = [
    {
      icon: HelpCircle,
      title: 'Help & Support',
      description: 'Get help and contact support',
      action: () => console.log('Help & Support'),
      color: 'indigo'
    },
    {
      icon: FileText,
      title: 'Terms & Conditions',
      description: 'Legal terms and privacy policy',
      action: () => console.log('Terms'),
      color: 'gray'
    },
    {
      icon: Globe,
      title: 'Language & Region',
      description: 'Change language and regional settings',
      action: () => console.log('Language'),
      color: 'teal'
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      green: 'bg-green-500/20 text-green-400 border-green-500/30',
      purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      indigo: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      gray: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      teal: 'bg-teal-500/20 text-teal-400 border-teal-500/30'
    }
    return colors[color as keyof typeof colors] || colors.gray
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 text-white">
      <div className="flex">
        <DesktopSidebar balance={user?.balance || 0} />
        
        <div className="flex-1 lg:ml-0">
          {/* Header */}
          <div className="bg-gray-900/95 backdrop-blur-md border-b border-gray-800 sticky top-0 z-40">
            <div className="max-w-md mx-auto lg:max-w-6xl px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors lg:hidden"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h1 className="text-xl font-bold">Profile & Settings</h1>
                    <p className="text-sm text-gray-400">Manage your trading account</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-md mx-auto lg:max-w-6xl px-4 py-6 pb-20 lg:pb-6">
            {/* Profile Header */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-700/50">
              <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
                {/* Avatar Section */}
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-full flex items-center justify-center ring-4 ring-blue-500/30">
                    <User className="w-12 h-12 text-white" />
                  </div>
                  {isEditing && (
                    <button className="absolute -bottom-2 -right-2 p-2 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors shadow-lg">
                      <Camera className="w-4 h-4" />
                    </button>
                  )}
                  <div className="absolute -top-1 -right-1 p-1 bg-yellow-500 rounded-full">
                    <Crown className="w-4 h-4 text-yellow-900" />
                  </div>
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-2xl font-bold">
                      {user?.firstName && user?.lastName 
                        ? `${user.firstName} ${user.lastName}` 
                        : user?.email?.split('@')[0] || 'User'
                      }
                    </h2>
                    <div className="px-3 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full">
                      <span className="text-yellow-400 text-sm font-medium flex items-center">
                        <Star className="w-3 h-3 mr-1" />
                        {user?.isAdmin ? 'Admin' : 'Premium Trader'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm text-green-400 font-medium">Online</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        Member since {user?.createdAt 
                          ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                              month: 'short', 
                              year: 'numeric' 
                            })
                          : 'Jan 2024'
                        }
                      </span>
                    </div>
                  </div>

                  {/* User ID */}
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-sm text-gray-400">User ID:</span>
                    <code className="text-sm bg-gray-800/50 px-2 py-1 rounded border border-gray-600">
                      {user?.id || 'USER123456'}
                    </code>
                    <button
                      onClick={copyUserId}
                      className="p-1 hover:bg-gray-700 rounded transition-colors"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-600/20 via-blue-500/10 to-transparent rounded-lg p-3 border border-blue-500/30">
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-blue-400" />
                        <span className="text-xs text-blue-300">Total Trades</span>
                      </div>
                      <p className="text-lg font-bold text-white mt-1">
                        {loading ? '...' : (userStats?.totalTrades || 0)}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-green-600/20 via-green-500/10 to-transparent rounded-lg p-3 border border-green-500/30">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-xs text-green-300">Win Rate</span>
                      </div>
                      <p className="text-lg font-bold text-white mt-1">
                        {loading ? '...' : `${userStats?.winRate || 0}%`}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-600/20 via-purple-500/10 to-transparent rounded-lg p-3 border border-purple-500/30">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-purple-400" />
                        <span className="text-xs text-purple-300">Total Profit</span>
                      </div>
                      <p className="text-lg font-bold text-white mt-1">
                        {loading ? '...' : formatCurrency(userStats?.totalProfit || 0)}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-600/20 via-orange-500/10 to-transparent rounded-lg p-3 border border-orange-500/30">
                      <div className="flex items-center space-x-2">
                        <Zap className="w-4 h-4 text-orange-400" />
                        <span className="text-xs text-orange-300">Streak</span>
                      </div>
                      <p className="text-lg font-bold text-white mt-1">
                        {loading ? '...' : Math.abs(userStats?.currentStreak || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-700/50">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <User className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold">Account Information</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 bg-gray-800/30 rounded-lg border border-gray-700/30">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Mail className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-400 mb-1">Email Address</p>
                      <p className="font-medium">{user?.email || 'john.doe@example.com'}</p>
                    </div>
                  </div>
                  
                  {/* Only show phone if user has provided it */}
                  {user?.phone && (
                    <div className="flex items-center space-x-4 p-4 bg-gray-800/30 rounded-lg border border-gray-700/30">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <Phone className="w-5 h-5 text-green-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-400 mb-1">Phone Number</p>
                        <p className="font-medium">{user.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  {/* Only show location if user has provided it */}
                  {user?.location && (
                    <div className="flex items-center space-x-4 p-4 bg-gray-800/30 rounded-lg border border-gray-700/30">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <MapPin className="w-5 h-5 text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-400 mb-1">Location</p>
                        <p className="font-medium">{user.location}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-4 p-4 bg-gray-800/30 rounded-lg border border-gray-700/30">
                    <div className="p-2 bg-yellow-500/20 rounded-lg">
                      <Wallet className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-400 mb-1">Account Balance</p>
                      <p className="font-medium text-green-400">{formatCurrency(user?.balance || 0)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-700/50">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Settings className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold">Account Settings</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {accountMenuItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={item.action}
                    className="bg-gray-800/30 hover:bg-gray-700/50 rounded-lg p-4 border border-gray-700/30 hover:border-gray-600/50 transition-all duration-200 text-left group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${getColorClasses(item.color)}`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium group-hover:text-white transition-colors">{item.title}</h4>
                        <p className="text-sm text-gray-400 mt-1">{item.description}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Support & Help */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-700/50">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                  <HelpCircle className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold">Support & Help</h3>
              </div>
              
              <div className="space-y-3">
                {supportMenuItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={item.action}
                    className="w-full bg-gray-800/30 hover:bg-gray-700/50 rounded-lg p-4 border border-gray-700/30 hover:border-gray-600/50 transition-all duration-200 text-left group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${getColorClasses(item.color)}`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium group-hover:text-white transition-colors">{item.title}</h4>
                        <p className="text-sm text-gray-400 mt-1">{item.description}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Logout Button */}
            <div className="bg-gradient-to-br from-red-600/20 via-red-500/10 to-transparent rounded-xl p-6 border border-red-500/30 mb-6">
              <button
                onClick={handleLogout}
                className="w-full bg-red-600/20 hover:bg-red-600/30 border border-red-600/50 hover:border-red-600 rounded-lg p-4 transition-all duration-200 group"
              >
                <div className="flex items-center justify-center space-x-3">
                  <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-300 transition-colors" />
                  <span className="font-medium text-red-400 group-hover:text-red-300 transition-colors">Sign Out</span>
                </div>
              </button>
            </div>

            {/* Version Info */}
            <div className="text-center text-gray-500 text-sm">
              <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/30">
                <p className="font-medium mb-1">PocketOption Clone v1.0.0</p>
                <p>© 2024 All rights reserved</p>
                <div className="flex items-center justify-center space-x-4 mt-3 text-xs">
                  <span>Built with ❤️ for traders</span>
                  <span>•</span>
                  <span>Secure & Reliable</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  )
}