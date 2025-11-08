'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  TrendingUp, 
  Plus, 
  BarChart3, 
  FileText, 
  User, 
  Wallet,
  LogOut,
  TrendingDown
} from 'lucide-react';

interface DesktopSidebarProps {
  balance?: number;
}

export default function DesktopSidebar({ balance = 0 }: DesktopSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navigationItems = [
    {
      name: 'Trading',
      path: '/dashboard',
      icon: TrendingUp,
      active: pathname === '/dashboard'
    },
    {
      name: 'Deposit',
      path: '/deposit',
      icon: Plus,
      active: pathname === '/deposit'
    },
    {
      name: 'Withdraw',
      path: '/withdraw',
      icon: TrendingDown,
      active: pathname === '/withdraw'
    },
    {
      name: 'Portfolio',
      path: '/portfolio',
      icon: BarChart3,
      active: pathname === '/portfolio'
    },
    {
      name: 'History',
      path: '/history',
      icon: FileText,
      active: pathname === '/history'
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: User,
      active: pathname === '/profile'
    }
  ];

  return (
    <aside className="hidden lg:flex lg:flex-col lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:w-64 lg:bg-gradient-to-b lg:from-[#12192A] lg:to-[#0F1419] lg:border-r lg:border-[#1e2435] lg:z-40">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-[#1e2435]">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">PocketOption</h1>
            <p className="text-xs text-gray-400">Trading Platform</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-[#1e2435]">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#12192A]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">{user?.email}</p>
            <p className="text-xs text-gray-400">Active Trader</p>
          </div>
        </div>
        
        {/* Balance Display */}
        <div className="mt-3 p-3 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg border border-green-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Balance</span>
            <Wallet className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-lg font-bold text-white">${balance.toLocaleString()}</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`
                w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                ${item.active 
                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30 shadow-lg shadow-blue-500/10' 
                  : 'hover:bg-white/5 text-gray-400 hover:text-white hover:border hover:border-white/10'
                }
              `}
            >
              <div className={`p-2 rounded-lg ${item.active ? 'bg-blue-500/20' : 'bg-white/5'}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold">{item.name}</span>
              {item.active && (
                <div className="ml-auto w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-[#1e2435]">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}