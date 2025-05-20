<template>
  <div class="container">
    <img src="/images/background/background.webp" alt="Logo" class="background" />
    <div class="login-container">
      <img src="/images/logo/logo-hust.webp" alt="Logo" class="logo" />
      <p>Đăng nhập</p>
      <div v-if="text_error" class="text-error text-center">
        {{ text_error }}
      </div>
      <form class="login-form" @submit.prevent="login">
        <p>Tên đăng nhập</p>
        <div class="input-group">
          <div class="input-group-prepend">
            <svg
              width="20px"
              height="20px"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="gray"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
            </svg>
          </div>
          <input type="text" v-model="identifier" placeholder="Tên đăng nhập" class="input-box" />
        </div>

        <p>Mật khẩu</p>
        <div class="input-group">
          <div class="input-group-prepend">
            <svg
              width="20px"
              height="20px"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="gray"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z"
              />
            </svg>
          </div>
          <input
            :type="showpassword ? 'text' : 'password'"
            v-model="password"
            placeholder="Mật khẩu"
            class="input-box"
          />
          <div class="input-group-postpend" @click="changeShowPassword">
            <span v-if="showpassword" :class="{ active: showpassword }">
              <img src="/images/login/eye.svg" alt="" />
            </span>
            <span v-else>
              <img src="/images/login/eye-slash.svg" alt="" />
            </span>
          </div>
        </div>

        <button type="submit" class="login-button">
          <div class="button-content">
            <span v-if="loading" class="spinner-border spinner-border-sm"></span>
            <span v-else class="fw-bold">Đăng nhập</span>
          </div>
        </button>
      </form>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { validEmail, validPhone, emoji } from '@/utils/validators'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'

const router = useRouter()

const showpassword = ref(false)
const text_error = ref('')
const authStore = useAuthStore()
const loading = ref(false)
const identifier = ref(null)
const password = ref(null)

const changeShowPassword = () => {
  showpassword.value = !showpassword.value
}

const login = async () => {
  if (loading.value) return
  if (!identifier.value || !password.value) {
    text_error.value = 'Vui lòng nhập đầy đủ thông tin'
    return
  }
  if (identifier.value.length > 10) {
    if (!validEmail(identifier.value)) {
      text_error.value = 'Email không đúng định dạng'
      return
    }
  } else if (!validPhone(identifier.value)) {
    text_error.value = 'Số điện thoại không đúng định dạng'
    return
  }

  if (password.value.length < 8 || password.value.length > 20) {
    text_error.value = 'Mật khẩu dài từ 8 - 20 ký tự'
    return
  }
  if (emoji(password.value)) {
    text_error.value = 'Mật khẩu gồm chữ cái, số hoặc kí tự đặc biệt'
    return
  }

  const payload = {
    identifier: identifier.value,
    password: password.value,
  }

  loading.value = true
  try {
    await authStore.login(payload)
    await router.push('/')
  } catch (err) {
    text_error.value = err.response.data.message
    toast.error(err.response.data.message)
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

.background {
  position: relative;
  height: 600px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 10px 50px rgba(4, 54, 255, 0.1);
}

.login-container {
  position: absolute;
  background-color: rgba(255, 255, 255, 0.84);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  min-width: 500px;
  height: auto;
  padding: 20px;
}

.logo {
  width: 70px;
  padding: 10px;
}

.text-error {
  color: red;
  margin-bottom: 1rem;
}

.login-form {
  min-width: 300px;
}

.input-group {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  position: relative;
}

.input-group-prepend {
  width: 40px;
  height: 40px;
  position: absolute;
  left: 10px;
}

.input-box {
  width: 100%;
  height: 40px;
  border: none;
  margin-bottom: 1rem;
  padding: 0 40px;
  outline: none;
}

.input-box:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.input-group-postpend {
  position: absolute;
  right: 10px;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px 15px 5px;
  cursor: pointer;
  height: 100%;
}

.login-button {
  width: 100%;
  height: 40px;
  background-color: #c02135;
  color: white;
  border-radius: 20px;
  border: none;
  cursor: pointer;
}
</style>
