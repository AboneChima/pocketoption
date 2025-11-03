'use client'

import { UnifiedLoader } from './UnifiedLoader'

export function DashboardLoader() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <UnifiedLoader size="lg" message="Loading Dashboard..." />
    </div>
  )
}