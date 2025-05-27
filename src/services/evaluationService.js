import api from './apiService'

// Internship Report APIs
export const getInternshipReports = async (filters = {}) => {
  try {
    const params = new URLSearchParams()
    if (filters.periodId) params.append('periodId', filters.periodId)
    if (filters.studentName) params.append('studentName', filters.studentName)
    if (filters.companyName) params.append('companyName', filters.companyName)
    if (filters.submitted !== null && filters.submitted !== undefined) {
      params.append('submitted', filters.submitted)
    }

    const url = `/evaluation/cms/internship-reports${params.toString() ? '?' + params.toString() : ''}`
    return await api.get(url)
  } catch (err) {
    console.error('Lỗi khi lấy danh sách báo cáo thực tập:', err.message)
    throw err
  }
}

export const getInternshipReportById = async (id) => {
  try {
    return await api.get(`/evaluation/cms/internship-reports/${id}`)
  } catch (err) {
    console.error('Lỗi khi lấy chi tiết báo cáo thực tập:', err.message)
    throw err
  }
}

export const createInternshipReport = async (formData) => {
  try {
    return await api.post('/evaluation/cms/internship-reports', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  } catch (err) {
    console.error('Lỗi khi tạo báo cáo thực tập:', err.message)
    throw err
  }
}

export const updateInternshipReport = async (id, reportData) => {
  try {
    return await api.put(`/evaluation/cms/internship-reports/${id}`, reportData)
  } catch (err) {
    console.error('Lỗi khi cập nhật báo cáo thực tập:', err.message)
    throw err
  }
}

export const uploadReportFile = async (id, file) => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    return await api.put(`/evaluation/cms/internship-reports/${id}/upload-file`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  } catch (err) {
    console.error('Lỗi khi upload file báo cáo:', err.message)
    throw err
  }
}

export const deleteInternshipReport = async (id) => {
  try {
    return await api.delete(`/evaluation/cms/internship-reports/${id}`)
  } catch (err) {
    console.error('Lỗi khi xóa báo cáo thực tập:', err.message)
    throw err
  }
}
