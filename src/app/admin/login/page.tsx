'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Admin credentials - In production, this should be in environment variables
  const ADMIN_EMAIL = 'admin@pocketoption.com'
  const ADMIN_PASSWORD = 'Admin@2024'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Store admin session
      localStorage.setItem('admin_authenticated', 'true')
      localStorage.setItem('admin_email', email)
      localStorage.setItem('admin_login_time', new Date().toISOString())
      
      // Redirect to admin dashboard
      router.push('/admin')
    } else {
      setError('Invalid admin credentials. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F1419] via-[#12192A] to-[#1A2332] flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 mb-4 shadow-2xl shadow-blue-500/25">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-gray-400">Secure access to management dashboard</p>
        </div>

        {/* Login Form */}
        <div className="bg-[#12192A]/80 backdrop-blur-xl rounded-2xl border border-[#1e2435] shadow-2xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="flex items-center space-x-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl animate-in fade-in duration-200">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@pocketoption.com"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-[#1e2435] border border-[#252d42] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                  className="w-full pl-12 pr-12 py-3 bg-[#1e2435] border border-[#252d42] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl text-white font-medium transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-blue-500/25"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </div>
              ) : (
                'Access Admin Dashboard'
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-400 font-medium mb-1">Secure Access</p>
                <p className="text-xs text-gray-400">
                  This portal is protected and monitored. All access attempts are logged.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Main Site
          </button>
        </div>

        {/* Demo Credentials Info */}
        <div className="mt-6 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
          <p className="text-xs text-yellow-400 font-medium mb-2">Demo Credentials:</p>
          <div className="space-y-1 text-xs text-gray-400 font-mono">
            <p>Email: admin@pocketoption.com</p>
            <p>Password: Admin@2024</p>
          </div>
        </div>
      </div>
    </div>
  )
}
