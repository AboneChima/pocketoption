'use client'

import React, { useState } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  icon,
  rightIcon,
  className = '', 
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const [hasValue, setHasValue] = useState(false)

  const handleFocus = () => setIsFocused(true)
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false)
    setHasValue(e.target.value.length > 0)
    props.onBlur?.(e)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(e.target.value.length > 0)
    props.onChange?.(e)
  }

  const hasLeftIcon = !!icon
  const hasRightIcon = !!rightIcon

  return (
    <div className="w-full">
      <div className="relative">
        {/* Left Icon */}
        {hasLeftIcon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-gray-400 transition-colors duration-300">
            {icon}
          </div>
        )}

        {/* Right Icon */}
        {hasRightIcon && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-gray-400 transition-colors duration-300">
            {rightIcon}
          </div>
        )}

        {label && (
          <label 
            className={`
              absolute transition-all duration-300 ease-in-out pointer-events-none z-10
              ${hasLeftIcon ? 'left-12' : 'left-4'}
              ${isFocused || hasValue || props.value
                ? 'top-2 text-xs text-blue-400 font-medium' 
                : 'top-1/2 -translate-y-1/2 text-sm text-gray-400'
              }
              ${error ? 'text-red-400' : ''}
            `}
          >
            {label}
          </label>
        )}
        <input
          className={`
            w-full py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl
            text-white placeholder-transparent transition-all duration-300 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50
            focus:bg-white/15 hover:bg-white/12
            disabled:bg-gray-500/20 disabled:text-gray-400 disabled:cursor-not-allowed
            ${error 
              ? 'border-red-400/50 focus:ring-red-400/50 focus:border-red-400/50' 
              : ''
            }
            ${hasLeftIcon ? 'pl-12' : 'pl-4'}
            ${hasRightIcon ? 'pr-12' : 'pr-4'}
            ${label ? (isFocused || hasValue || props.value ? 'pt-6 pb-2' : 'pt-4 pb-4') : 'py-4'}
            ${className}
          `}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          {...props}
        />
        
        {/* Animated border effect */}
        <div 
          className={`
            absolute inset-0 rounded-xl pointer-events-none transition-all duration-300
            ${isFocused 
              ? 'ring-2 ring-blue-400/30 ring-offset-2 ring-offset-transparent' 
              : ''
            }
          `}
        />
      </div>
      
      {error && (
        <div className="mt-2 flex items-center space-x-2">
          <div className="w-1 h-1 bg-red-400 rounded-full animate-pulse" />
          <p className="text-sm text-red-400 font-medium animate-fade-in">
            {error}
          </p>
        </div>
      )}
    </div>
  )
}