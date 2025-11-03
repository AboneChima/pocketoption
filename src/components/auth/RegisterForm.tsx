'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Shield, ArrowLeft } from 'lucide-react'

interface RegisterFormProps {
  onToggleMode: () => void
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onToggleMode }) => {
  const { register } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
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
      await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email,
        password: formData.password
      })
      
      // Show success message
      setSuccess(true)
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        onToggleMode()
      }, 2000)
      
    } catch (error: any) {
      setErrors({ 
        general: error.message || 'Registration failed. Please try again.' 
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

  const getPasswordStrength = () => {
    const password = formData.password
    if (!password) return { strength: 0, label: '', color: '' }
    
    let strength = 0
    if (password.length >= 6) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^a-zA-Z\d]/.test(password)) strength++

    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500']
    
    return {
      strength: Math.min(strength, 5),
      label: labels[Math.min(strength - 1, 4)] || '',
      color: colors[Math.min(strength - 1, 4)] || 'bg-gray-500'
    }
  }

  const passwordStrength = getPasswordStrength()

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
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl mb-4 shadow-lg">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Join PocketOption</h2>
        <p className="text-gray-300">Create your trading account in seconds</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up animation-delay-200">
        {success && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 animate-fade-in">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <p className="text-green-400 text-sm font-medium">
                Account created successfully! Redirecting to sign in...
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

        <div className="grid grid-cols-2 gap-4">
          <Input
            name="firstName"
            type="text"
            label="First Name"
            value={formData.firstName}
            onChange={handleChange}
            error={errors.firstName}
            icon={<User className="w-5 h-5" />}
            autoComplete="given-name"
          />

          <Input
            name="lastName"
            type="text"
            label="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            error={errors.lastName}
            icon={<User className="w-5 h-5" />}
            autoComplete="family-name"
          />
        </div>

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

        <div className="space-y-2">
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
            autoComplete="new-password"
          />

          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="space-y-2">
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      level <= passwordStrength.strength
                        ? passwordStrength.color
                        : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
              {passwordStrength.label && (
                <p className="text-xs text-gray-400">
                  Password strength: <span className="text-white">{passwordStrength.label}</span>
                </p>
              )}
            </div>
          )}
        </div>

        <Input
          name="confirmPassword"
          type={showConfirmPassword ? 'text' : 'password'}
          label="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          icon={<Lock className="w-5 h-5" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          }
          autoComplete="new-password"
        />

        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="terms"
            required
            className="w-4 h-4 mt-1 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-400/50 focus:ring-offset-0"
          />
          <label htmlFor="terms" className="text-sm text-gray-300 leading-relaxed">
            I agree to the{' '}
            <button type="button" className="text-blue-400 hover:text-blue-300 transition-colors">
              Terms of Service
            </button>{' '}
            and{' '}
            <button type="button" className="text-blue-400 hover:text-blue-300 transition-colors">
              Privacy Policy
            </button>
          </label>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          className="w-full group"
        >
          <span>Create Account</span>
          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/20" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-transparent text-gray-400">Already have an account?</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onToggleMode}
          className="w-full"
        >
          Sign In
        </Button>
      </form>

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-gray-400 animate-fade-in-up animation-delay-400">
        <p>🔒 Your information is secure and encrypted</p>
      </div>
    </div>
  )
}