"use client"
import React, { useState } from 'react'
import { 
  Activity, 
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  Download,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import AffiliateDashboardLayout from '@/components/dashboard/AffiliateDashboardLayout'
import { useAffiliateData } from '@/lib/hooks/useAffiliateData'

const TransactionsPage = () => {
  const { recentCommissions, recentPayouts, loading, error } = useAffiliateData()
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [typeFilter, setTypeFilter] = useState('All Types')
  const [statusFilter, setStatusFilter] = useState('All Status')

  // Combine commissions and payouts into transactions
  const allTransactions = [
    ...recentCommissions.map(commission => ({
      id: commission.id.slice(0, 10).toUpperCase(),
      date: new Date(commission.created_at).toLocaleDateString('en-US'),
      type: 'Commission Earned',
      description: `Commission earned - ${commission.status}`,
      amount: `+${commission.amount.toFixed(2)} USD`,
      status: commission.status === 'approved' ? 'Completed' : commission.status === 'pending' ? 'Pending' : 'Failed',
      statusColor: commission.status === 'approved' ? 'text-gray-700 bg-gray-100' : 
                   commission.status === 'pending' ? 'text-yellow-600 bg-yellow-100' : 
                   'text-red-600 bg-red-100',
      category: 'commission',
      reference: commission.id.slice(0, 12).toUpperCase()
    })),
    ...recentPayouts.map(payout => ({
      id: payout.id.slice(0, 10).toUpperCase(),
      date: new Date(payout.created_at).toLocaleDateString('en-US'),
      type: payout.status === 'completed' ? 'Withdrawal' : 'Withdrawal Processing',
      description: `Payout ${payout.status}${payout.reference ? ` - Ref: ${payout.reference}` : ''}`,
      amount: `-${payout.amount.toFixed(2)} USD`,
      status: payout.status === 'completed' ? 'Completed' : 
              payout.status === 'processing' ? 'Processing' : 
              payout.status === 'pending' ? 'Pending' : 'Failed',
      statusColor: payout.status === 'completed' ? 'text-gray-700 bg-gray-100' : 
                   payout.status === 'processing' ? 'text-blue-600 bg-blue-100' : 
                   payout.status === 'pending' ? 'text-yellow-600 bg-yellow-100' : 
                   'text-red-600 bg-red-100',
      category: 'withdrawal',
      reference: payout.reference || payout.id.slice(0, 12).toUpperCase()
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const transactions = allTransactions.length > 0 ? allTransactions : [
    {
      id: "TXN001234",
      date: "2024-09-28",
      type: "Commission Earned",
      description: "Commission from John Doe referral - Digital Marketing Fundamentals",
      amount: "+10.00 USD",
      status: "Completed",
      statusColor: "text-gray-700 bg-gray-100",
      category: "commission",
      reference: "REF-DM-001"
    },
    {
      id: "TXN001235",
      date: "2024-09-27",
      type: "Withdrawal",
      description: "Withdrawal to Bank Account - **** 1234",
      amount: "-40.00 USD",
      status: "Processing",
      statusColor: "text-yellow-600 bg-yellow-100",
      category: "withdrawal",
      reference: "WD001234"
    },
    {
      id: "TXN001236",
      date: "2024-09-25",
      type: "Commission Earned",
      description: "Commission from Jane Smith referral - Social Media Strategy",
      amount: "+15.00 USD",
      status: "Completed",
      statusColor: "text-gray-700 bg-gray-100",
      category: "commission",
      reference: "REF-SM-002"
    },
    {
      id: "TXN001237",
      date: "2024-09-24",
      type: "Withdrawal Fee",
      description: "PayPal withdrawal fee",
      amount: "-0.63 USD",
      status: "Completed",
      statusColor: "text-gray-700 bg-gray-100",
      category: "fee",
      reference: "WD001233"
    },
    {
      id: "TXN001238",
      date: "2024-09-20",
      type: "Commission Earned",
      description: "Commission from Mike Johnson referral - Content Creation Mastery",
      amount: "+12.00 USD",
      status: "Completed",
      statusColor: "text-gray-700 bg-gray-100",
      category: "commission",
      reference: "REF-CC-003"
    },
    {
      id: "TXN001239",
      date: "2024-09-18",
      type: "Commission Pending",
      description: "Commission from Sarah Wilson referral - Email Marketing Pro",
      amount: "+8.00 USD",
      status: "Pending",
      statusColor: "text-yellow-600 bg-yellow-100",
      category: "commission",
      reference: "REF-EM-004"
    },
    {
      id: "TXN001240",
      date: "2024-09-15",
      type: "Commission Rejected",
      description: "Commission rejected - Customer refund",
      amount: "-20.00 USD",
      status: "Rejected",
      statusColor: "text-red-600 bg-red-100",
      category: "commission",
      reference: "REF-SEO-005"
    },
    {
      id: "TXN001241",
      date: "2024-09-10",
      type: "Withdrawal",
      description: "Withdrawal to PayPal - ****@email.com",
      amount: "-25.00 USD",
      status: "Completed",
      statusColor: "text-gray-700 bg-gray-100",
      category: "withdrawal",
      reference: "WD001235"
    }
  ]

  // const summaryStats = [
  //   {
  //     title: "Total Income",
  //     value: "+45.00 USD",
  //     icon: ArrowUpRight,
  //     color: "text-green-600",
  //     bgColor: "bg-green-100"
  //   },
  //   {
  //     title: "Total Outgoing",
  //     value: "-85.63 USD",
  //     icon: ArrowDownLeft,
  //     color: "text-red-600",
  //     bgColor: "bg-red-100"
  //   },
  //   {
  //     title: "Net Balance",
  //     value: "-40.63 USD",
  //     icon: DollarSign,
  //     color: "text-gray-600",
  //     bgColor: "bg-gray-100"
  //   },
  //   {
  //     title: "This Month",
  //     value: "8 transactions",
  //     icon: Activity,
  //     color: "text-blue-600",
  //     bgColor: "bg-blue-100"
  //   }
  // ]

  // Filter transactions based on selected filters
  const filteredTransactions = transactions.filter(transaction => {
    const matchesType = typeFilter === 'All Types' || transaction.type.includes(typeFilter.replace(' Earned', ''))
    const matchesStatus = statusFilter === 'All Status' || transaction.status === statusFilter
    
    let matchesDate = true
    if (dateFrom && dateTo) {
      const transactionDate = new Date(transaction.date)
      const fromDate = new Date(dateFrom)
      const toDate = new Date(dateTo)
      matchesDate = transactionDate >= fromDate && transactionDate <= toDate
    }
    
    return matchesType && matchesStatus && matchesDate
  })

  const getTransactionIcon = (type: string) => {
    if (type.includes('Commission') || type.includes('Earned')) {
      return <ArrowUpRight className="w-5 h-5 text-gray-600" />
    } else if (type.includes('Withdrawal') || type.includes('Fee')) {
      return <ArrowDownLeft className="w-5 h-5 text-gray-600" />
    } else {
      return <Activity className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="w-4 h-4 text-gray-600" />
      case 'Pending':
        return <Clock className="w-4 h-4 text-gray-600" />
      case 'Processing':
        return <Clock className="w-4 h-4 text-gray-600" />
      case 'Rejected':
        return <XCircle className="w-4 h-4 text-gray-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <AffiliateDashboardLayout title="Transaction History">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Transaction History</h1>
        </div>

        {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">From:</label>
              <input 
                type="date" 
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="border border-gray-200 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">To:</label>
              <input 
                type="date" 
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="border border-gray-200 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-gray-200 rounded-md px-3 py-2 text-sm"
            >
              <option>All Types</option>
              <option>Commission</option>
              <option>Withdrawal</option>
              <option>Fee</option>
            </select>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-200 rounded-md px-3 py-2 text-sm"
            >
              <option>All Status</option>
              <option>Completed</option>
              <option>Pending</option>
              <option>Processing</option>
              <option>Rejected</option>
            </select>
            <Button className="bg-[#ed874a] hover:bg-[#d76f32] text-white">
              <Filter className="w-4 h-4 mr-2" />
              Apply Filter
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">All Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#ed874a]" />
              <span className="ml-3 text-gray-600">Loading transactions...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-8 text-red-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-4" />
              <p>Error loading transactions: {error}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && allTransactions.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No transactions found</p>
              <p className="text-sm">Your commissions and payouts will appear here</p>
            </div>
          )}

          {/* Mobile Cards - Hidden on desktop */}
          {!loading && !error && allTransactions.length > 0 && (
          <div className="block lg:hidden p-4 space-y-4">
            {filteredTransactions.map((transaction) => (
              <div 
                key={transaction.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">ID</span>
                    <span className="text-sm text-gray-600">{transaction.id}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">Type</span>
                    <span className="text-sm text-gray-600">{transaction.type}</span>
                  </div>
                  
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-gray-900">Description</span>
                    <div className="text-right max-w-[200px]">
                      <div className="text-sm text-gray-600">{transaction.description}</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">Amount</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {transaction.amount}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">Reference</span>
                    <span className="text-sm text-gray-600">{transaction.reference}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">Status</span>
                    <span className={`text-sm px-2 py-1 rounded text-xs font-medium ${transaction.statusColor}`}>
                      {transaction.status}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">Date</span>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">{transaction.date}</div>
                      <div className="text-xs text-gray-500">1 month ago</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}

          {/* Desktop List - Hidden on mobile */}
          {!loading && !error && allTransactions.length > 0 && (
          <div className="hidden lg:block space-y-4 p-6">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-gray-900">{transaction.type}</h4>
                      {getStatusIcon(transaction.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{transaction.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>ID: {transaction.id}</span>
                      <span>Ref: {transaction.reference}</span>
                      <span>{transaction.date}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {transaction.amount}
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${transaction.statusColor}`}>
                      {transaction.status}
                    </span>
                  </div>
                  
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          )}
        </CardContent>
      </Card>
      </div>
    </AffiliateDashboardLayout>
  )
}

export default TransactionsPage
