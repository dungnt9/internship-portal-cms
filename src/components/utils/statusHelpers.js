export const getPreferenceBadgeClass = (preferenceOrder) => {
  switch (preferenceOrder) {
    case 1:
      return 'badge bg-primary'
    case 2:
      return 'badge bg-info'
    case 3:
      return 'badge bg-secondary'
    default:
      return 'badge bg-secondary'
  }
}

export const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'APPROVED':
      return 'badge bg-success'
    case 'REJECTED':
      return 'badge bg-danger'
    case 'CANCELLED':
      return 'badge bg-secondary'
    case 'PENDING':
      return 'badge bg-warning'
    default:
      return 'badge bg-secondary'
  }
}

export const getStatusText = (status) => {
  const statusMap = {
    PENDING: 'Đang chờ xét duyệt',
    APPROVED: 'Đã được chấp thuận',
    REJECTED: 'Đã bị từ chối',
    CANCELLED: 'Đã hủy',
  }
  return statusMap[status] || status
}

export const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return ''
  const start = new Date(startDate)
  const end = new Date(endDate)

  const formatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' }
  return `${new Intl.DateTimeFormat('vi-VN', formatOptions).format(start)} - ${new Intl.DateTimeFormat('vi-VN', formatOptions).format(end)}`
}
