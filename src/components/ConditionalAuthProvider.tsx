'use client'

import { usePathname } from 'next/navigation'
import { AuthProvider } from '@/contexts/AuthContext'

export function ConditionalAuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Check if current route is admin route
  const isAdminRoute = pathname?.startsWith('/admin')
  
  console.log('ConditionalAuthProvider:', { 
    pathname, 
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
