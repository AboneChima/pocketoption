'use client'

import { usePathname } from 'next/navigation'
import { AuthProvider } from '@/contexts/AuthContext'

export function ConditionalAuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')
  
  // Don't wrap admin routes with AuthProvider
  if (isAdminRoute) {
    return <>{children}</>
  }
  
  // Wrap all other routes with AuthProvider
  return <AuthProvider>{children}</AuthProvider>
}
