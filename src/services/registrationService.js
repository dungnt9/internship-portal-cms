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
