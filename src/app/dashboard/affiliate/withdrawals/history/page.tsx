"use client"
import React from 'react'
import { 
  Calendar, 
  Download,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  CreditCard,
  BarChart3,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAffiliateData } from '@/lib/hooks/useAffiliateData'

const WithdrawalHistoryPage = () => {
  const { recentPayouts, loading, error } = useAffiliateData()
  
  // Transform payouts data to match the table format
  const withdrawalHistory = recentPayouts.map(payout => ({
    date: new Date(payout.created_at).toLocaleDateString('en-US'),
    amount: `${payout.amount.toFixed(2)} USD`,
    method: 'Bank Transfer',
    reference: payout.reference || payout.id.slice(0, 10).toUpperCase(),
    status: payout.status === 'completed' ? 'Completed' : 
            payout.status === 'processing' ? 'Processing' : 
            payout.status === 'pending' ? 'Pending' : 'Failed',
    statusColor: payout.status === 'completed' ? 'text-green-600 bg-green-100' : 
                 payout.status === 'processing' ? 'text-yellow-600 bg-yellow-100' : 
                 payout.status === 'pending' ? 'text-blue-600 bg-blue-100' : 
                 'text-red-600 bg-red-100',
    fee: '0.00 USD',
    netAmount: `${payout.amount.toFixed(2)} USD`,
    processedDate: payout.processed_at ? new Date(payout.processed_at).toLocaleDateString('en-US') : 'Pending'
  }))

  const mockWithdrawalHistory = [
    {
      date: "2024-09-24",
      amount: "40.00 USD",
      method: "Bank Transfer",
      reference: "WD001234",
      status: "Completed",
      statusColor: "text-green-600 bg-green-100",
      fee: "0.00 USD",
      netAmount: "40.00 USD",
      processedDate: "2024-09-27"
    },
    {
      date: "2024-09-10",
      amount: "25.00 USD",
      method: "PayPal",
      reference: "WD001235",
      status: "Completed",
      statusColor: "text-green-600 bg-green-100",
      fee: "0.63 USD",
      netAmount: "24.37 USD",
      processedDate: "2024-09-11"
    },
    {
      date: "2024-08-28",
      amount: "30.00 USD",
      method: "Mobile Money",
      reference: "WD001236",
      status: "Processing",
      statusColor: "text-yellow-600 bg-yellow-100",
      fee: "0.45 USD",
      netAmount: "29.55 USD",
      processedDate: "Pending"
    },
    {
      date: "2024-08-15",
      amount: "20.00 USD",
      method: "Bank Transfer",
      reference: "WD001237",
      status: "Completed",
      statusColor: "text-green-600 bg-green-100",
      fee: "0.00 USD",
      netAmount: "20.00 USD",
      processedDate: "2024-08-18"
    },
    {
      date: "2024-08-01",
      amount: "15.00 USD",
      method: "PayPal",
      reference: "WD001238",
      status: "Failed",
      statusColor: "text-red-600 bg-red-100",
      fee: "0.00 USD",
      netAmount: "0.00 USD",
      processedDate: "2024-08-01"
    }
  ]

  const displayHistory = withdrawalHistory.length > 0 ? withdrawalHistory : mockWithdrawalHistory

  // const summaryStats = [
  //   {
  //     title: "Total Withdrawn",
  //     value: "95.00 USD",
  //     icon: CheckCircle,
  //     color: "text-green-600",
  //     bgColor: "bg-green-100"
  //   },
  //   {
  //     title: "Total Fees Paid",
  //     value: "1.08 USD", 
  //     icon: CreditCard,
  //     color: "text-blue-600",
  //     bgColor: "bg-blue-100"
  //   },
  //   {
  //     title: "Successful Withdrawals",
  //     value: "3",
  //     icon: BarChart3,
  //     color: "text-purple-600",
  //     bgColor: "bg-purple-100"
  //   },
  //   {
  //     title: "This Month",
  //     value: "40.00 USD",
  //     icon: Calendar,
  //     color: "text-orange-600",
  //     bgColor: "bg-orange-100"
  //   }
  // ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'Processing':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'Failed':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">From:</label>
              <input 
                type="date" 
                className="border border-gray-200 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">To:</label>
              <input 
                type="date" 
                className="border border-gray-200 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <select className="border border-gray-200 rounded-md px-3 py-2 text-sm">
              <option>All Status</option>
              <option>Completed</option>
              <option>Processing</option>
              <option>Failed</option>
            </select>
            <select className="border border-gray-200 rounded-md px-3 py-2 text-sm">
              <option>All Methods</option>
              <option>Bank Transfer</option>
              <option>PayPal</option>
              <option>Mobile Money</option>
            </select>
            <Button className="bg-[#ed874a] hover:bg-[#d76f32]">
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

      {/* Withdrawal History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">All Withdrawals</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#ed874a]" />
              <span className="ml-3 text-gray-600">Loading withdrawal history...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-8 text-red-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-4" />
              <p>Error loading withdrawals: {error}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && withdrawalHistory.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <CreditCard className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No withdrawal history</p>
              <p className="text-sm">Your withdrawal transactions will appear here</p>
            </div>
          )}

          {/* Table */}
          {!loading && !error && withdrawalHistory.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Date Requested</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Fee</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Net Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Method</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Reference</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Processed</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {withdrawalHistory.map((withdrawal, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">{withdrawal.date}</td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{withdrawal.amount}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{withdrawal.fee}</td>
                    <td className="py-3 px-4 text-sm font-medium text-green-600">{withdrawal.netAmount}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{withdrawal.method}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 font-mono">{withdrawal.reference}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(withdrawal.status)}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${withdrawal.statusColor}`}>
                          {withdrawal.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{withdrawal.processedDate}</td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default WithdrawalHistoryPage
