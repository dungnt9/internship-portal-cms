<template>
  <div class="container">
    <div class="profile-container">
      <p class="text-center fw-bold title">Thông tin cá nhân</p>
      <Admin v-if="userRole === 'ROLE_ADMIN'" />
      <div v-else class="no-role-message">Không có thông tin người dùng</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Admin from '@/components/userinfo/Admin.vue'
import { useAuthStore } from '@/stores/authStore.js'

const authStore = useAuthStore()
const userRole = ref('')

onMounted(() => {
  // Get user role from auth store
  userRole.value = authStore.role
})
</script>

<style scoped>
.container {
  margin: 1.5rem auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-container {
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

.no-role-message {
  padding: 2rem;
  color: #666;
  font-style: italic;
  text-align: center;
}
</style>
