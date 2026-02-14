'use client'

import { useState } from 'react'
import { PortalSidebar } from '@/components/portal/sidebar'
import { PortalHeader } from '@/components/portal/header'

// ============================================
// Types
// ============================================

interface PortalLayoutShellProps {
  userName: string
  userEmail: string
  userAvatarUrl: string | null
  children: React.ReactNode
}

// ============================================
// Portal Layout Shell (Client)
// ============================================

export function PortalLayoutShell({
  userName,
  userEmail,
  userAvatarUrl,
  children,
}: PortalLayoutShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <PortalSidebar
        userName={userName}
        userEmail={userEmail}
        userAvatarUrl={userAvatarUrl}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-72">
        {/* Header */}
        <PortalHeader
          userName={userName}
          userEmail={userEmail}
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
        />

        {/* Page Content */}
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}
