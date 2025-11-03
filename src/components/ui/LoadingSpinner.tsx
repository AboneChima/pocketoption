import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  color?: 'primary' | 'white' | 'gray'
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className,
  color = 'primary'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  const colorClasses = {
    primary: 'border-purple-500',
    white: 'border-white',
    gray: 'border-gray-400'
  }

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-transparent',
        sizeClasses[size],
        `${colorClasses[color]} border-t-current`,
        className
      )}
    />
  )
}

interface PageLoaderProps {
  message?: string
}

export const PageLoader: React.FC<PageLoaderProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="relative">
          {/* Outer ring */}
          <div className="w-16 h-16 border-4 border-purple-500/20 rounded-full animate-spin">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
          </div>
          
          {/* Inner ring */}
          <div className="absolute top-2 left-2 w-12 h-12 border-4 border-pink-500/20 rounded-full animate-spin" style={{ animationDirection: 'reverse' }}>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-pink-500 rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>
          </div>
        </div>
        
        <p className="text-white mt-4 text-lg font-medium">{message}</p>
        <div className="flex justify-center mt-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce animation-delay-200"></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce animation-delay-400"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className, 
  variant = 'rectangular' 
}) => {
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded'
  }

  return (
    <div
      className={cn(
        'animate-pulse bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 bg-[length:200%_100%] animate-shimmer',
        variantClasses[variant],
        className
      )}
    />
  )
}