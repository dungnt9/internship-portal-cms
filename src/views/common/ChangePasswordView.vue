<template>
  <div class="container">
    <div class="login-container">
      <p class="text-center fw-bold title">Đổi mật khẩu</p>
      <div v-if="text_error" class="text-error">
        {{ text_error }}
      </div>
      <div v-if="text_success" class="text-success">
        {{ text_success }}
      </div>
      <form class="login-form" @submit.prevent="changePassword">
        <p>Mật khẩu hiện tại</p>
        <div class="input-group">
          <input
            :type="showCurrentPassword ? 'text' : 'password'"
            v-model="currentPassword"
            placeholder="Mật khẩu hiện tại"
            class="input-box"
          />
          <div class="input-group-postpend view" @click="changeShowCurrentPassword">
            <span v-if="showCurrentPassword" :class="{ active: showCurrentPassword }">
              <img src="/images/login/eye.svg" alt="" />
            </span>
            <span v-else>
              <img src="/images/login/eye-slash.svg" alt="" />
            </span>
          </div>
        </div>

        <p>Mật khẩu mới</p>
        <div class="input-group">
          <input
            :type="showNewPassword ? 'text' : 'password'"
            v-model="newPassword"
            placeholder="Mật khẩu mới"
            class="input-box"
          />
          <div class="input-group-postpend view" @click="changeShowNewPassword">
            <span v-if="showNewPassword" :class="{ active: showNewPassword }">
              <img src="/images/login/eye.svg" alt="" />
            </span>
            <span v-else>
              <img src="/images/login/eye-slash.svg" alt="" />
            </span>
          </div>
        </div>

        <p>Nhập lại mật khẩu mới</p>
        <div class="input-group">
          <input
            :type="showNewRepeatPassword ? 'text' : 'password'"
            v-model="newRepeatPassword"
            placeholder="Nhập lại mật khẩu"
            class="input-box"
          />
          <div class="input-group-postpend view" @click="changeShowNewRepeatPassword">
            <span v-if="showNewRepeatPassword" :class="{ active: showNewRepeatPassword }">
              <img src="/images/login/eye.svg" alt="" />
            </span>
            <span v-else>
              <img src="/images/login/eye-slash.svg" alt="" />
            </span>
          </div>
        </div>

        <button type="submit" class="login-button" :disabled="loading">
          <div class="button-content">
            <span v-if="loading" class="spinner-border spinner-border-sm"></span>
            <span v-else class="fw-bold">Đổi mật khẩu</span>
          </div>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { emoji } from '@/utils/validators.js'
import { changePassword as apiChangePassword } from '@/services/authService.js'
import { useRouter } from 'vue-router'

const router = useRouter()

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showNewRepeatPassword = ref(false)
const text_error = ref('')
const text_success = ref('')
const loading = ref(false)
const currentPassword = ref('')
const newPassword = ref('')
const newRepeatPassword = ref('')

const changeShowCurrentPassword = () => {
  showCurrentPassword.value = !showCurrentPassword.value
}

const changeShowNewPassword = () => {
  showNewPassword.value = !showNewPassword.value
}

const changeShowNewRepeatPassword = () => {
  showNewRepeatPassword.value = !showNewRepeatPassword.value
}

const clearMessages = () => {
  text_error.value = ''
  text_success.value = ''
}

const changePassword = async () => {
  if (loading.value) return

  clearMessages()

  // Validation
  if (!currentPassword.value || !newPassword.value || !newRepeatPassword.value) {
    text_error.value = 'Vui lòng nhập đầy đủ thông tin'
    return
  }

  if (newPassword.value.length < 8 || newPassword.value.length > 20) {
    text_error.value = 'Mật khẩu dài từ 8 - 20 ký tự'
    return
  }

  if (emoji(newPassword.value)) {
    text_error.value = 'Mật khẩu gồm chữ cái, số hoặc kí tự đặc biệt'
    return
  }

  if (newPassword.value !== newRepeatPassword.value) {
    text_error.value = 'Mật khẩu mới và mật khẩu nhập lại không khớp'
    return
  }

  if (newPassword.value === currentPassword.value) {
    text_error.value = 'Mật khẩu mới phải khác mật khẩu hiện tại'
    return
  }

  // Match API expected payload structure
  const payload = {
    currentPassword: currentPassword.value,
    newPassword: newPassword.value,
    confirmPassword: newRepeatPassword.value, // API expects confirmPassword, not newRepeatPassword
  }

  loading.value = true
  try {
    await apiChangePassword(payload)
    text_success.value = 'Đổi mật khẩu thành công!'

    // Clear form
    currentPassword.value = ''
    newPassword.value = ''
    newRepeatPassword.value = ''

    // Optional: redirect after success
    setTimeout(() => {
      router.push('/')
    }, 2000)
  } catch (error) {
    // Handle different error types
    if (error.response?.data?.message) {
      text_error.value = error.response.data.message
    } else if (error.message) {
      text_error.value = error.message
    } else {
      text_error.value = 'Có lỗi xảy ra khi đổi mật khẩu'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.container {
  margin: 1.5rem auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-container {
  background-color: rgba(255, 255, 255, 0.96);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  min-width: 500px;
  height: auto;
  padding: 2rem;
  box-shadow: 0px 10px 50px rgba(4, 54, 255, 0.1);
}

.title {
  color: #c02135;
  font-size: 1.5rem;
}

.text-error {
  color: red;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.text-success {
  color: green;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.login-form {
  min-width: 300px;
  width: 100%;
}

.input-group {
  display: flex;
  align-items: center;
  position: relative;
  margin-bottom: 1.5rem;
}

.input-box {
  width: 100%;
  height: 40px;
  border: 1px solid #e0e0e0;
  padding: 0 40px 0 12px;
  font-size: 0.95rem;
  outline: none;
}

.input-box:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.view {
  position: absolute;
  right: 10px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
  cursor: pointer;
}

.login-button {
  width: 100%;
  height: 40px;
  background-color: #c02135;
  color: white;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
}

.login-button:hover:not(:disabled) {
  background-color: #a61b2d;
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

p {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #333333;
  text-align: left;
  width: 100%;
}
</style>
