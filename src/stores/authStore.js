import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiLogin } from '@/services/authService.js'
import Cookies from 'js-cookie'
import router from '@/router'
import { toast } from "vue3-toastify";

export const useAuthStore = defineStore(
  'auth',
  () => {
    const token = ref(null)
    const role = ref(null)

    const isAuthenticated = computed(() => {
      return Boolean(token.value) && token.value !== 'null' && token.value !== 'undefined'
    })

    const clearAuth = () => {
      Cookies.remove('token')
      Cookies.remove('role')
    }

    const login = async (payload) => {
      try {
        const response = await apiLogin(payload)
        if (response && response.data) {
          if (response.data.role !== 'ROLE_ADMIN') {
            toast.error('Bạn không có quyền truy cập vào trang này')
            return }
          token.value = response.data.accessToken
          role.value = response.data.role
          Cookies.set('token', response.data.accessToken)
        }
      } catch (error) {
        console.error('Error logging in:', error)
        throw error
      }
    }

    const logout = () => {
      clearAuth()
      localStorage.removeItem('auth')
      router.push('/dang-nhap')
    }

    return {
      token,
      role,
      isAuthenticated,
      login,
      logout,
      clearAuth,
    }
  },
  {
    persist: true,
  },
)
