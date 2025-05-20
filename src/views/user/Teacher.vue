<template>
  <div class="teacher-management">
    <v-card>
      <v-card-title>
        Quản lý Giảng viên
        <v-spacer></v-spacer>
        <v-btn color="primary" class="ml-4" @click="openAddModal">
          Thêm Giảng viên
        </v-btn>
      </v-card-title>

      <!-- Bảng dữ liệu với lọc -->
      <v-data-table
        :headers="headers"
        :items="filteredItems"
        :loading="loading"
        class="elevation-1"
        multi-sort
      >
        <!-- Header với filter cho mỗi cột -->
        <template v-slot:headers="{ columns }">
          <tr>
            <th v-for="column in columns" :key="column.key" :class="column.class">
              {{ column.title }}
            </th>
          </tr>
          <tr>
            <th v-for="column in columns" :key="`filter-${column.key}`" :class="column.class">
              <v-text-field
                v-if="column.key !== 'actions' && column.key !== 'isActive'"
                v-model="filters[column.key]"
                hide-details
                density="compact"
                variant="outlined"
                class="filter-input"
                placeholder="Lọc..."
              ></v-text-field>
              <v-select
                v-if="column.key === 'isActive'"
                v-model="filters.isActive"
                :items="statusOptions"
                hide-details
                density="compact"
                variant="outlined"
                class="filter-input"
              ></v-select>
            </th>
          </tr>
        </template>

        <!-- Slot cho cột trạng thái -->
        <template v-slot:item.isActive="{ item }">
          <v-chip
            :color="item.isActive ? 'green' : 'red'"
            text-color="white"
          >
            {{ item.isActive ? 'Đang hoạt động' : 'Vô hiệu hóa' }}
          </v-chip>
        </template>

        <!-- Slot cho cột thao tác -->
        <template v-slot:item.actions="{ item }">
          <v-icon
            size="small"
            class="mr-2"
            @click="openViewModal(item)"
          >
            mdi-eye
          </v-icon>
          <v-icon
            size="small"
            class="mr-2"
            @click="openEditModal(item)"
          >
            mdi-pencil
          </v-icon>
        </template>
      </v-data-table>
    </v-card>

    <!-- Teleport Teacher Modal -->
    <TeleportModal
      v-model="showModal"
      :title="modalTitle"
      :view-only="dialogView"
      :save-disabled="!valid"
      @save="save"
    >
      <v-form ref="form" v-model="valid">
        <v-row>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="editedItem.name"
              label="Họ tên"
              :readonly="dialogView"
              :rules="[v => !!v || 'Vui lòng nhập họ tên']"
              required
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="editedItem.email"
              label="Email"
              :readonly="dialogView"
              :rules="[
                v => !!v || 'Vui lòng nhập email',
                v => /.+@.+\..+/.test(v) || 'Email không hợp lệ'
              ]"
              required
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="editedItem.phone"
              label="Số điện thoại"
              :readonly="dialogView"
              :rules="[v => !!v || 'Vui lòng nhập số điện thoại']"
              required
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="editedItem.department"
              label="Khoa/Bộ môn"
              :readonly="dialogView"
              :rules="[v => !!v || 'Vui lòng nhập khoa/bộ môn']"
              required
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="editedItem.position"
              label="Chức vụ"
              :readonly="dialogView"
              :rules="[v => !!v || 'Vui lòng nhập chức vụ']"
              required
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" v-if="!dialogView && !editedItem.id">
            <v-text-field
              v-model="editedItem.password"
              label="Mật khẩu"
              type="password"
              :rules="[v => !!v || 'Vui lòng nhập mật khẩu']"
              required
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" v-if="editedItem.id">
            <v-switch
              v-model="editedItem.isActive"
              label="Trạng thái hoạt động"
              :readonly="dialogView"
              color="primary"
            ></v-switch>
          </v-col>
        </v-row>
      </v-form>
    </TeleportModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { getTeachers, getTeacherById, createTeacher, updateTeacher } from '@/services/userService'
import TeleportModal from '@/components/TeleportModal.vue'

const teachers = ref([])
const loading = ref(false)
const showModal = ref(false)
const dialogView = ref(false)
const editedIndex = ref(-1)
const valid = ref(false)
const form = ref(null)

// Filters
const filters = reactive({
  id: '',
  name: '',
  email: '',
  phone: '',
  department: '',
  position: '',
  isActive: null
})

