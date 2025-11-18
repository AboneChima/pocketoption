'use client'

import { usePathname } from 'next/navigation'
import { AuthProvider } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'

export function ConditionalAuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  // Check if current route is admin route
  // Also check window.location as fallback for SSR issues
  const isAdminRoute = pathname?.startsWith('/admin') || 
    (isClient && typeof window !== 'undefined' && window.location.pathname.startsWith('/admin'))
  
  console.log('ConditionalAuthProvider:', { 
    pathname, 
    windowPath: isClient && typeof window !== 'undefined' ? window.location.pathname : 'N/A',
    isAdminRoute
  })
  
  // Don't wrap admin routes with AuthProvider
  if (isAdminRoute) {
    console.log('✅ Admin route detected, skipping AuthProvider')
    return <>{children}</>
  }
  
  // Wrap all other routes with AuthProvider
  console.log('📱 Regular route, using AuthProvider')
  return <AuthProvider>{children}</AuthProvider>
}
