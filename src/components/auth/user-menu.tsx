'use client'

import { Button } from '@/components/ui/button'
import { User } from 'lucide-react'

export function UserMenu() {
  const handleSignOut = () => {
    // For now, just redirect to login
    window.location.href = '/auth/login'
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-700">Alex (Provider)</span>
      <Button variant="ghost" size="sm" onClick={handleSignOut}>
        <User className="h-4 w-4" />
      </Button>
    </div>
  )
}
