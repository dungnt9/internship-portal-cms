<template>
  <div class="container">
    <div v-if="error" class="text-error">
      {{ error }}
    </div>
    <div class="profile-image-container">
      <img
        :src="getAvatarUrl(adminData.imagePath)"
        class="profile-image"
        @error="handleImageError"
      />
      <div class="edit-badge" :class="{ uploading: uploadingAvatar }">
        <img v-if="!uploadingAvatar" src="/images/user/edit_profile.svg" class="icon-placeholder" />
        <div v-else class="spinner-border spinner-border-sm text-white"></div>
        <input
          type="file"
          @change="handleAvatarUpload"
          ref="fileInput"
          accept="image/*"
          :disabled="uploadingAvatar"
        />
      </div>
    </div>

    <form class="profile-form row" @submit.prevent="handleSubmit">
      <div class="col-md-12"><strong>Thông tin chung</strong></div>
      <div class="col-md-6">
        <div>
          <p>Họ và tên (*)</p>
          <div class="input-group">
            <input
              type="text"
              v-model="formData.name"
              placeholder="Họ và tên"
              class="input-box"
              :disabled="editStatus"
            />
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div>
          <p>Email</p>
          <div class="input-group">
            <input
              type="text"
              v-model="adminData.email"
              placeholder="Email"
              class="input-box"
              disabled
            />
          </div>
        </div>
        <p>Số điện thoại</p>
        <div class="input-group">
          <input
            type="text"
            v-model="adminData.phone"
            placeholder="Số điện thoại"
            class="input-box"
            disabled
          />
        </div>
      </div>

      <div class="col-md-12"><strong>Thông tin chi tiết</strong></div>
      <div class="col-md-6">
        <div>
          <p>Đơn vị công tác</p>
          <div class="input-group">
            <input
              type="text"
              v-model="formData.department"
              placeholder="Đơn vị công tác"
              class="input-box"
              :disabled="editStatus"
            />
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div>
          <p>Vị trí</p>
          <div class="input-group">
            <input
              type="text"
              v-model="formData.position"
              placeholder="Vị trí"
              class="input-box"
              :disabled="editStatus"
            />
          </div>
        </div>
      </div>

      <!-- Buttons in a separate row at the bottom -->
      <div class="col-md-12">
        <div
          v-if="editStatus"
          class="col-6 mx-auto d-flex justify-content-center align-items-center"
        >
          <button type="button" @click="toggleEditMode" class="login-button">Chỉnh sửa</button>
        </div>

        <div
          v-if="!editStatus"
          class="col-6 mx-auto d-flex justify-content-center align-items-center gap-2"
        >
          <button type="button" @click="cancelEdit" class="login-button btn-secondary">
            <span v-if="loading" class="spinner-border spinner-border-sm mb-2"></span>Hủy
          </button>
          <button type="submit" class="login-button btn-danger">
            <span v-if="loading" class="spinner-border spinner-border-sm mb-2"></span>Lưu
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { toast } from 'vue3-toastify'
import { getInfoAdmin, putInfoAdmin, uploadAvatar } from '@/services/userService'

// State variables
const error = ref('')
const loading = ref(false)
const editStatus = ref(true) // true = view mode, false = edit mode
const originalData = ref({}) // Store original data for cancel operation
const fileInput = ref(null)
const uploadingAvatar = ref(false)

// Form data - only contains editable fields
const formData = ref({
  name: '',
  department: '',
  position: '',
})

// Complete admin data including non-editable fields
const adminData = ref({
  id: 0,
  authUserId: 0,
  name: '',
  department: '',
  position: '',
  imagePath: '',
  email: '',
  phone: '',
})

// Fetch admin information on component mount
onMounted(async () => {
  try {
    await fetchAdminInfo()
  } catch (err) {
    error.value = 'Không thể tải thông tin quản trị viên. Vui lòng thử lại sau.'
    toast.error('Không thể tải thông tin quản trị viên')
  }
})

// Toggle between view and edit mode
const toggleEditMode = () => {
  editStatus.value = false
  // Store original data to revert if canceled
  originalData.value = { ...formData.value }
}

