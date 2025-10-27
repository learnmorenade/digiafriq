"use client"
import React, { useState } from 'react'
import { 
  ShoppingCart, 
  TrendingUp,
  Users,
  Filter,
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import AffiliateDashboardLayout from '@/components/dashboard/AffiliateDashboardLayout'
import { useAffiliateData } from '@/lib/hooks/useAffiliateData'

const SalesActivityPage = () => {
  const { recentCommissions, loading, error } = useAffiliateData()
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  
  // Transform commissions data to match the table format
  const salesActivity = recentCommissions.map((commission, index) => ({
    id: commission.id.slice(0, 8).toUpperCase(),
    orderId: `ORD-${commission.id.slice(0, 12).toUpperCase()}`,
    date: new Date(commission.created_at).toLocaleDateString('en-US'),
    time: new Date(commission.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    customer: `Customer ${index + 1}`,
    email: '-',
    customerId: '-',
    commission: `${commission.amount.toFixed(2)} USD`,
    commissionRate: `${commission.commission_rate}%`,
    tier: 'Learner',
    status: commission.status === 'approved' ? 'Completed' : commission.status === 'pending' ? 'Processing' : 'Failed',
    statusColor: commission.status === 'approved' ? 'text-green-600 bg-green-100' : 
                 commission.status === 'pending' ? 'text-yellow-600 bg-yellow-100' : 
                 'text-red-600 bg-red-100'
  }))

  // const recentClicks = [
  //   {
  //     date: "2024-09-29",
  //     time: "10:30",
  //     source: "Facebook",
  //     course: "Digital Marketing Fundamentals",
  //     converted: false,
  //     ip: "192.168.1.1",
  //     device: "Mobile"
  //   },
  //   {
  //     date: "2024-09-29",
  //     time: "08:15",
  //     source: "Email",
  //     course: "Social Media Strategy",
  //     converted: false,
  //     ip: "192.168.1.2",
  //     device: "Desktop"
  //   },
  //   {
  //     date: "2024-09-28",
  //     time: "14:25",
  //     source: "Facebook",
  //     course: "Digital Marketing Fundamentals",
  //     converted: true,
  //     ip: "192.168.1.3",
  //     device: "Mobile"
  //   }
  // ]

  // const summaryStats = [
  //   {
  //     title: "Total Sales",
  //     value: "4",
  //     icon: ShoppingCart,
  //     color: "text-blue-600",
  //     bgColor: "bg-blue-100"
  //   },
  //   {
  //     title: "Sales Value",
  //     value: "450.00 USD",
  //     icon: TrendingUp,
  //     color: "text-green-600",
  //     bgColor: "bg-green-100"
  //   },
  //   {
  //     title: "Commission Earned",
  //     value: "45.00 USD",
  //     icon: TrendingUp,
  //     color: "text-purple-600",
  //     bgColor: "bg-purple-100"
  //   },
  //   {
  //     title: "Conversion Rate",
  //     value: "6.7%",
  //     icon: Users,
  //     color: "text-orange-600",
  //     bgColor: "bg-orange-100"
  //   }
  // ]

  // const topSources = [
  //   { source: "Facebook", sales: 2, percentage: 50 },
  //   { source: "Email Campaign", sales: 1, percentage: 25 },
  //   { source: "WhatsApp", sales: 1, percentage: 25 }
  // ]

  // Pagination logic
  const totalItems = salesActivity.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = salesActivity.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items)
    setCurrentPage(1) // Reset to first page when changing items per page
  }

  // const getStatusIcon = (status: string) => {
  //   switch (status) {
  //     case 'Completed':
  //       return <CheckCircle className="w-4 h-4 text-green-600" />
  //     case 'Processing':
  //       return <Clock className="w-4 h-4 text-yellow-600" />
  //     case 'Failed':
  //       return <AlertCircle className="w-4 h-4 text-red-600" />
  //     default:
  //       return <Clock className="w-4 h-4 text-gray-600" />
  //   }
  // }

  return (
    <AffiliateDashboardLayout title="Sales Activity">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Sales Activity</h1>
        </div>

        {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4 lg:p-6">
          <div className="flex flex-col lg:flex-row lg:flex-wrap items-start lg:items-center gap-4">
            <div className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-2 w-full lg:w-auto">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">From:</label>
              <input 
                type="date" 
                className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full lg:w-auto"
              />
            </div>
            <div className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-2 w-full lg:w-auto">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">To:</label>
              <input 
                type="date" 
                className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full lg:w-auto"
              />
            </div>
            <div className="flex flex-col lg:flex-row gap-2 w-full lg:w-auto">
              <Button className="bg-[#ed874a] hover:bg-[#d76f32] w-full lg:w-auto">
                <Filter className="w-4 h-4 mr-2" />
                Apply Filter
              </Button>
              <Button variant="outline" className="w-full lg:w-auto">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales Activity Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Detailed Sales Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#ed874a]" />
              <span className="ml-3 text-gray-600">Loading sales data...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-8 text-red-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-4" />
              <p>Error loading sales: {error}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && salesActivity.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No sales activity found</p>
              <p className="text-sm">Your commission earnings will appear here once you make referrals</p>
            </div>
          )}

          {/* Mobile Cards - Hidden on desktop */}
          {!loading && !error && salesActivity.length > 0 && (
          <div className="block lg:hidden p-4 space-y-4">
            {currentItems.map((sale) => (
              <div 
                key={sale.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">ID</span>
                    <span className="text-sm text-gray-600">{sale.id}</span>
                  </div>
                  
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-gray-900">Customer</span>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">{sale.customer}</div>
                      <div className="text-xs text-gray-500">{sale.email}</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">Order Id</span>
                    <span className="text-sm text-gray-600">{sale.orderId}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">Commission</span>
                    <span className="text-sm text-gray-600">{sale.commission}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">Tier</span>
                    <span className="text-sm text-gray-600">{sale.tier}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">Status</span>
                    <span className={`text-sm px-2 py-1 rounded text-xs font-medium ${sale.statusColor}`}>
                      {sale.status}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">Date</span>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">{sale.date} {sale.time}</div>
                      <div className="text-xs text-gray-500">1 month ago</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Mobile Total */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-900">Total Sales: {salesActivity.length} Orders</p>
              </div>
            </div>
          </div>
          )}

          {/* Desktop Table - Hidden on mobile */}
          {!loading && !error && salesActivity.length > 0 && (
          <div className="hidden lg:block overflow-x-scroll lg:overflow-x-visible" style={{ WebkitOverflowScrolling: 'touch' }}>
            <table className="w-full" style={{ minWidth: '700px', tableLayout: 'fixed' }}>
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-4 lg:px-6 font-medium text-sm text-gray-700" style={{ minWidth: '120px' }}>ID</th>
                  <th className="text-left py-3 px-4 lg:px-6 font-medium text-sm text-gray-700" style={{ minWidth: '150px' }}>Customer</th>
                  <th className="text-left py-3 px-4 lg:px-6 font-medium text-sm text-gray-700" style={{ minWidth: '140px' }}>Order ID</th>
                  <th className="text-left py-3 px-4 lg:px-6 font-medium text-sm text-gray-700" style={{ minWidth: '100px' }}>Tier</th>
                  <th className="text-left py-3 px-4 lg:px-6 font-medium text-sm text-gray-700" style={{ minWidth: '120px' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((sale, index) => (
                  <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 lg:px-6 text-sm text-gray-900 font-medium">{sale.id}</td>
                    <td className="py-4 px-4 lg:px-6 text-sm">
                      <div>
                        <div className="text-gray-900 font-medium">{sale.customer}</div>
                        <div className="text-gray-500 text-xs">{sale.email}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4 lg:px-6 text-sm text-gray-900">{sale.orderId}</td>
                    <td className="py-4 px-4 lg:px-6 text-sm text-gray-900">{sale.tier}</td>
                    <td className="py-4 px-4 lg:px-6 text-sm text-gray-900">{sale.date}</td>
                  </tr>
                ))}
                {/* Total Row */}
                <tr className="bg-gray-50 border-t-2 border-gray-200">
                  <td className="py-4 px-4 lg:px-6 text-sm text-gray-900 font-semibold" colSpan={2}>Total Sales</td>
                  <td className="py-4 px-4 lg:px-6 text-sm text-gray-900 font-semibold">{salesActivity.length} Orders</td>
                  <td className="py-4 px-4 lg:px-6 text-sm text-gray-900 font-semibold">-</td>
                  <td className="py-4 px-4 lg:px-6 text-sm text-gray-900 font-semibold">-</td>
                </tr>
              </tbody>
            </table>
          </div>
          )}

          {/* Pagination Controls */}
          {salesActivity.length > 0 && (
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-4 bg-gray-50 border-t border-gray-200">
              {/* Left side - Items per page */}
              <div className="flex items-center gap-2 text-sm text-gray-600 w-full lg:w-auto justify-center lg:justify-start">
                <span className="whitespace-nowrap">Items per page:</span>
                <select 
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  className="border border-gray-300 rounded px-2 py-1 text-sm bg-white min-w-[60px]"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              {/* Center - Page info */}
              <div className="text-sm text-gray-600 text-center lg:text-left">
                {startIndex + 1} - {Math.min(endIndex, totalItems)} of {totalItems} items
              </div>

              {/* Right side - Page navigation */}
              <div className="flex items-center gap-2 w-full lg:w-auto justify-center lg:justify-end">
                <select 
                  value={currentPage}
                  onChange={(e) => handlePageChange(Number(e.target.value))}
                  className="border border-gray-300 rounded px-2 py-1 text-sm bg-white min-w-[50px]"
                >
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <option key={page} value={page}>{page}</option>
                  ))}
                </select>
                <span className="text-sm text-gray-600 whitespace-nowrap">of {totalPages} pages</span>
                <div className="flex gap-1 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0 hover:bg-gray-200"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0 hover:bg-gray-200"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </AffiliateDashboardLayout>
  )
}

export default SalesActivityPage
