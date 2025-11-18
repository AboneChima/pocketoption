'use client'

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Admin login doesn't need any auth wrapper
  return <>{children}</>
}
