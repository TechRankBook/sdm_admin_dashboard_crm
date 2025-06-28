
import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import { Driver } from '@/types/database'
import { useDrivers } from '@/hooks/useDrivers'

interface DeleteDriverModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  driver: Driver | null
}

export const DeleteDriverModal: React.FC<DeleteDriverModalProps> = ({ open, onOpenChange, driver }) => {
  const { deleteDriver } = useDrivers()
  const [loading, setLoading] = React.useState(false)

  const handleDelete = async () => {
    if (!driver) return

    setLoading(true)
    try {
      await deleteDriver(driver.id)
      onOpenChange(false)
    } catch (error) {
      console.error('Error deleting driver:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!driver) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-red-600">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Delete Driver
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{driver.full_name}</strong>? 
            This action cannot be undone and will remove all associated data.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? 'Deleting...' : 'Yes, Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
