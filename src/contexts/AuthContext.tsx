'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { mockApi, mockData } from '@/lib/mockData'

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
  login: (email: string, password: string) => Promise<{success: boolean, message?: string}>
  register: (data: RegisterData) => Promise<{success: boolean, message?: string}>
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
  const router = useRouter()

  const refreshUser = async () => {
    try {
      // First, try to get user data from API
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const userData = await response.json()
        setUser({
          id: userData.id,
          email: userData.email,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          balance: userData.balance || 0, // Always use API balance
          isAdmin: userData.email === 'admin@pocketoption.com',
          kycStatus: 'verified',
          createdAt: userData.createdAt || new Date().toISOString(),
          phone: userData.phone || '',
          location: userData.location || ''
        })
        return
      }

      // Clear localStorage to remove old cached data
      localStorage.removeItem('pocketoption_current_user')
      localStorage.removeItem('pocketoption_users')
      
      // Fallback to localStorage for demo purposes, but ensure zero balance
      const currentUser = localStorage.getItem('pocketoption_current_user')
      if (currentUser) {
        const userData = JSON.parse(currentUser)
        // Force balance to 0 to override any old cached data
        userData.balance = 0
        localStorage.setItem('pocketoption_current_user', JSON.stringify(userData))
        
        setUser({
          id: userData.id,
          email: userData.email,
          firstName: userData.name?.split(' ')[0] || '',
          lastName: userData.name?.split(' ')[1] || '',
          balance: 0, // Always start with 0 balance
          isAdmin: userData.email === 'admin@pocketoption.com',
          kycStatus: 'verified',
          createdAt: userData.createdAt || new Date().toISOString(),
          phone: userData.phone || '',
          location: userData.country || ''
        })
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
      setUser(null)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      
      // Clear any existing localStorage data first
      localStorage.removeItem('pocketoption_current_user')
      localStorage.removeItem('pocketoption_users')
      
      // Try API first
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        })

        const result = await response.json()
        
        if (response.ok) {
          if (result.success && result.user) {
            // Use the actual balance from the API response
            const authenticatedUser = { 
              ...result.user, 
              balance: result.user.balance || 0 
            }
            setUser(authenticatedUser)
            localStorage.setItem('pocketoption_current_user', JSON.stringify(authenticatedUser))
            return { success: true }
          } else {
            return { success: false, message: result.message || 'Login failed' }
          }
        } else {
          return { success: false, message: result.message || 'Login failed' }
        }
      } catch (apiError) {
        // Fallback to mock API if API fails
      }

      // Fallback to mock API if API fails
      const result = await mockApi.login(email, password)
      if (result.success && result.user) {
        // Map mock user data to User interface structure
        const mappedUser: User = {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.name?.split(' ')[0] || '',
          lastName: result.user.name?.split(' ')[1] || '',
          balance: 0, // Always start with 0 balance
          isAdmin: result.user.email === 'admin@pocketoption.com',
          kycStatus: 'verified',
          createdAt: (result.user as any).createdAt || new Date().toISOString(),
          phone: (result.user as any).phone || '',
          location: result.user.location || ''
        }
        setUser(mappedUser)
        localStorage.setItem('pocketoption_current_user', JSON.stringify(mappedUser))
        return { success: true }
      } else {
        return { success: false, message: (result as any).message || 'Login failed' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: 'Login failed' }
    } finally {
      setLoading(false)
    }
  }

  const register = async (data: RegisterData) => {
    try {
      setLoading(true)
      
      // Clear any existing localStorage data first
      localStorage.removeItem('pocketoption_current_user')
      localStorage.removeItem('pocketoption_users')
      
      // Try API first
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })

        if (response.ok) {
          const result = await response.json()
          if (result.success && result.user) {
            const userWithZeroBalance = { ...result.user, balance: 0 }
            setUser(userWithZeroBalance)
            localStorage.setItem('pocketoption_current_user', JSON.stringify(userWithZeroBalance))
            return { success: true }
          }
        }
      } catch (apiError) {
        console.log('API registration failed, falling back to mock API')
      }

      // Fallback to mock API if API fails
      const result = await mockApi.register(data.firstName || '', data.email, data.password)
      if (result.success && result.user) {
        // Map mock user data to User interface structure
        const mappedUser: User = {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.name?.split(' ')[0] || data.firstName || '',
          lastName: result.user.name?.split(' ')[1] || data.lastName || '',
          balance: 0, // Always start with 0 balance
          isAdmin: result.user.email === 'admin@pocketoption.com',
          kycStatus: 'verified',
          createdAt: (result.user as any).createdAt || new Date().toISOString(),
          phone: (result.user as any).phone || '',
          location: result.user.location || ''
        }
        setUser(mappedUser)
        localStorage.setItem('pocketoption_current_user', JSON.stringify(mappedUser))
        return { success: true }
      } else {
        return { success: false, message: (result as any).message || 'Registration failed' }
      }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, message: 'Registration failed' }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await mockApi.logout()
      setUser(null)
      // Redirect to landing page after logout
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
      // Even if API fails, clear user state and redirect
      setUser(null)
      router.push('/')
    }
  }

  const updateBalance = async (amount: number) => {
    if (!user) return
    
    try {
      // Update balance locally and persist to localStorage
      const updatedUser = { ...user, balance: user.balance + amount }
      setUser(updatedUser)
      
      // Update the stored user data
      const currentUser = localStorage.getItem('pocketoption_current_user')
      if (currentUser) {
        const userData = JSON.parse(currentUser)
        userData.balance = updatedUser.balance
        localStorage.setItem('pocketoption_current_user', JSON.stringify(userData))
        
        // Also update in users array
        const users = localStorage.getItem('pocketoption_users')
        if (users) {
          const usersArray = JSON.parse(users)
          const userIndex = usersArray.findIndex((u: any) => u.id === userData.id)
          if (userIndex !== -1) {
            usersArray[userIndex].balance = updatedUser.balance
            localStorage.setItem('pocketoption_users', JSON.stringify(usersArray))
          }
        }
      }
      
      // Simulate API call for demo purposes
      await mockApi.getUserBalance()
    } catch (error) {
      console.error('Failed to update balance:', error)
      // Revert the change if needed
      setUser(user)
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