'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  className = '',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  ...props
}) => {
  const baseClasses = `
    relative inline-flex items-center justify-center font-semibold rounded-xl
    transition-all duration-300 ease-in-out transform
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent
    disabled:cursor-not-allowed disabled:opacity-50 disabled:transform-none
    hover:scale-105 active:scale-95
  `

  const variants = {
    primary: `
      bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700
      text-white shadow-lg hover:shadow-xl focus:ring-blue-400/50
      border border-blue-500/20
    `,
    secondary: `
      bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800
      text-white shadow-lg hover:shadow-xl focus:ring-gray-400/50
      border border-gray-500/20
    `,
    success: `
      bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700
      text-white shadow-lg hover:shadow-xl focus:ring-green-400/50
      border border-green-500/20
    `,
    danger: `
      bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700
      text-white shadow-lg hover:shadow-xl focus:ring-red-400/50
      border border-red-500/20
    `,
    outline: `
      bg-white/10 backdrop-blur-md hover:bg-white/20
      text-white border border-white/30 hover:border-white/50
      focus:ring-white/30 shadow-md hover:shadow-lg
    `,
    ghost: `
      bg-transparent hover:bg-white/10
      text-white border border-transparent
      focus:ring-white/30
    `
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm min-h-[36px]',
    md: 'px-6 py-3 text-base min-h-[44px]',
    lg: 'px-8 py-4 text-lg min-h-[52px]'
  }

  return (
    <button
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}
      
      <span className={`flex items-center space-x-2 ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}>
        {children}
      </span>
      
      {/* Shine effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 transform -skew-x-12" />
    </button>
  )
}