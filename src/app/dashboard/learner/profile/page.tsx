"use client"
import React, { useState } from 'react'
import { 
  User, 
  Mail,
  Phone,
  MapPin,
  Shield,
  Bell,
  Eye,
  EyeOff,
  Save,
  Camera,
  Edit,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useProfile } from '@/lib/hooks/useProfile'

const ProfilePage = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: false,
    weeklyReports: true,
    courseUpdates: true
  })
  
  const { 
    profile, 
    profileForm, 
    loading, 
    error, 
    isEditing, 
    setIsEditing, 
    updateProfileForm, 
    saveProfile, 
    changePassword 
  } = useProfile()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#ed874a]" />
        <span className="ml-2 text-gray-600">Loading your profile...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error loading profile: {error}</p>
        <Button 
          onClick={() => window.location.reload()} 
          className="mt-2 bg-red-600 hover:bg-red-700"
        >
          Retry
        </Button>
      </div>
    )
  }

  const handleProfileUpdate = async () => {
    try {
      await saveProfile()
      alert('Profile updated successfully!')
    } catch (err: any) {
      alert(`Failed to update profile: ${err.message}`)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match!')
      return
    }
    
    if (passwordForm.newPassword.length < 8) {
      alert('Password must be at least 8 characters long!')
      return
    }
    
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword)
      alert('Password changed successfully!')
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (err: any) {
      alert(`Failed to change password: ${err.message}`)
    }
  }

  const handleNotificationUpdate = (key: string, value: boolean) => {
    setNotifications({
      ...notifications,
      [key]: value
    })
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Profile Settings</h1>
        </div>

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
                    <span className="text-white text-2xl font-bold">
                      {profileForm.firstName.charAt(0).toUpperCase() || profile?.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
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
                      value={profileForm.firstName}
                      onChange={(e) => updateProfileForm('firstName', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <Input
                      value={profileForm.lastName}
                      onChange={(e) => updateProfileForm('lastName', e.target.value)}
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
                    value={profileForm.email}
                    onChange={(e) => updateProfileForm('email', e.target.value)}
                    disabled={true}
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <Input
                    value={profileForm.phone}
                    onChange={(e) => updateProfileForm('phone', e.target.value)}
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
                      value={profileForm.gender}
                      onChange={(e) => updateProfileForm('gender', e.target.value)}
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
                      value={profileForm.dateOfBirth}
                      onChange={(e) => updateProfileForm('dateOfBirth', e.target.value)}
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
                      value={profileForm.country}
                      onChange={(e) => updateProfileForm('country', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <Input
                      value={profileForm.city}
                      onChange={(e) => updateProfileForm('city', e.target.value)}
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
          </div>
        </div>
      </div>
  )
}

export default ProfilePage
