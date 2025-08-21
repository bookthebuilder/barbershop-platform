'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { UserMenu } from '@/components/auth/user-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  Calendar,
  Clock,
  DollarSign,
  Settings,
  Star,
  Users,
  Menu,
  Home,
  Image as ImageIcon,
  BarChart3,
  MessageSquare
} from 'lucide-react'

const navigation = [
  { name: 'Overview', href: '/provider', icon: Home },
  { name: 'Schedule', href: '/provider/schedule', icon: Calendar },
  { name: 'Appointments', href: '/provider/appointments', icon: Clock },
  { name: 'Clients', href: '/provider/clients', icon: Users },
  { name: 'Portfolio', href: '/provider/portfolio', icon: ImageIcon },
  { name: 'Reviews', href: '/provider/reviews', icon: Star },
  { name: 'Analytics', href: '/provider/analytics', icon: BarChart3 },
  { name: 'Messages', href: '/provider/messages', icon: MessageSquare },
  { name: 'Earnings', href: '/provider/earnings', icon: DollarSign },
  { name: 'Settings', href: '/provider/settings', icon: Settings },
]

interface ProviderLayoutProps {
  children: React.ReactNode
}

export function ProviderLayout({ children }: ProviderLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 shadow-sm border-r">
          <div className="flex h-16 shrink-0 items-center">
            <h1 className="text-xl font-bold text-gray-900">Provider Portal</h1>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={cn(
                            "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold",
                            isActive
                              ? "bg-blue-50 text-blue-700"
                              : "text-gray-700 hover:text-blue-700 hover:bg-blue-50"
                          )}
                        >
                          <item.icon
                            className={cn(
                              "h-6 w-6 shrink-0",
                              isActive ? "text-blue-700" : "text-gray-400 group-hover:text-blue-700"
                            )}
                          />
                          {item.name}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile navigation */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-white px-4 py-4 shadow-sm sm:px-6 lg:hidden">
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="-m-2.5 p-2.5 text-gray-700 lg:hidden">
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <div className="flex-1 text-sm font-semibold leading-6 text-gray-900">
            Provider Portal
          </div>
          <UserMenu />
        </div>

        <SheetContent side="left" className="w-72 p-0">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
            <div className="flex h-16 shrink-0 items-center">
              <h1 className="text-xl font-bold text-gray-900">Provider Portal</h1>
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item) => {
                      const isActive = pathname === item.href
                      return (
                        <li key={item.name}>
                          <Link
                            href={item.href}
                            className={cn(
                              "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold",
                              isActive
                                ? "bg-blue-50 text-blue-700"
                                : "text-gray-700 hover:text-blue-700 hover:bg-blue-50"
                            )}
                            onClick={() => setSidebarOpen(false)}
                          >
                            <item.icon
                              className={cn(
                                "h-6 w-6 shrink-0",
                                isActive ? "text-blue-700" : "text-gray-400 group-hover:text-blue-700"
                              )}
                            />
                            {item.name}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </li>
              </ul>
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top navigation for desktop */}
        <div className="sticky top-0 z-40 hidden lg:mx-auto lg:flex lg:max-w-none lg:items-center lg:justify-end lg:gap-x-4 lg:px-8 lg:py-4 lg:bg-white lg:shadow-sm lg:border-b">
          <UserMenu />
        </div>

        {/* Page content */}
        <main className="px-4 py-10 sm:px-6 lg:px-8 lg:py-6">
          {children}
        </main>
      </div>
    </div>
  )
}
