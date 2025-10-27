"use client"
import React, { useState } from 'react'
import { 
  CreditCard, 
  DollarSign, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  Settings
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import AffiliateDashboardLayout from '@/components/dashboard/AffiliateDashboardLayout'

interface BankPaymentMethod {
  id: number
  type: 'bank'
  bankName: string
  accountNumber: string
  accountName: string
  isDefault: boolean
}

interface MobilePaymentMethod {
  id: number
  type: 'mobile'
  network: string
  mobileNumber: string
  isDefault: boolean
}

type SavedPaymentMethod = BankPaymentMethod | MobilePaymentMethod

const WithdrawalsPage = () => {
  const [step, setStep] = useState(1) // 1: Amount & Method, 2: Confirmation
  const [withdrawalAmount, setWithdrawalAmount] = useState('')
  const [selectedMethod, setSelectedMethod] = useState('')
  const [paymentDetails, setPaymentDetails] = useState({
    bankName: '',
    accountNumber: '',
    accountName: '',
    mobileNumber: '',
    network: ''
  })

  const availableBalance = 58.00
  const minimumWithdrawal = 10.00

  // Simulated fetch from profile - in real app, this would be an API call
  const savedPaymentMethods: SavedPaymentMethod[] = [
    {
      id: 1,
      type: 'bank' as const,
      bankName: 'GCB Bank',
      accountNumber: '1234567890',
      accountName: 'Riches Adusei',
      isDefault: true
    },
    {
      id: 2,
      type: 'mobile' as const,
      network: 'mtn',
      mobileNumber: '0241234567',
      isDefault: false
    }
  ]

  const paymentMethods = [
    {
      id: 'bank',
      name: 'Bank Transfer',
      description: 'Direct transfer to your bank account',
      fee: '0.00 USD',
      processingTime: '3-5 business days',
      icon: CreditCard
    },
    {
      id: 'mobile',
      name: 'Mobile Money',
      description: 'MTN Mobile Money, Vodafone Cash',
      fee: '1.5%',
      processingTime: 'Instant',
      icon: CreditCard
    }
  ]

  // const recentWithdrawals = [
  //   {
  //     date: "2024-09-24",
  //     amount: "40.00 USD",
  //     method: "Bank Transfer",
  //     status: "Completed",
  //     statusColor: "text-green-600 bg-green-100",
  //     reference: "WD001234"
  //   },
  //   {
  //     date: "2024-09-10",
  //     amount: "25.00 USD",
  //     method: "PayPal",
  //     status: "Completed",
  //     statusColor: "text-green-600 bg-green-100",
  //     reference: "WD001235"
  //   },
  //   {
  //     date: "2024-08-28",
  //     amount: "30.00 USD",
  //     method: "Mobile Money",
  //     status: "Processing",
  //     statusColor: "text-yellow-600 bg-yellow-100",
  //     reference: "WD001236"
  //   }
  // ]

  const handleNextStep = () => {
    if (step === 1) {
      if (!withdrawalAmount || !selectedMethod) {
        alert('Please enter amount and select payment method')
        return
      }
      
      const amount = parseFloat(withdrawalAmount)
      if (amount < minimumWithdrawal) {
        alert(`Minimum withdrawal amount is ${minimumWithdrawal} USD`)
        return
      }
      
      if (amount > availableBalance) {
        alert('Insufficient balance')
        return
      }

      // Check if payment method exists
      const savedMethod = savedPaymentMethods.find(method => method.type === selectedMethod)
      if (!savedMethod) {
        alert('Please set up your payment details in your profile first')
        return
      }
      
      setStep(2)
    }
  }

  const handleConfirmWithdrawal = () => {
    // Process withdrawal
    alert('Withdrawal request submitted successfully!')
    // Reset form
    setStep(1)
    setWithdrawalAmount('')
    setSelectedMethod('')
    setPaymentDetails({
      bankName: '',
      accountNumber: '',
      accountName: '',
      mobileNumber: '',
      network: ''
    })
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  // Auto-populate payment details when method is selected
  const handleMethodSelection = (methodId: string) => {
    setSelectedMethod(methodId)
    
    // Find saved payment method for this type
    const savedMethod = savedPaymentMethods.find(method => method.type === methodId && method.isDefault)
    
    if (savedMethod) {
      if (methodId === 'bank') {
        setPaymentDetails({
          ...paymentDetails,
          bankName: (savedMethod as BankPaymentMethod).bankName || '',
          accountNumber: (savedMethod as BankPaymentMethod).accountNumber || '',
          accountName: (savedMethod as BankPaymentMethod).accountName || ''
        })
      } else if (methodId === 'mobile') {
        setPaymentDetails({
          ...paymentDetails,
          network: (savedMethod as MobilePaymentMethod).network || '',
          mobileNumber: (savedMethod as MobilePaymentMethod).mobileNumber || ''
        })
      }
    }
  }

  return (
    <AffiliateDashboardLayout title="Withdraw Funds">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Withdraw Funds</h1>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          {[1, 2].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= stepNumber ? 'bg-[#ed874a] text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {stepNumber}
              </div>
              {stepNumber < 2 && (
                <div className={`w-16 h-0.5 mx-2 ${
                  step > stepNumber ? 'bg-[#ed874a]' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Withdrawal Form */}
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                {step === 1 && 'Enter Amount & Select Method'}
                {step === 2 && 'Confirm Withdrawal'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Amount & Method Selection */}
              {step === 1 && (
                <>
                  {availableBalance < minimumWithdrawal ? (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                          <h3 className="font-medium text-yellow-800">Insufficient Balance</h3>
                          <p className="text-sm text-yellow-700 mt-1">
                            You need at least {minimumWithdrawal.toFixed(2)} USD to make a withdrawal. 
                            Current balance: {availableBalance.toFixed(2)} USD
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Withdrawal Amount (USD)
                        </label>
                        <Input
                          type="number"
                          placeholder="Enter amount"
                          value={withdrawalAmount}
                          onChange={(e) => setWithdrawalAmount(e.target.value)}
                          min={minimumWithdrawal}
                          max={availableBalance}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Minimum: {minimumWithdrawal.toFixed(2)} USD | Available: {availableBalance.toFixed(2)} USD
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Payment Method
                        </label>
                        <div className="space-y-3">
                          {paymentMethods.map((method) => (
                            <div
                              key={method.id}
                              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                selectedMethod === method.id
                                  ? 'border-[#ed874a] bg-[#ed874a]/5'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => handleMethodSelection(method.id)}
                            >
                              <div className="flex items-start space-x-3">
                                <method.icon className="w-5 h-5 text-gray-600 mt-1" />
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">{method.name}</h4>
                                  <p className="text-sm text-gray-600">{method.description}</p>
                                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                                    <span>Fee: {method.fee}</span>
                                    <span>{method.processingTime}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Button 
                        onClick={handleNextStep}
                        className="w-full bg-[#ed874a] hover:bg-[#d76f32]"
                        disabled={!withdrawalAmount || !selectedMethod}
                      >
                        Review & Confirm
                      </Button>
                    </>
                  )}
                </>
              )}

              {/* Step 2: Confirmation */}
              {step === 2 && (
                <>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <h3 className="font-medium text-gray-900 mb-4">Withdrawal Summary</h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Amount:</span>
                        <span className="text-sm font-medium text-gray-900">${withdrawalAmount} USD</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Method:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {paymentMethods.find(m => m.id === selectedMethod)?.name}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Fee:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {paymentMethods.find(m => m.id === selectedMethod)?.fee}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Processing Time:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {paymentMethods.find(m => m.id === selectedMethod)?.processingTime}
                        </span>
                      </div>

                      <hr className="my-3" />

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-medium text-gray-900">Payment Details:</h4>
                          <a 
                            href="/dashboard/affiliate/profile" 
                            target="_blank" 
                            className="text-sm text-[#ed874a] hover:text-[#d76f32] underline"
                          >
                            Edit Details
                          </a>
                        </div>
                        {(() => {
                          const savedMethod = savedPaymentMethods.find(method => method.type === selectedMethod)
                          if (!savedMethod) return null

                          if (selectedMethod === 'bank') {
                            return (
                              <>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Bank:</span>
                                  <span className="text-sm text-gray-900">{(savedMethod as BankPaymentMethod).bankName}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Account:</span>
                                  <span className="text-sm text-gray-900">{(savedMethod as BankPaymentMethod).accountNumber}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Name:</span>
                                  <span className="text-sm text-gray-900">{(savedMethod as BankPaymentMethod).accountName}</span>
                                </div>
                              </>
                            )
                          }

                          if (selectedMethod === 'mobile') {
                            return (
                              <>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Network:</span>
                                  <span className="text-sm text-gray-900">{(savedMethod as MobilePaymentMethod).network?.toUpperCase()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Number:</span>
                                  <span className="text-sm text-gray-900">{(savedMethod as MobilePaymentMethod).mobileNumber}</span>
                                </div>
                              </>
                            )
                          }

                          return null
                        })()}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <Button 
                      onClick={handleBack}
                      variant="outline"
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={handleConfirmWithdrawal}
                      className="flex-1 bg-[#ed874a] hover:bg-[#d76f32]"
                    >
                      Confirm Withdrawal
                    </Button>
                  </div>
                </>
              )}
          </CardContent>
        </Card>
        </div>

        {/* Withdrawal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Withdrawal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900">Processing Times</h4>
                  <p className="text-sm text-gray-600">Bank transfers: 3-5 days, Mobile Money: Instant</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900">Withdrawal Schedule</h4>
                  <p className="text-sm text-gray-600">Withdrawals are processed Monday to Friday, 9 AM - 5 PM GMT</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900">Important Notes</h4>
                  <ul className="text-sm text-gray-600 mt-1 space-y-1">
                    <li>• Minimum withdrawal: {minimumWithdrawal.toFixed(2)} USD</li>
                    <li>• Maximum per day: 500.00 USD</li>
                    <li>• Fees may apply depending on payment method</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button variant="outline" className="w-full">
                <Settings className="w-4 h-4 mr-2" />
                Manage Payment Methods
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

    </AffiliateDashboardLayout>
  )
}

export default WithdrawalsPage
