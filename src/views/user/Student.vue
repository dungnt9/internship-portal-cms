<template>
  <div class="student-management">
    <v-card>
      <v-card-title>
        Quản lý Sinh viên
        <v-spacer></v-spacer>
        <v-btn color="primary" class="ml-4" @click="openAddModal">
          Thêm Sinh viên
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
                v-if="column.key !== 'actions' && column.key !== 'isActive' && column.key !== 'gender'"
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
              <v-select
                v-if="column.key === 'gender'"
                v-model="filters.gender"
                :items="genderOptions"
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

    <!-- Teleport Student Modal -->
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
              v-model="editedItem.studentCode"
              label="Mã sinh viên"
              :readonly="dialogView || editedItem.id"
              :rules="[v => !!v || 'Vui lòng nhập mã sinh viên']"
              required
            ></v-text-field>
          </v-col>
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
              v-model="editedItem.className"
              label="Lớp"
              :readonly="dialogView"
              :rules="[v => !!v || 'Vui lòng nhập lớp']"
              required
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="editedItem.major"
              label="Chuyên ngành"
              :readonly="dialogView"
              :rules="[v => !!v || 'Vui lòng nhập chuyên ngành']"
              required
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-select
              v-model="editedItem.gender"
              :items="['Male', 'Female', 'Other']"
              label="Giới tính"
              :readonly="dialogView"
              :rules="[v => !!v || 'Vui lòng chọn giới tính']"
              required
            ></v-select>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="editedItem.birthday"
              label="Ngày sinh"
              type="date"
              :readonly="dialogView"
              :rules="[v => !!v || 'Vui lòng nhập ngày sinh']"
              required
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="12">
            <v-text-field
              v-model="editedItem.address"
              label="Địa chỉ"
              :readonly="dialogView"
              :rules="[v => !!v || 'Vui lòng nhập địa chỉ']"
              required
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="editedItem.cpa"
              label="CPA"
              type="number"
              step="0.01"
              min="0"
              max="4"
              :readonly="dialogView"
              :rules="[
                v => !!v || 'Vui lòng nhập CPA',
                v => (v >= 0 && v <= 4) || 'CPA phải từ 0 đến 4'
              ]"
              required
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="4">
            <v-select
              v-model="editedItem.englishLevel"
              :items="['Beginner', 'Elementary', 'Intermediate', 'Upper Intermediate', 'Advanced', 'Proficient']"
              label="Trình độ tiếng Anh"
              :readonly="dialogView"
              :rules="[v => !!v || 'Vui lòng chọn trình độ tiếng Anh']"
              required
            ></v-select>
          </v-col>
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="editedItem.skills"
              label="Kỹ năng"
              :readonly="dialogView"
              :rules="[v => !!v || 'Vui lòng nhập kỹ năng']"
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
import { getStudents, getStudentById, createStudent, updateStudent } from '@/services/userService'
import TeleportModal from '@/components/TeleportModal.vue'

const students = ref([])
const loading = ref(false)
const showModal = ref(false)
const dialogView = ref(false)
const editedIndex = ref(-1)
const valid = ref(false)
const form = ref(null)

// Filters
const filters = reactive({
  id: '',
  studentCode: '',
  name: '',
  className: '',
  major: '',
  gender: null,
  email: '',
  phone: '',
  cpa: '',
  englishLevel: '',
  skills: '',
  isActive: null
})

const statusOptions = [
  { title: 'Tất cả', value: null },
  { title: 'Đang hoạt động', value: true },
  { title: 'Vô hiệu hóa', value: false }
]

const genderOptions = [
  { title: 'Tất cả', value: null },
  { title: 'Nam', value: 'Male' },
  { title: 'Nữ', value: 'Female' },
  { title: 'Khác', value: 'Other' }
]

const defaultItem = {
  id: null,
  authUserId: null,
  studentCode: '',
  name: '',
  className: '',
  major: '',
  gender: '',
  birthday: '',
  address: '',
  cpa: '',
  englishLevel: '',
  skills: '',
  imagePath: null,
  email: '',
  phone: '',
  password: '',
  isActive: true
}

