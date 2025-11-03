'use client'

import React from 'react'

interface UnifiedLoaderProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
  fullScreen?: boolean
  className?: string
}

export const UnifiedLoader: React.FC<UnifiedLoaderProps> = ({ 
  size = 'md', 
  message = 'Loading...',
  fullScreen = false,
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  const LoaderContent = () => (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      {/* Modern Spinner */}
      <div className="relative">
        <div className={`${sizeClasses[size]} border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin`}></div>
        <div className={`absolute inset-2 border-2 border-gray-700 border-b-purple-500 rounded-full animate-spin`} style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
      </div>
      
      {/* Loading Text */}
      <div className="text-center">
        <p className={`font-medium text-white ${textSizeClasses[size]} mb-1`}>
          {message}
        </p>
        <div className="flex space-x-1 justify-center">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-sm flex items-center justify-center z-50">
        <LoaderContent />
      </div>
    )
  }

  return <LoaderContent />
}

// Page-specific loader for full-screen loading
export const PageLoader: React.FC<{ message?: string }> = ({ message = 'Loading Dashboard...' }) => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <UnifiedLoader size="lg" message={message} />
    </div>
  )
}

export default UnifiedLoader