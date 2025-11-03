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
  Settings
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
    id: 'portfolio',
    label: 'Portfolio',
    icon: BarChart3,
    path: '/portfolio',
    color: 'text-gray-400',
    activeColor: 'text-green-500'
  },
  {
    id: 'topup',
    label: 'Top Up',
    icon: Plus,
    path: '/topup',
    color: 'text-gray-400',
    activeColor: 'text-purple-500'
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
    if (item.id === 'topup') {
      // Handle top-up modal or page
      router.push('/topup')
    } else {
      router.push(item.path)
    }
  }

  const isActive = (item: NavItem) => {
    if (item.path === '/dashboard' && pathname === '/dashboard') return true
    if (item.path !== '/dashboard' && pathname.startsWith(item.path)) return true
    return false
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      {/* Background with blur effect */}
      <div className="bg-gray-900/95 backdrop-blur-md border-t border-gray-800">
        <div className="flex items-center justify-around py-2 px-4 max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item)
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-0 flex-1 ${
                  active 
                    ? 'bg-white/10 scale-105' 
                    : 'hover:bg-white/5 active:scale-95'
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-colors duration-200 ${
                  active 
                    ? `bg-gradient-to-r ${getGradientColors(item.activeColor)} shadow-lg` 
                    : 'bg-transparent'
                }`}>
                  <Icon 
                    className={`w-5 h-5 transition-colors duration-200 ${
                      active ? 'text-white' : item.color
                    }`} 
                  />
                </div>
                <span className={`text-xs font-medium mt-1 transition-colors duration-200 truncate ${
                  active ? item.activeColor : item.color
                }`}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function getGradientColors(activeColor: string): string {
  switch (activeColor) {
    case 'text-blue-500':
      return 'from-blue-500 to-blue-600'
    case 'text-green-500':
      return 'from-green-500 to-green-600'
    case 'text-purple-500':
      return 'from-purple-500 to-purple-600'
    case 'text-orange-500':
      return 'from-orange-500 to-orange-600'
    case 'text-pink-500':
      return 'from-pink-500 to-pink-600'
    default:
      return 'from-blue-500 to-blue-600'
  }
}