const editedItem = reactive({...defaultItem})

const headers = [
  { title: 'ID', key: 'id', sortable: true },
  { title: 'Mã SV', key: 'studentCode', sortable: true },
  { title: 'Họ tên', key: 'name', sortable: true },
  { title: 'Lớp', key: 'className', sortable: true },
  { title: 'Chuyên ngành', key: 'major', sortable: true },
  { title: 'Giới tính', key: 'gender', sortable: true },
  { title: 'CPA', key: 'cpa', sortable: true },
  { title: 'Trình độ TA', key: 'englishLevel', sortable: true },
  { title: 'Email', key: 'email', sortable: true },
  { title: 'SĐT', key: 'phone', sortable: true },
  { title: 'Trạng thái', key: 'isActive', sortable: true },
  { title: 'Thao tác', key: 'actions', sortable: false }
]

const modalTitle = computed(() => {
  if (dialogView.value) return 'Chi tiết Sinh viên'
  return editedIndex.value === -1 ? 'Thêm Sinh viên mới' : 'Chỉnh sửa Sinh viên'
})

// Computed property để lọc dữ liệu
const filteredItems = computed(() => {
  return students.value.filter(student => {
    // Kiểm tra tất cả các điều kiện lọc
    return Object.keys(filters).every(key => {
      // Nếu không có giá trị lọc cho trường này, trả về true
      if (!filters[key] && filters[key] !== false) return true

      // Trường hợp đặc biệt cho isActive vì là boolean
      if (key === 'isActive') {
        return filters[key] === null || student[key] === filters[key]
      }

      // Trường hợp đặc biệt cho gender
      if (key === 'gender') {
        return filters[key] === null || student[key] === filters[key]
      }

      // Xử lý cho cpa (số)
      if (key === 'cpa') {
        if (!filters[key]) return true
        const studentCPA = parseFloat(student[key] || 0)
        const filterCPA = parseFloat(filters[key])
        return !isNaN(filterCPA) && studentCPA.toString().includes(filters[key])
      }

      // Chuyển cả hai giá trị sang chuỗi chữ thường để so sánh không phân biệt chữ hoa/thường
      const studentValue = String(student[key] || '').toLowerCase()
      const filterValue = String(filters[key]).toLowerCase()

      // Kiểm tra nếu chuỗi studentValue có chứa chuỗi filterValue
      return studentValue.includes(filterValue)
    })
  })
})

const fetchStudents = async () => {
  loading.value = true
  try {
    const response = await getStudents()
    students.value = response.data
  } catch (error) {
    console.error('Lỗi khi lấy danh sách sinh viên:', error)
  } finally {
    loading.value = false
  }
}

const fetchStudentDetail = async (id) => {
  loading.value = true
  try {
    const response = await getStudentById({ id })
    // Copy the properties to editedItem
    Object.assign(editedItem, response.data)
  } catch (error) {
    console.error('Lỗi khi lấy thông tin chi tiết sinh viên:', error)
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
  editedIndex.value = students.value.indexOf(item)
  Object.assign(editedItem, item)
  dialogView.value = true
  showModal.value = true
}

const openEditModal = (item) => {
  editedIndex.value = students.value.indexOf(item)
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
      // Updating existing student
      const response = await updateStudent(editedItem)
      if (response.status === 200) {
        Object.assign(students.value[editedIndex.value], response.data)
      }
    } else {
      // Creating new student
      const response = await createStudent(editedItem)
      if (response.status === 200) {
        students.value.push(response.data)
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
    if (key === 'isActive' || key === 'gender') {
      filters[key] = null
    } else {
      filters[key] = ''
    }
  }
}

onMounted(() => {
  fetchStudents()
})
</script>

<style scoped>
.student-management {
  padding: 20px;
}
.filter-input {
  margin: 0;
  min-width: 80px;
}
</style>
