
export const useVehicleUtils = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'maintenance':
      case 'in_maintenance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'out_of_service':
      case 'unavailable':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeDisplayName = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'maintenance':
      case 'in_maintenance':
        return 'Maintenance'
      case 'out_of_service':
      case 'unavailable':
        return 'Out of Service'
      default:
        return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  return {
    getStatusColor,
    getTypeDisplayName,
    getStatusDisplayName
  }
}