const statusOptions = [
  { title: 'Tất cả', value: null },
  { title: 'Đang hoạt động', value: true },
  { title: 'Vô hiệu hóa', value: false }
]

const defaultItem = {
  id: null,
  name: '',
  email: '',
  phone: '',
  department: '',
  position: '',
  password: '',
  isActive: true
}

const editedItem = reactive({...defaultItem})

const headers = [
  { title: 'ID', key: 'id', sortable: true },
  { title: 'Họ tên', key: 'name', sortable: true },
  { title: 'Email', key: 'email', sortable: true },
  { title: 'Số điện thoại', key: 'phone', sortable: true },
  { title: 'Khoa/Bộ môn', key: 'department', sortable: true },
  { title: 'Chức vụ', key: 'position', sortable: true },
  { title: 'Trạng thái', key: 'isActive', sortable: true },
  { title: 'Thao tác', key: 'actions', sortable: false }
]

const modalTitle = computed(() => {
  if (dialogView.value) return 'Chi tiết Giảng viên'
  return editedIndex.value === -1 ? 'Thêm Giảng viên mới' : 'Chỉnh sửa Giảng viên'
})

// Computed property để lọc dữ liệu
const filteredItems = computed(() => {
  return teachers.value.filter(teacher => {
    // Kiểm tra tất cả các điều kiện lọc
    return Object.keys(filters).every(key => {
      // Nếu không có giá trị lọc cho trường này, trả về true
      if (!filters[key] && filters[key] !== false) return true

      // Trường hợp đặc biệt cho isActive vì là boolean
      if (key === 'isActive') {
        return filters[key] === null || teacher[key] === filters[key]
      }

      // Chuyển cả hai giá trị sang chuỗi chữ thường để so sánh không phân biệt chữ hoa/thường
      const teacherValue = String(teacher[key] || '').toLowerCase()
      const filterValue = String(filters[key]).toLowerCase()

      // Kiểm tra nếu chuỗi teacherValue có chứa chuỗi filterValue
      return teacherValue.includes(filterValue)
    })
  })
})

const fetchTeachers = async () => {
  loading.value = true
  try {
    const response = await getTeachers()
    teachers.value = response.data
  } catch (error) {
    console.error('Lỗi khi lấy danh sách giảng viên:', error)
  } finally {
    loading.value = false
  }
}

const fetchTeacherDetail = async (id) => {
  loading.value = true
  try {
    const response = await getTeacherById({ id })
    // Copy the properties to editedItem
    Object.assign(editedItem, response.data)
  } catch (error) {
    console.error('Lỗi khi lấy thông tin chi tiết giảng viên:', error)
  } finally {
    loading.value = false
  }
}

const openAddModal = () => {
  dialogView.value = false
  editedIndex.value = -1
  Object.assign(editedItem, defaultItem)
  showModal.value = true
}

const openViewModal = (item) => {
  editedIndex.value = teachers.value.indexOf(item)
  Object.assign(editedItem, item)
  dialogView.value = true
  showModal.value = true
}

const openEditModal = (item) => {
  editedIndex.value = teachers.value.indexOf(item)
  Object.assign(editedItem, item)
  dialogView.value = false
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  // Wait until dialog closes before resetting form
  setTimeout(() => {
    editedIndex.value = -1
    Object.assign(editedItem, defaultItem)
    if (form.value) form.value.reset()
  }, 300)
}

const save = async () => {
  if (!form.value.validate()) return

  try {
    loading.value = true

    if (editedIndex.value > -1) {
      // Updating existing teacher
      const response = await updateTeacher(editedItem)
      if (response.status === 200) {
        Object.assign(teachers.value[editedIndex.value], response.data)
      }
    } else {
      // Creating new teacher
      const response = await createTeacher(editedItem)
      if (response.status === 200) {
        teachers.value.push(response.data)
      }
    }

    closeModal()
  } catch (error) {
    console.error('Lỗi khi lưu dữ liệu:', error)
  } finally {
    loading.value = false
  }
}

// Reset all filters
const resetFilters = () => {
  for (const key in filters) {
    if (key === 'isActive') {
      filters[key] = null
    } else {
      filters[key] = ''
    }
  }
}

onMounted(() => {
  fetchTeachers()
})
</script>

<style scoped>
.teacher-management {
  padding: 20px;
}
.filter-input {
  margin: 0;
  min-width: 80px;
}
</style>
