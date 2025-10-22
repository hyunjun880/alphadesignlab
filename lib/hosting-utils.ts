import { HostingStatus } from '@prisma/client'
import { differenceInDays } from 'date-fns'

export function calculateHostingStatus(expiryDate: Date): HostingStatus {
  const today = new Date()
  const daysUntilExpiry = differenceInDays(expiryDate, today)

  if (daysUntilExpiry < 0) {
    return 'EXPIRED'
  } else if (daysUntilExpiry <= 30) {
    return 'EXPIRING'
  } else {
    return 'ACTIVE'
  }
}

export function getDaysUntilExpiry(expiryDate: Date): number {
  const today = new Date()
  return differenceInDays(expiryDate, today)
}

export function getStatusColor(status: HostingStatus): string {
  switch (status) {
    case 'ACTIVE':
      return 'text-green-600 bg-green-50'
    case 'EXPIRING':
      return 'text-yellow-600 bg-yellow-50'
    case 'EXPIRED':
      return 'text-red-600 bg-red-50'
    case 'SUSPENDED':
      return 'text-gray-600 bg-gray-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

export function getStatusText(status: HostingStatus): string {
  switch (status) {
    case 'ACTIVE':
      return '활성'
    case 'EXPIRING':
      return '만료 임박'
    case 'EXPIRED':
      return '만료됨'
    case 'SUSPENDED':
      return '정지됨'
    default:
      return '알 수 없음'
  }
}
