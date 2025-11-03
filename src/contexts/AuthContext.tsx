'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  balance: number
  isAdmin: boolean
  kycStatus: string
  createdAt: string
  phone?: string
  location?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  updateBalance: (amount: number) => Promise<void>
}

interface RegisterData {
  email: string
  password: string
  firstName?: string
  lastName?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
      setUser(null)
    }
  }

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Login failed')
    }

    const data = await response.json()
    setUser(data.user)
  }

  const register = async (data: RegisterData) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Registration failed')
    }

    const result = await response.json()
    setUser(result.user)
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      // Redirect to landing page after logout
      window.location.href = '/'
    } catch (error) {
      console.error('Logout error:', error)
      // Even if API fails, clear user state and redirect
      setUser(null)
      window.location.href = '/'
    }
  }

  const updateBalance = async (amount: number) => {
    if (!user) return
    
    try {
      // Update balance locally first for immediate UI feedback
      setUser(prev => prev ? { ...prev, balance: prev.balance + amount } : null)
      
      // Then sync with backend (optional for demo)
      const response = await fetch('/api/user/balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      })
      
      if (!response.ok) {
        // If backend fails, revert the local change
        setUser(prev => prev ? { ...prev, balance: prev.balance - amount } : null)
        throw new Error('Failed to update balance')
      }
    } catch (error) {
      console.error('Failed to update balance:', error)
      // Balance already reverted above if needed
    }
  }

  useEffect(() => {
    refreshUser().finally(() => setLoading(false))
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        updateBalance,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}