"use client"
import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/supabase/auth'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  DollarSign,
  FileText,
  Settings,
  Menu,
  X,
  LogOut,
  TrendingUp,
  Award,
  CreditCard,
  Bell
} from 'lucide-react'

interface AdminDashboardLayoutProps {
  children: React.ReactNode
  title?: string
  headerAction?: React.ReactNode
}

const AdminDashboardLayout: React.FC<AdminDashboardLayoutProps> = ({ children, title, headerAction }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['Content', 'Finance'])
  const pathname = usePathname()
  const router = useRouter()
  const { signOut } = useAuth()

  const menuItems = [
    { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard/admin" },
    { title: "Users", icon: Users, href: "/dashboard/admin/users" },
    { 
      title: "Content", 
      icon: BookOpen,
      submenu: [
        { title: "Courses", href: "/dashboard/admin/courses" },
        { title: "Tutorials", href: "/dashboard/admin/tutorials" },
        { title: "Categories", href: "/dashboard/admin/categories" }
      ]
    },
    { 
      title: "Finance", 
      icon: DollarSign,
      submenu: [
        { title: "Payments", href: "/dashboard/admin/payments" },
        { title: "Commissions", href: "/dashboard/admin/commissions" },
        { title: "Payouts", href: "/dashboard/admin/payouts" },
        { title: "Revenue", href: "/dashboard/admin/revenue" }
      ]
    },
    { title: "Analytics", icon: TrendingUp, href: "/dashboard/admin/analytics" },
    { title: "Reports", icon: FileText, href: "/dashboard/admin/reports" },
    { title: "Settings", icon: Settings, href: "/dashboard/admin/settings" },
    { title: "Log out", icon: LogOut, href: "#" }
  ]

  const handleLogout = async () => {
    try {
      console.log('🚪 Starting logout...')
      await signOut()
      console.log('✅ Logout complete, waiting before redirect...')
      // Wait a bit to ensure session is fully cleared
      await new Promise(resolve => setTimeout(resolve, 500))
      console.log('🔄 Redirecting to login...')
      router.push('/login')
    } catch (error) {
      console.error('❌ Logout error:', error)
      router.push('/login')
    }
  }

  const toggleMenu = (menuTitle: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuTitle) 
        ? prev.filter(item => item !== menuTitle)
        : [...prev, menuTitle]
    )
  }

  const isActive = (href: string) => pathname === href

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 fixed w-full z-30 top-0">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <div className="flex items-center ml-4 lg:ml-0">
                <GraduationCap className="h-8 w-8 text-[#ed874a]" />
                <span className="ml-2 text-xl font-bold text-gray-900">DigiAfriq Admin</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#ed874a] rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">A</span>
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">Admin</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-20 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full pt-20">
          <nav className="flex-1 px-4 pb-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <div key={item.title}>
                {item.submenu ? (
                  <div>
                    <button
                      onClick={() => toggleMenu(item.title)}
                      className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <div className="flex items-center">
                        <item.icon className="h-5 w-5 mr-3" />
                        <span className="font-medium">{item.title}</span>
                      </div>
                      <svg
                        className={`w-4 h-4 transition-transform ${
                          expandedMenus.includes(item.title) ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {expandedMenus.includes(item.title) && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.submenu.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={`block px-4 py-2 text-sm rounded-lg transition-colors ${
                              isActive(subItem.href)
                                ? 'bg-[#ed874a] text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {subItem.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : item.title === 'Log out' ? (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-3 rounded-lg transition-colors text-gray-700 hover:bg-gray-100"
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    <span className="font-medium">{item.title}</span>
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                      isActive(item.href)
                        ? 'bg-[#ed874a] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    <span className="font-medium">{item.title}</span>
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="lg:pl-64 pt-16">
        <main className="p-6">
          {title && (
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {headerAction && (
                <div className="flex items-center gap-2">
                  {headerAction}
                </div>
              )}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminDashboardLayout
