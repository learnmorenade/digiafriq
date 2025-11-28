"use client"
import React from 'react'
import { useRouter } from 'next/navigation'
import AdminDashboardLayout from '@/components/dashboard/AdminDashboardLayout'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import MembershipFormPage from '@/components/dashboard/MembershipFormPage'
import { toast } from 'sonner'

export default function CreateMembershipPage() {
  const router = useRouter()

  const handleBack = () => {
    router.push('/dashboard/admin/memberships')
  }

  const handleSuccess = () => {
    router.push('/dashboard/admin/memberships')
  }

  return (
    <AdminDashboardLayout
      title="Create Membership Package"
      headerAction={
        <Button onClick={handleBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Memberships
        </Button>
      }
    >
      <MembershipFormPage
        onSuccess={handleSuccess}
        onCancel={handleBack}
      />
    </AdminDashboardLayout>
  )
}