// Cancel edit and revert to original data
const cancelEdit = () => {
  formData.value = { ...originalData.value }
  editStatus.value = true
  error.value = ''
}

// Fetch admin information from API
const fetchAdminInfo = async () => {
  loading.value = true
  try {
    const response = await getInfoAdmin()
    if (response && response.data) {
      adminData.value = response.data

      // Only store editable fields in formData
      formData.value = {
        name: response.data.name,
        department: response.data.department,
        position: response.data.position,
      }

      // Store original data for cancel operation
      originalData.value = { ...formData.value }
    }
  } catch (err) {
    console.error('Error fetching admin info:', err)
    error.value = 'Không thể tải thông tin quản trị viên'
    throw err
  } finally {
    loading.value = false
  }
}

// Handle form submission
const handleSubmit = async () => {
  if (loading.value) return

  error.value = ''

  // Basic validation
  if (!formData.value.name) {
    error.value = 'Vui lòng nhập họ và tên'
    return
  }

  // Check if any data has changed
  const hasChanges = JSON.stringify(formData.value) !== JSON.stringify(originalData.value)

  if (!hasChanges) {
    toast.info('Không có thay đổi nào được thực hiện')
    editStatus.value = true // Return to view mode without API call
    return
  }

  // Prepare payload for API
  const payload = {
    name: formData.value.name,
    department: formData.value.department,
    position: formData.value.position,
  }

  loading.value = true
  try {
    const response = await putInfoAdmin(payload)
    if (response && response.data) {
      // Update adminData with the complete response
      adminData.value = response.data

      // Update formData with editable fields
      formData.value = {
        name: response.data.name,
        department: response.data.department,
        position: response.data.position,
      }

      // Store updated data for cancel operation
      originalData.value = { ...formData.value }

      toast.success('Cập nhật thông tin thành công')
      editStatus.value = true // Return to view mode
    }
  } catch (err) {
    console.error('Error updating admin info:', err)
    error.value = 'Không thể cập nhật thông tin quản trị viên'
    toast.error('Cập nhật thông tin không thành công')
  } finally {
    loading.value = false
  }
}

// Handle avatar upload
const handleAvatarUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Validate file type
  if (!file.type.startsWith('image/')) {
    toast.error('Vui lòng chọn file ảnh hợp lệ')
    return
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    toast.error('Kích thước file không được vượt quá 5MB')
    return
  }

  uploadingAvatar.value = true

  try {
    const response = await uploadAvatar(file)
    if (response && response.data) {
      // Update avatar path in local data
      adminData.value.imagePath = response.data
      toast.success('Cập nhật ảnh đại diện thành công')
    }
  } catch (err) {
    console.error('Error uploading avatar:', err)
    toast.error('Không thể cập nhật ảnh đại diện')
  } finally {
    uploadingAvatar.value = false
    // Clear input
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

// Get avatar URL with proper handling
const getAvatarUrl = (imagePath) => {
  if (!imagePath) return '/images/user/default_avatar.svg'

  // If imagePath starts with /uploads/, it's a relative path from our server
  if (imagePath.startsWith('/uploads/')) {
    return `http://localhost:8002${imagePath}`
  }

  // If it's already a full URL or relative path, return as is
  return imagePath
}

// Handle image error (fallback to default avatar)
const handleImageError = (event) => {
  event.target.src = '/images/user/default_avatar.svg'
}
</script>

<style>
.container {
  margin: 1.5rem auto;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.text-error {
  color: red;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.profile-form {
  min-width: 1200px;
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
  border-radius: 10px;
}

.input-box:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.input-box:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
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

.login-button:hover {
  background-color: #a61b2d;
}

.btn-secondary {
  background-color: #6c757d;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.btn-danger {
  background-color: #dc3545;
}

.btn-danger:hover {
  background-color: #c82333;
}

p {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #333333;
  text-align: left;
  width: 100%;
}

.profile-image-container {
  position: relative;
  width: 107px;
  height: 107px;
  margin-bottom: 8px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-image {
  width: auto;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.edit-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 20px;
  height: 20px;
  background-color: blue;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.edit-badge.uploading {
  pointer-events: none;
  opacity: 0.7;
}

.edit-badge input[type='file'] {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.icon-placeholder {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
</style>
