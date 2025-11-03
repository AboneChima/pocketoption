'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react'

interface LoginFormProps {
  onToggleMode: () => void
}

export const LoginForm: React.FC<LoginFormProps> = ({ onToggleMode }) => {
  const { login } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    setErrors({})

    try {
      await login(formData.email, formData.password)
      
      // Show success message
      setSuccess(true)
      
      // Redirect to dashboard after 1.5 seconds
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
      
    } catch (error: any) {
      setErrors({ 
        general: error.message || 'Login failed. Please check your credentials.' 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Back to Home Button */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/')}
          className="text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-200 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
          Back to Home
        </Button>
      </div>

      {/* Header */}
      <div className="text-center mb-8 animate-fade-in-up">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
          <Lock className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
        <p className="text-gray-300">Sign in to your trading account</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up animation-delay-200">
        {success && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 animate-fade-in">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <p className="text-green-400 text-sm font-medium">
                Login successful! Redirecting to dashboard...
              </p>
            </div>
          </div>
        )}
        
        {errors.general && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 animate-shake">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              <p className="text-red-400 text-sm font-medium">{errors.general}</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <Input
            name="email"
            type="email"
            label="Email Address"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            icon={<Mail className="w-5 h-5" />}
            autoComplete="email"
          />

          <Input
            name="password"
            type={showPassword ? 'text' : 'password'}
            label="Password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            icon={<Lock className="w-5 h-5" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            }
            autoComplete="current-password"
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-400/50 focus:ring-offset-0"
            />
            <span className="text-gray-300">Remember me</span>
          </label>
          <button
            type="button"
            className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
          >
            Forgot password?
          </button>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          className="w-full group"
        >
          <span>Sign In</span>
          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/20" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-transparent text-gray-400">New to PocketOption?</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onToggleMode}
          className="w-full"
        >
          Create Account
        </Button>
      </form>

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-gray-400 animate-fade-in-up animation-delay-400">
        <p>By signing in, you agree to our</p>
        <div className="flex justify-center space-x-4 mt-1">
          <button className="hover:text-blue-400 transition-colors">Terms of Service</button>
          <span>•</span>
          <button className="hover:text-blue-400 transition-colors">Privacy Policy</button>
        </div>
      </div>
    </div>
  )
}