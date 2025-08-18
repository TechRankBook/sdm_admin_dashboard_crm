import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Driver, Vehicle, VehicleDocument } from '@/types/database'
import { toast } from 'sonner'

interface VehicleWithDocuments extends Vehicle {
  documents: VehicleDocument[]
}

export const useDocumentManagement = () => {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [vehicles, setVehicles] = useState<VehicleWithDocuments[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDriversWithDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('drivers_with_user_info')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setDrivers(data || [])
    } catch (error) {
      console.error('Error fetching drivers:', error)
      toast.error('Failed to fetch driver documents')
    }
  }

  const fetchVehiclesWithDocuments = async () => {
    try {
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false })

      if (vehiclesError) throw vehiclesError

      // For each vehicle, fetch both legacy documents and new documents
      const vehiclesWithDocs = await Promise.all(
        (vehiclesData || []).map(async (vehicle) => {
          // Fetch documents from vehicle_documents table
          const { data: documentsData } = await supabase
            .from('vehicle_documents')
            .select('*')
            .eq('vehicle_id', vehicle.id)
            .order('created_at', { ascending: false })

          // Create legacy documents from vehicle table URLs
          const legacyDocuments: VehicleDocument[] = []
          
          if (vehicle.insurance_document_url) {
            legacyDocuments.push({
              id: `legacy-insurance-${vehicle.id}`,
              vehicle_id: vehicle.id,
              document_type: 'insurance',
              document_url: vehicle.insurance_document_url,
              verified: false,
              created_at: vehicle.created_at,
              updated_at: vehicle.updated_at
            })
          }
          
          if (vehicle.registration_document_url) {
            legacyDocuments.push({
              id: `legacy-registration-${vehicle.id}`,
              vehicle_id: vehicle.id,
              document_type: 'registration',
              document_url: vehicle.registration_document_url,
              verified: false,
              created_at: vehicle.created_at,
              updated_at: vehicle.updated_at
            })
          }
          
          if (vehicle.pollution_certificate_url) {
            legacyDocuments.push({
              id: `legacy-pollution_certificate-${vehicle.id}`,
              vehicle_id: vehicle.id,
              document_type: 'pollution_certificate',
              document_url: vehicle.pollution_certificate_url,
              verified: false,
              created_at: vehicle.created_at,
              updated_at: vehicle.updated_at
            })
          }

          // Merge documents from both sources, prioritizing newer documents from the dedicated table
          const allDocuments = [...legacyDocuments, ...(documentsData || [])]
          const uniqueDocuments = allDocuments.reduce((acc, doc) => {
            const existing = acc.find(d => d.document_type === doc.document_type)
            if (!existing || (doc.id && !doc.id.startsWith('legacy-'))) {
              // Replace if no existing doc or if current doc is from dedicated table
              return acc.filter(d => d.document_type !== doc.document_type).concat(doc)
            }
            return acc
          }, [] as VehicleDocument[])

          return {
            ...vehicle,
            documents: uniqueDocuments
          }
        })
      )

      setVehicles(vehiclesWithDocs)
    } catch (error) {
      console.error('Error fetching vehicles:', error)
      toast.error('Failed to fetch vehicle documents')
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

      // Update local state
      setDrivers(prev => prev.map(driver => 
        driver.id === driverId 
          ? { 
              ...driver, 
              kyc_status: status as Driver['kyc_status'],
              rejection_reason: rejectionReason || driver.rejection_reason 
            }
          : driver
      ))

      toast.success(`Driver document ${status} successfully`)
    } catch (error) {
      console.error('Error updating KYC status:', error)
      toast.error('Failed to update document status')
      throw error
    }
  }

  const updateVehicleDocumentStatus = async (
    vehicleId: string,
    documentId: string,
    verified: boolean,
    rejectionReason?: string
  ) => {
    try {
      const isLegacyDoc = documentId.startsWith('legacy-')
      
      if (isLegacyDoc) {
        // For legacy documents, we need to create a new record in vehicle_documents table
        const documentType = documentId.split('-')[1] as 'insurance' | 'registration' | 'pollution_certificate'
        const vehicle = vehicles.find(v => v.id === vehicleId)
        if (!vehicle) throw new Error('Vehicle not found')
        
        const documentUrl = documentType === 'insurance' ? vehicle.insurance_document_url :
                           documentType === 'registration' ? vehicle.registration_document_url :
                           vehicle.pollution_certificate_url

        const { error } = await supabase
          .from('vehicle_documents')
          .insert({
            vehicle_id: vehicleId,
            document_type: documentType,
            document_url: documentUrl,
            verified: verified,
            notes: rejectionReason || null
          })

        if (error) throw error
      } else {
        // Update existing document record
        const updates: any = { 
          verified: verified,
          updated_at: new Date().toISOString()
        }
        
        if (rejectionReason) {
          updates.notes = rejectionReason
        }

        const { error } = await supabase
          .from('vehicle_documents')
          .update(updates)
          .eq('id', documentId)

        if (error) throw error
      }

      // Refresh vehicles data
      await fetchVehiclesWithDocuments()
      
      toast.success(`Vehicle document ${verified ? 'approved' : 'rejected'} successfully`)
    } catch (error) {
      console.error('Error updating vehicle document status:', error)
      toast.error('Failed to update document status')
      throw error
    }
  }

  const fetchData = async () => {
    setLoading(true)
    await Promise.all([
      fetchDriversWithDocuments(),
      fetchVehiclesWithDocuments()
    ])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()

    // Set up real-time subscriptions
    const driversChannel = supabase
      .channel('drivers-docs-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'drivers' },
        () => fetchDriversWithDocuments()
      )
      .subscribe()

    const vehicleDocsChannel = supabase
      .channel('vehicle-docs-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'vehicle_documents' },
        () => fetchVehiclesWithDocuments()
      )
      .subscribe()

    const vehiclesChannel = supabase
      .channel('vehicles-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'vehicles' },
        () => fetchVehiclesWithDocuments()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(driversChannel)
      supabase.removeChannel(vehicleDocsChannel)
      supabase.removeChannel(vehiclesChannel)
    }
  }, [])

  return {
    drivers,
    vehicles,
    loading,
    updateDriverKYCStatus,
    updateVehicleDocumentStatus,
    refetch: fetchData
  }
}