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

export const getExternalInternshipById = async (id) => {
  try {
    return await api.get(`/registration/cms/external-internships/${id}`)
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
