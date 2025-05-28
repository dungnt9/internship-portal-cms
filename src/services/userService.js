import api from './apiService'

export const getInfoAdmin = async () => {
  try {
    return await api.get('/user/admin/me')
  } catch (err) {
    console.error('Lỗi lấy thông tin quản trị viên:', err.message)
    throw err
  }
}

export const putInfoAdmin = async (payload) => {
  try {
    return await api.put('/user/admin/me', payload)
  } catch (err) {
    console.error('Lỗi cập nhật thông tin quản trị viên:', err.message)
    throw err
  }
}

// Avatar upload function (common for all user types)
export const uploadAvatar = async (file) => {
  try {
    const formData = new FormData()
    formData.append('file', file)

    return await api.post('/user/upload/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  } catch (err) {
    console.error('Lỗi upload avatar:', err.message)
    throw err
  }
}

// Admin APIs
export const getAdmins = async () => {
  try {
    return await api.get('/user/cms/admin/management/admins')
  } catch (err) {
    console.error('Lỗi:', err.message)
    throw err
  }
}

export const getAdminById = async (payload) => {
  try {
    return await api.get(`/user/cms/admin/management/admins/${payload.id}`)
  } catch (err) {
    console.error('Lỗi:', err.message)
    throw err
  }
}

export const createAdmins = async (payload) => {
  try {
    return await api.post('/user/cms/admin/management/admins', payload)
  } catch (err) {
    console.error('Lỗi:', err.message)
    throw err
  }
}

export const updateAdmins = async (payload) => {
  try {
    return await api.put(`/user/cms/admin/management/admins/${payload.id}`, payload)
  } catch (err) {
    console.error('Lỗi:', err.message)
    throw err
  }
}

// Company Contact APIs
export const getCompanyContacts = async () => {
  try {
    return await api.get('/user/cms/admin/management/company-contacts')
  } catch (err) {
    console.error('Lỗi:', err.message)
    throw err
  }
}

export const getCompanyContactById = async (payload) => {
  try {
    return await api.get(`/user/cms/admin/management/company-contacts/${payload.id}`)
  } catch (err) {
    console.error('Lỗi:', err.message)
    throw err
  }
}

export const createCompanyContact = async (payload) => {
  try {
    return await api.post('/user/cms/admin/management/company-contacts', payload)
  } catch (err) {
    console.error('Lỗi:', err.message)
    throw err
  }
}

export const updateCompanyContact = async (payload) => {
  try {
    return await api.put(`/user/cms/admin/management/company-contacts/${payload.id}`, payload)
  } catch (err) {
    console.error('Lỗi:', err.message)
    throw err
  }
}

export const getTeachers = async () => {
  try {
    return await api.get('/user/cms/admin/management/teachers')
  } catch (err) {
    console.error('Lỗi:', err.message)
    throw err
  }
}

export const getTeacherById = async (payload) => {
  try {
    return await api.get(`/user/cms/admin/management/teachers/${payload.id}`)
  } catch (err) {
    console.error('Lỗi:', err.message)
    throw err
  }
}

export const createTeacher = async (payload) => {
  try {
    return await api.post('/user/cms/admin/management/teachers', payload)
  } catch (err) {
    console.error('Lỗi:', err.message)
    throw err
  }
}

export const updateTeacher = async (payload) => {
  try {
    return await api.put(`/user/cms/admin/management/teachers/${payload.id}`, payload)
  } catch (err) {
    console.error('Lỗi:', err.message)
    throw err
  }
}

export const getStudents = async () => {
  try {
    return await api.get('/user/cms/admin/management/students')
  } catch (err) {
    console.error('Lỗi:', err.message)
    throw err
  }
}

export const getStudentById = async (payload) => {
  try {
    return await api.get(`/user/cms/admin/management/students/${payload.id}`)
  } catch (err) {
    console.error('Lỗi:', err.message)
    throw err
  }
}

export const createStudent = async (payload) => {
  try {
    return await api.post('/user/cms/admin/management/students', payload)
  } catch (err) {
    console.error('Lỗi:', err.message)
    throw err
  }
}

export const updateStudent = async (payload) => {
  try {
    return await api.put(`/user/cms/admin/management/students/${payload.id}`, payload)
  } catch (err) {
    console.error('Lỗi:', err.message)
    throw err
  }
}

export const getCompanies = async () => {
  try {
    return await api.get('/user/cms/admin/management/companies')
  } catch (err) {
    console.error('Lỗi:', err.message)
    throw err
  }
}

export const getCompanyById = async (payload) => {
  try {
    return await api.get(`/user/cms/admin/management/companies/${payload.id}`)
  } catch (err) {
    console.error('Lỗi:', err.message)
    throw err
  }
}

export const createCompany = async (payload) => {
  try {
    return await api.post('/user/cms/admin/management/companies', payload)
  } catch (err) {
    console.error('Lỗi:', err.message)
    throw err
  }
}

export const updateCompany = async (payload) => {
  try {
    return await api.put(`/user/cms/admin/management/companies/${payload.id}`, payload)
  } catch (err) {
    console.error('Lỗi:', err.message)
    throw err
  }
}

export const getAllCompanies = async () => {
  try {
    return await api.get('/user/companies/all')
  } catch (err) {
    console.error('Lỗi khi lấy danh sách công ty:', err.message)
    throw err
  }
}
