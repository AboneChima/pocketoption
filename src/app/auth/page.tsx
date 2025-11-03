'use client'

import { useState, useEffect } from 'react'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { TrendingUp, BarChart3, DollarSign, Shield, Zap, Globe } from 'lucide-react'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleMode = () => {
    setIsLogin(!isLogin)
  }

  const features = [
    {
      icon: TrendingUp,
      title: "Advanced Trading",
      description: "Professional trading tools and real-time market data"
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Bank-level security with encrypted transactions"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Execute trades in milliseconds with our optimized engine"
    },
    {
      icon: Globe,
      title: "Global Markets",
      description: "Access to worldwide financial markets 24/7"
    }
  ]

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>

      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Features */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-16">
          <div className="max-w-lg">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">PocketOption</h1>
                <p className="text-purple-300 text-sm">Professional Trading Platform</p>
              </div>
            </div>

            <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
              Trade with Confidence on the{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Future of Finance
              </span>
            </h2>

            <p className="text-gray-300 text-lg mb-12 leading-relaxed">
              Join millions of traders worldwide and experience the most advanced trading platform 
              with cutting-edge technology and unmatched security.
            </p>

            <div className="grid grid-cols-1 gap-6">
              {features.map((feature, index) => (
                <div 
                  key={feature.title}
                  className="flex items-start space-x-4 animate-fade-in-up"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <feature.icon className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                    <p className="text-gray-400 text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">10M+</div>
                <div className="text-gray-400 text-sm">Active Traders</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">$2.5B+</div>
                <div className="text-gray-400 text-sm">Daily Volume</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">150+</div>
                <div className="text-gray-400 text-sm">Countries</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Forms */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">PocketOption</h1>
              </div>
            </div>

            {/* Form Container */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
              <div className="transition-all duration-500 ease-in-out">
                {isLogin ? (
                  <LoginForm onToggleMode={toggleMode} />
                ) : (
                  <RegisterForm onToggleMode={toggleMode} />
                )}
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mt-6 flex items-center justify-center space-x-6 text-gray-400 text-xs">
              <div className="flex items-center space-x-1">
                <Shield className="w-3 h-3" />
                <span>SSL Secured</span>
              </div>
              <div className="flex items-center space-x-1">
                <DollarSign className="w-3 h-3" />
                <span>Regulated</span>
              </div>
              <div className="flex items-center space-x-1">
                <Globe className="w-3 h-3" />
                <span>Global Access</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}