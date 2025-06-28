
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Driver } from '@/types/database'
import { toast } from 'sonner'

export const useDocuments = (driverFilter?: string) => {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDriversWithDocuments = async () => {
    try {
      let query = supabase
        .from('drivers')
        .select('*')
        .order('created_at', { ascending: false })

      if (driverFilter) {
        query = query.eq('id', driverFilter)
      }

      const { data, error } = await query

      if (error) throw error
      setDrivers(data || [])
    } catch (error) {
      console.error('Error fetching drivers:', error)
      toast.error('Failed to fetch driver documents')
    } finally {
      setLoading(false)
    }
  }

  const updateDriverKYCStatus = async (
    driverId: string, 
    status: 'pending' | 'approved' | 'rejected' | 'resubmission_requested', 
    rejectionReason?: string
  ) => {
    try {
      const updates: any = { 
        kyc_status: status,
        updated_at: new Date().toISOString()
      }
      
      if (rejectionReason) {
        updates.rejection_reason = rejectionReason
      }

      const { error } = await supabase
        .from('drivers')
        .update(updates)
        .eq('id', driverId)

      if (error) throw error

      // Update local state with proper typing
      setDrivers(prev => prev.map(driver => 
        driver.id === driverId 
          ? { 
              ...driver, 
              kyc_status: status as Driver['kyc_status'],
              rejection_reason: rejectionReason || driver.rejection_reason 
            }
          : driver
      ))

      toast.success(`Document ${status} successfully`)
    } catch (error) {
      console.error('Error updating KYC status:', error)
      toast.error('Failed to update document status')
      throw error
    }
  }

  const uploadDocument = async (file: File, driverId: string, documentType: 'license' | 'id_proof') => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${driverId}-${documentType}-${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('drivers-kyc-documents')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('drivers-kyc-documents')
        .getPublicUrl(fileName)

      // Update driver record with document URL
      const fieldName = documentType === 'license' ? 'license_document_url' : 'id_proof_document_url'
      const { error: updateError } = await supabase
        .from('drivers')
        .update({
          [fieldName]: publicUrl,
          kyc_status: 'pending' as Driver['kyc_status'],
          updated_at: new Date().toISOString()
        })
        .eq('id', driverId)

      if (updateError) throw updateError

      // Update local state
      setDrivers(prev => prev.map(driver => 
        driver.id === driverId 
          ? { 
              ...driver, 
              [fieldName]: publicUrl, 
              kyc_status: 'pending' as Driver['kyc_status']
            }
          : driver
      ))

      toast.success('Document uploaded successfully')
      return publicUrl
    } catch (error) {
      console.error('Error uploading document:', error)
      toast.error('Failed to upload document')
      throw error
    }
  }

  useEffect(() => {
    fetchDriversWithDocuments()

    // Set up real-time subscription
    const channel = supabase
      .channel('drivers-kyc-changes')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'drivers' },
        () => fetchDriversWithDocuments()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [driverFilter])

  return {
    drivers,
    loading,
    updateDriverKYCStatus,
    uploadDocument,
    refetch: fetchDriversWithDocuments
  }
}
