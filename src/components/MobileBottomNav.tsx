'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { 
  TrendingUp, 
  Wallet, 
  BarChart3, 
  Trophy, 
  User,
  Plus,
  Home,
  History,
  Settings,
  TrendingDown
} from 'lucide-react'

interface NavItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  path: string
  color: string
  activeColor: string
}

const navItems: NavItem[] = [
  {
    id: 'trade',
    label: 'Trade',
    icon: TrendingUp,
    path: '/dashboard',
    color: 'text-gray-400',
    activeColor: 'text-blue-500'
  },
  {
    id: 'deposit',
    label: 'Deposit',
    icon: Plus,
    path: '/deposit',
    color: 'text-gray-400',
    activeColor: 'text-green-500'
  },
  {
    id: 'withdraw',
    label: 'Withdraw',
    icon: TrendingDown,
    path: '/withdraw',
    color: 'text-gray-400',
    activeColor: 'text-red-500'
  },
  {
    id: 'history',
    label: 'History',
    icon: History,
    path: '/history',
    color: 'text-gray-400',
    activeColor: 'text-orange-500'
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    path: '/profile',
    color: 'text-gray-400',
    activeColor: 'text-pink-500'
  }
]

export default function MobileBottomNav() {
  const router = useRouter()
  const pathname = usePathname()

  const handleNavigation = (item: NavItem) => {
    router.push(item.path)
  }

  const isActive = (item: NavItem) => {
    if (item.path === '/dashboard' && pathname === '/dashboard') return true
    if (item.path !== '/dashboard' && pathname.startsWith(item.path)) return true
    return false
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      {/* Background with blur effect */}
      <div className="bg-gradient-to-t from-[#0F1419] via-[#12192A]/98 to-[#12192A]/95 backdrop-blur-xl border-t border-[#1e2435] shadow-2xl">
        <div className="flex items-center justify-around py-3 px-2 max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item)
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 min-w-0 flex-1 relative ${
                  active 
                    ? 'scale-105' 
                    : 'hover:bg-white/5 active:scale-95'
                }`}
              >
                {/* Active indicator */}
                {active && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full" />
                )}
                
                <div className={`p-2 rounded-xl transition-all duration-300 ${
                  active 
                    ? `bg-gradient-to-br ${getGradientColors(item.activeColor)} shadow-lg shadow-${getColorName(item.activeColor)}/30` 
                    : 'bg-[#1e2435]/50'
                }`}>
                  <Icon 
                    className={`w-5 h-5 transition-colors duration-300 ${
                      active ? 'text-white' : 'text-gray-400'
                    }`} 
                  />
                </div>
                <span className={`text-[10px] font-semibold mt-1.5 transition-colors duration-300 truncate max-w-full ${
                  active ? item.activeColor : 'text-gray-500'
                }`}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
        
        {/* Safe area for iOS devices */}
        <div className="h-safe-area-inset-bottom bg-gradient-to-t from-[#0F1419] to-transparent" />
      </div>
    </div>
  )
}

function getGradientColors(activeColor: string): string {
  switch (activeColor) {
    case 'text-blue-500':
      return 'from-blue-500 to-blue-600'
    case 'text-green-500':
      return 'from-green-500 to-emerald-600'
    case 'text-red-500':
      return 'from-red-500 to-pink-600'
    case 'text-purple-500':
      return 'from-purple-500 to-purple-600'
    case 'text-orange-500':
      return 'from-orange-500 to-amber-600'
    case 'text-pink-500':
      return 'from-pink-500 to-rose-600'
    default:
      return 'from-blue-500 to-blue-600'
  }
}

function getColorName(activeColor: string): string {
  switch (activeColor) {
    case 'text-blue-500':
      return 'blue-500'
    case 'text-green-500':
      return 'green-500'
    case 'text-red-500':
      return 'red-500'
    case 'text-purple-500':
      return 'purple-500'
    case 'text-orange-500':
      return 'orange-500'
    case 'text-pink-500':
      return 'pink-500'
    default:
      return 'blue-500'
  }
}