"use client"
import React from 'react'
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  TrendingUp,
  UserPlus,
  ShoppingCart,
  Award,
  Activity
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import AdminDashboardLayout from '@/components/dashboard/AdminDashboardLayout'
import { useAdminData } from '@/lib/hooks/useAdminData'

const AdminDashboard = () => {
  const { stats, recentUsers, recentPayments, loading, error } = useAdminData()

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      change: "+12%",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString()} USD`,
      change: "+23%",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Active Courses",
      value: stats.activeCourses,
      change: "+5",
      icon: BookOpen,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "Active Affiliates",
      value: stats.activeAffiliates,
      change: "+8%",
      icon: Award,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    }
  ]

  return (
    <AdminDashboardLayout title="Admin Dashboard">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {loading ? '...' : stat.value}
                  </p>
                  <p className="text-sm text-green-600 mt-1">{stat.change} from last month</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-full`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center text-gray-500">
                <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Revenue chart will be displayed here</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Growth */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>User growth chart will be displayed here</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : recentUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <UserPlus className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No recent users</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#ed874a] rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {user.full_name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.full_name || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.role === 'affiliate' ? 'bg-orange-100 text-orange-700' :
                      user.role === 'learner' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : recentPayments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No recent payments</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{payment.reference || 'N/A'}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ${((payment as any).base_currency_amount || (payment.currency === 'USD' ? payment.amount : payment.amount / 10)).toFixed(2)} USD
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        payment.status === 'completed' ? 'bg-green-100 text-green-700' :
                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  )
}

export default AdminDashboard
