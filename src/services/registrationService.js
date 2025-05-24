import api from './apiService'

// External Internship APIs
export const getExternalInternships = async () => {
  try {
    return await api.get('/registration/cms/external-internships')
  } catch (err) {
    console.error('Lỗi:', err.message)
    throw err
  }
}

export const createExternalInternship = async (formData) => {
  try {
    return await api.post('/registration/cms/external-internships', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  } catch (err) {
    console.error('Lỗi:', err.message)
    throw err
  }
}

export const updateExternalInternshipStatus = async (id, payload) => {
  try {
    return await api.put(`/registration/cms/external-internships/${id}`, payload)
  } catch (err) {
    console.error('Lỗi:', err.message)
    throw err
  }
}

export const updateExternalInternshipFile = async (id, file) => {
  try {
    const formData = new FormData()
    formData.append('confirmationFile', file)
    return await api.put(`/registration/cms/external-internships/${id}/confirmation-file`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  } catch (err) {
    console.error('Lỗi:', err.message)
    throw err
  }
}

export const deleteExternalInternshipById = async (id) => {
  try {
    return await api.delete(`/registration/cms/external-internships/${id}`)
  } catch (err) {
    console.error('Lỗi:', err.message)
    throw err
  }
}

// Internship Period APIs
export const getInternshipPeriods = async () => {
  try {
    return await api.get('/registration/periods')
  } catch (err) {
    console.error('Lỗi:', err.message)
    throw err
  }
}

export const getCurrentInternshipPeriod = async () => {
  try {
    return await api.get('/registration/periods/current')
  } catch (err) {
    console.error('Lỗi:', err.message)
    throw err
  }
}

export const getUpcomingInternshipPeriod = async () => {
  try {
    return await api.get('/registration/periods/upcoming')
  } catch (err) {
    console.error('Lỗi:', err.message)
    throw err
  }
}

// Admin Period Management APIs
export const getAdminInternshipPeriods = async () => {
  try {
    return await api.get('/registration/cms/admin/management/periods')
  } catch (err) {
    console.error('Lỗi:', err.message)
    throw err
  }
}

export const getAdminInternshipPeriodById = async (id) => {
  try {
    return await api.get(`/registration/cms/admin/management/periods/${id}`)
  } catch (err) {
    console.error('Lỗi:', err.message)
    throw err
  }
}

export const createInternshipPeriod = async (periodData) => {
  try {
    return await api.post('/registration/cms/admin/management/periods', periodData)
  } catch (err) {
    console.error('Lỗi:', err.message)
    throw err
  }
}

export const updateInternshipPeriod = async (id, periodData) => {
  try {
    return await api.put(`/registration/cms/admin/management/periods/${id}`, periodData)
  } catch (err) {
    console.error('Lỗi:', err.message)
    throw err
  }
}

export const deleteInternshipPeriod = async (id) => {
  try {
    return await api.delete(`/registration/cms/admin/management/periods/${id}`)
  } catch (err) {
    console.error('Lỗi:', err.message)
    throw err
  }
}

export const getInternshipApplications = async () => {
  try {
    return await api.get('/registration/cms/admin/management/applications')
  } catch (err) {
    console.error('Lỗi:', err.message)
    throw err
  }
}

export const getInternshipApplicationById = async (id) => {
  try {
    return await api.get(`/registration/cms/admin/management/applications/${id}`)
  } catch (err) {
    console.error('Lỗi:', err.message)
    throw err
  }
}

export const createInternshipApplication = async (applicationData) => {
  try {
    return await api.post('/registration/cms/admin/management/applications', applicationData)
  } catch (err) {
    console.error('Lỗi:', err.message)
    throw err
  }
}

export const createInternshipApplicationWithCV = async (formData) => {
  try {
    return await api.post('/registration/cms/admin/management/applications/create-with-cv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  } catch (err) {
    console.error('Lỗi:', err.message)
    throw err
  }
}

export const updateInternshipApplication = async (id, applicationData) => {
  try {
    return await api.put(`/registration/cms/admin/management/applications/${id}`, applicationData)
  } catch (err) {
    console.error('Lỗi:', err.message)
    throw err
  }
}

export const deleteInternshipApplicationById = async (id) => {
  try {
    return await api.delete(`/registration/cms/admin/management/applications/${id}`)
  } catch (err) {
    console.error('Lỗi:', err.message)
    throw err
  }
}

export const uploadApplicationCV = async (id, file) => {
  try {
    const formData = new FormData()
    formData.append('cvFile', file)
    return await api.post(`/registration/cms/admin/management/applications/${id}/upload-cv`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  } catch (err) {
    console.error('Lỗi upload CV:', err.message)
    console.error('Error details:', err.response?.data)
    throw err
  }
}

// Application Detail APIs
export const getApplicationDetails = async (applicationId) => {
  try {
    return await api.get(`/registration/cms/admin/management/application-details/application/${applicationId}`)
  } catch (err) {
    console.error('Lỗi:', err.message)
    throw err
  }
}

export const getAllApplicationDetails = async () => {
  try {
    return await api.get('/registration/cms/admin/management/application-details')
  } catch (err) {
    console.error('Lỗi:', err.message)
    throw err
  }
}

export const getApplicationDetailById = async (id) => {
  try {
    return await api.get(`/registration/cms/admin/management/application-details/${id}`)
  } catch (err) {
    console.error('Lỗi:', err.message)
    throw err
  }
}

export const createApplicationDetail = async (detailData) => {
  try {
    return await api.post('/registration/cms/admin/management/application-details', detailData)
  } catch (err) {
    console.error('Lỗi:', err.message)
    throw err
  }
}

export const updateApplicationDetail = async (id, detailData) => {
  try {
    return await api.put(`/registration/cms/admin/management/application-details/${id}`, detailData)
  } catch (err) {
    console.error('Lỗi:', err.message)
    throw err
  }
}

export const deleteApplicationDetailById = async (id) => {
  try {
    return await api.delete(`/registration/cms/admin/management/application-details/${id}`)
  } catch (err) {
    console.error('Lỗi:', err.message)
    throw err
  }
}

// Internship Position APIs (sửa đường dẫn cho đúng)
export const getInternshipPositions = async () => {
  try {
    return await api.get('/registration/positions/admin/all')
  } catch (err) {
    console.error('Lỗi:', err.message)
    throw err
  }
}

export const getInternshipPositionsByPeriod = async (periodId) => {
  try {
    return await api.get(`/registration/positions/admin/period/${periodId}`)
  } catch (err) {
    console.error('Lỗi:', err.message)
    throw err
  }
}

export const getInternshipPositionsByCompany = async (companyId) => {
  try {
    return await api.get(`/registration/positions/company/${companyId}`)
  } catch (err) {
    console.error('Lỗi:', err.message)
    throw err
  }
}
