"use client"
import React, { useState } from 'react'
import { 
  User, 
  CreditCard,
  Save,
  Camera,
  Edit,
  Plus,
  Trash2
} from 'lucide-react'
import AffiliateDashboardLayout from '@/components/dashboard/AffiliateDashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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

type PaymentMethod = BankPaymentMethod | MobilePaymentMethod

interface NewPaymentMethod {
  type: 'bank' | 'mobile'
  bankName?: string
  accountNumber?: string
  accountName?: string
  network?: string
  mobileNumber?: string
}

interface ProfileData {
  firstName: string
  lastName: string
  email: string
  phone: string
  country: string
  city: string
  gender: string
  dateOfBirth: string
  bio: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface Notifications {
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
  marketingEmails: boolean
  weeklyReports: boolean
  paymentAlerts: boolean
}

const ProfileSettingsPage = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const [profileData, setProfileData] = useState({
    firstName: 'Riches',
    lastName: 'Adusei',
    email: 'riches.adusei@example.com',
    phone: '+233 24 123 4567',
    country: 'Ghana',
    city: 'Accra',
    gender: 'Male',
    dateOfBirth: '1990-01-15',
    bio: 'Digital marketing enthusiast helping others learn valuable skills through DigiAfriq courses.',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
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
  ])

  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: '',
    bankName: '',
    accountNumber: '',
    accountName: '',
    network: '',
    mobileNumber: ''
  })

  const [showAddPayment, setShowAddPayment] = useState(false)
  const [editingPayment, setEditingPayment] = useState<PaymentMethod | null>(null)

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: false,
    weeklyReports: true,
    paymentAlerts: true
  })

  const handleProfileUpdate = () => {
    // Simulate API call
    alert('Profile updated successfully!')
    setIsEditing(false)
  }

  const handlePasswordChange = () => {
    if (profileData.newPassword !== profileData.confirmPassword) {
      alert('New passwords do not match!')
      return
    }
    
    if (profileData.newPassword.length < 8) {
      alert('Password must be at least 8 characters long!')
      return
    }
    
    // Simulate API call
    alert('Password changed successfully!')
    setProfileData({
      ...profileData,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
  }

  const handleNotificationUpdate = (key: string, value: boolean) => {
    setNotifications({
      ...notifications,
      [key]: value
    })
  }

  const handleAddPaymentMethod = () => {
    if (newPaymentMethod.type === 'bank' && (!newPaymentMethod.bankName || !newPaymentMethod.accountNumber || !newPaymentMethod.accountName)) {
      alert('Please fill in all bank details')
      return
    }
    if (newPaymentMethod.type === 'mobile' && (!newPaymentMethod.network || !newPaymentMethod.mobileNumber)) {
      alert('Please fill in all mobile money details')
      return
    }

    // Check if method type already exists
    const existingMethod = paymentMethods.find(method => method.type === newPaymentMethod.type)
    if (existingMethod) {
      alert(`You can only have one ${newPaymentMethod.type === 'bank' ? 'bank account' : 'mobile money'} method. Please delete the existing one first.`)
      return
    }

    let newMethod: Partial<PaymentMethod> = {
      id: paymentMethods.length + 1,
      type: newPaymentMethod.type as 'bank' | 'mobile',
      isDefault: paymentMethods.length === 0
    }

    if (newPaymentMethod.type === 'bank') {
      newMethod = {
        ...newMethod,
        type: 'bank' as const,
        bankName: newPaymentMethod.bankName,
        accountNumber: newPaymentMethod.accountNumber,
        accountName: newPaymentMethod.accountName
      }
    } else if (newPaymentMethod.type === 'mobile') {
      newMethod = {
        ...newMethod,
        type: 'mobile' as const,
        network: newPaymentMethod.network,
        mobileNumber: newPaymentMethod.mobileNumber
      }
    }

    setPaymentMethods([...paymentMethods, newMethod as PaymentMethod])
    setNewPaymentMethod({
      type: '',
      bankName: '',
      accountNumber: '',
      accountName: '',
      network: '',
      mobileNumber: ''
    })
    setShowAddPayment(false)
    alert('Payment method added successfully!')
  }

  const handleDeletePaymentMethod = (id: number) => {
    if (confirm('Are you sure you want to delete this payment method?')) {
      setPaymentMethods(paymentMethods.filter(method => method.id !== id))
    }
  }

  const handleSetDefaultPayment = (id: number) => {
    setPaymentMethods(paymentMethods.map(method => ({
      ...method,
      isDefault: method.id === id
    })))
  }

  const handleEditPaymentMethod = (method: PaymentMethod) => {
    setEditingPayment(method)
    setNewPaymentMethod({
      type: method.type,
      bankName: method.type === 'bank' ? method.bankName : '',
      accountNumber: method.type === 'bank' ? method.accountNumber : '',
      accountName: method.type === 'bank' ? method.accountName : '',
      network: method.type === 'mobile' ? method.network : '',
      mobileNumber: method.type === 'mobile' ? method.mobileNumber : ''
    })
    setShowAddPayment(true)
  }

  const handleUpdatePaymentMethod = () => {
    if (newPaymentMethod.type === 'bank' && (!newPaymentMethod.bankName || !newPaymentMethod.accountNumber || !newPaymentMethod.accountName)) {
      alert('Please fill in all bank details')
      return
    }
    if (newPaymentMethod.type === 'mobile' && (!newPaymentMethod.network || !newPaymentMethod.mobileNumber)) {
      alert('Please fill in all mobile money details')
      return
    }

    let updatedMethod: Partial<PaymentMethod> = {
      ...editingPayment,
      type: newPaymentMethod.type as 'bank' | 'mobile'
    }

    if (newPaymentMethod.type === 'bank') {
      updatedMethod = {
        ...updatedMethod,
        type: 'bank' as const,
        bankName: newPaymentMethod.bankName,
        accountNumber: newPaymentMethod.accountNumber,
        accountName: newPaymentMethod.accountName
      }
    } else if (newPaymentMethod.type === 'mobile') {
      updatedMethod = {
        ...updatedMethod,
        type: 'mobile' as const,
        network: newPaymentMethod.network,
        mobileNumber: newPaymentMethod.mobileNumber
      }
    }

    setPaymentMethods(paymentMethods.map(method => 
      method.id === editingPayment?.id ? updatedMethod as PaymentMethod : method
    ))
    
    setNewPaymentMethod({
      type: '',
      bankName: '',
      accountNumber: '',
      accountName: '',
      network: '',
      mobileNumber: ''
    })
    setShowAddPayment(false)
    setEditingPayment(null)
    alert('Payment method updated successfully!')
  }

  return (
    <AffiliateDashboardLayout title="Profile Settings">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Basic Information
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Profile Picture */}
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-[#ed874a] rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">R</span>
                </div>
                <div>
                  <Button variant="outline" size="sm">
                    <Camera className="w-4 h-4 mr-2" />
                    Change Photo
                  </Button>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG max 2MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <Input
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <Input
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  disabled={!isEditing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <Input
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  disabled={!isEditing}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <select 
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500"
                    value={profileData.gender}
                    onChange={(e) => setProfileData({...profileData, gender: e.target.value})}
                    disabled={!isEditing}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <Input
                    type="date"
                    value={profileData.dateOfBirth}
                    onChange={(e) => setProfileData({...profileData, dateOfBirth: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <Input
                    value={profileData.country}
                    onChange={(e) => setProfileData({...profileData, country: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <Input
                    value={profileData.city}
                    onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {isEditing && (
                <Button onClick={handleProfileUpdate} className="bg-[#ed874a] hover:bg-[#d76f32]">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Details
                </CardTitle>
                {paymentMethods.length < 2 && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowAddPayment(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Method
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentMethods.map((method) => (
                <div key={method.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <CreditCard className="w-4 h-4 text-gray-600" />
                        <span className="font-medium">
                          {method.type === 'bank' ? 'Bank Transfer' : 'Mobile Money'}
                        </span>
                        {method.isDefault && (
                          <span className="bg-[#ed874a] text-white text-xs px-2 py-1 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      
                      {method.type === 'bank' && (
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>Bank: {(method as BankPaymentMethod).bankName}</div>
                          <div>Account: {(method as BankPaymentMethod).accountNumber}</div>
                          <div>Name: {(method as BankPaymentMethod).accountName}</div>
                        </div>
                      )}
                      
                      {method.type === 'mobile' && (
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>Network: {(method as MobilePaymentMethod).network?.toUpperCase()}</div>
                          <div>Number: {(method as MobilePaymentMethod).mobileNumber}</div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPaymentMethod(method)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      {!method.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefaultPayment(method.id)}
                        >
                          Set Default
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePaymentMethod(method.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {paymentMethods.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No payment methods added yet</p>
                  <p className="text-sm">Add a payment method to receive withdrawals</p>
                </div>
              )}

              {/* Add/Edit Payment Method Form */}
              {showAddPayment && (
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium mb-4">
                    {editingPayment ? 'Edit Payment Method' : 'Add New Payment Method'}
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Type
                      </label>
                      <select 
                        className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
                        value={newPaymentMethod.type}
                        onChange={(e) => setNewPaymentMethod({...newPaymentMethod, type: e.target.value})}
                      >
                        <option value="">Select Type</option>
                        <option value="bank">Bank Transfer</option>
                        <option value="mobile">Mobile Money</option>
                      </select>
                    </div>

                    {newPaymentMethod.type === 'bank' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bank Name
                          </label>
                          <Input
                            placeholder="Enter bank name"
                            value={newPaymentMethod.bankName}
                            onChange={(e) => setNewPaymentMethod({...newPaymentMethod, bankName: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Account Number
                          </label>
                          <Input
                            placeholder="Enter account number"
                            value={newPaymentMethod.accountNumber}
                            onChange={(e) => setNewPaymentMethod({...newPaymentMethod, accountNumber: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Account Name
                          </label>
                          <Input
                            placeholder="Enter account holder name"
                            value={newPaymentMethod.accountName}
                            onChange={(e) => setNewPaymentMethod({...newPaymentMethod, accountName: e.target.value})}
                          />
                        </div>
                      </>
                    )}

                    {newPaymentMethod.type === 'mobile' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mobile Network
                          </label>
                          <select 
                            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
                            value={newPaymentMethod.network}
                            onChange={(e) => setNewPaymentMethod({...newPaymentMethod, network: e.target.value})}
                          >
                            <option value="">Select network</option>
                            <option value="mtn">MTN Mobile Money</option>
                            <option value="vodafone">Vodafone Cash</option>
                            <option value="airteltigo">AirtelTigo Money</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mobile Number
                          </label>
                          <Input
                            placeholder="Enter mobile number"
                            value={newPaymentMethod.mobileNumber}
                            onChange={(e) => setNewPaymentMethod({...newPaymentMethod, mobileNumber: e.target.value})}
                          />
                        </div>
                      </>
                    )}

                    <div className="flex space-x-4">
                      <Button
                        onClick={() => {
                          setShowAddPayment(false)
                          setEditingPayment(null)
                          setNewPaymentMethod({
                            type: '',
                            bankName: '',
                            accountNumber: '',
                            accountName: '',
                            network: '',
                            mobileNumber: ''
                          })
                        }}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={editingPayment ? handleUpdatePaymentMethod : handleAddPaymentMethod}
                        className="flex-1 bg-[#ed874a] hover:bg-[#d76f32]"
                        disabled={!newPaymentMethod.type}
                      >
                        {editingPayment ? 'Update Payment Method' : 'Add Payment Method'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AffiliateDashboardLayout>
  )
}

export default ProfileSettingsPage
