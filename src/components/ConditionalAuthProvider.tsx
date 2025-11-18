'use client'

import { usePathname } from 'next/navigation'
import { AuthProvider } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'

export function ConditionalAuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isClient, setIsClient] = useState(false)
  const [shouldUseAuth, setShouldUseAuth] = useState(true)
  
  useEffect(() => {
    setIsClient(true)
    
    // Check if we're on an admin route
    if (typeof window !== 'undefined') {
      const path = window.location.pathname
      const isAdmin = path.startsWith('/admin')
      setShouldUseAuth(!isAdmin)
      
      console.log('ConditionalAuthProvider mounted:', { 
        pathname: path,
        isAdmin,
        shouldUseAuth: !isAdmin
      })
    }
  }, [])
  
  // Check if current route is admin route
  const isAdminRoute = pathname?.startsWith('/admin')
  
  // Don't wrap admin routes with AuthProvider
  if (isAdminRoute || !shouldUseAuth) {
    console.log('✅ Admin route detected, skipping AuthProvider')
    return <>{children}</>
  }
  
  // Wrap all other routes with AuthProvider
  console.log('📱 Regular route, using AuthProvider')
  return <AuthProvider>{children}</AuthProvider>
}
