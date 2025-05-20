import api from './apiService'

export const apiLogin = async (payload) => {
  try {
    return await api.post('/auth/login', payload)
  } catch (err) {
    console.error('Lỗi đăng nhập:', err.message)
    throw err
  }
}

export const verifyOtp = async (payload) => {
  try {
    return await api.post('/auth/verify-otp', payload)
  } catch (err) {
    console.error('Lỗi xác thực OTP:', err.message)
    throw err
  }
}

export const resetPassword = async (payload) => {
  try {
    return await api.post('/auth/reset-password', payload)
  } catch (err) {
    console.error('Lỗi đặt lại mật khẩu:', err.message)
    throw err
  }
}

export const changePassword = async (payload) => {
  try {
    return await api.post('/auth/change-password', payload)
  } catch (err) {
    console.error('Lỗi thay đổi mật khẩu:', err.message)
    throw err
  }
}
