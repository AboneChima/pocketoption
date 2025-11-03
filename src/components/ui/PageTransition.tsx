'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { PageLoader } from './LoadingSpinner'

interface PageTransitionProps {
  children: React.ReactNode
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)
  const [displayChildren, setDisplayChildren] = useState(children)

  useEffect(() => {
    setIsLoading(true)
    
    const timer = setTimeout(() => {
      setDisplayChildren(children)
      setIsLoading(false)
    }, 300) // Short delay for smooth transition

    return () => clearTimeout(timer)
  }, [pathname, children])

  if (isLoading) {
    return <PageLoader message="Loading page..." />
  }

  return (
    <div className="animate-fade-in-up">
      {displayChildren}
    </div>
  )
}

interface FadeTransitionProps {
  children: React.ReactNode
  show: boolean
  className?: string
}

export const FadeTransition: React.FC<FadeTransitionProps> = ({ 
  children, 
  show, 
  className = '' 
}) => {
  return (
    <div
      className={`transition-all duration-300 ease-in-out ${
        show 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-4 pointer-events-none'
      } ${className}`}
    >
      {children}
    </div>
  )
}

interface SlideTransitionProps {
  children: React.ReactNode
  show: boolean
  direction?: 'left' | 'right' | 'up' | 'down'
  className?: string
}

export const SlideTransition: React.FC<SlideTransitionProps> = ({ 
  children, 
  show, 
  direction = 'right',
  className = '' 
}) => {
  const directionClasses = {
    left: show ? 'translate-x-0' : '-translate-x-full',
    right: show ? 'translate-x-0' : 'translate-x-full',
    up: show ? 'translate-y-0' : '-translate-y-full',
    down: show ? 'translate-y-0' : 'translate-y-full'
  }

  return (
    <div
      className={`transition-transform duration-300 ease-in-out ${
        directionClasses[direction]
      } ${className}`}
    >
      {children}
    </div>
  )
}