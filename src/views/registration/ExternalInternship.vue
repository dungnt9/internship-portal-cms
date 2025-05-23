<template>
  <div class="external-internship-management">
    <v-card>
      <v-card-title>
        Quản lý Thực tập đơn vị chưa liên kết
        <v-spacer></v-spacer>
        <v-btn color="primary" class="ml-4" @click="openAddModal">
          Thêm Đăng ký mới
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
                v-if="column.key !== 'actions' && column.key !== 'status'"
                v-model="filters[column.key]"
                hide-details
                density="compact"
                variant="outlined"
                class="filter-input"
                placeholder="Lọc..."
              ></v-text-field>
              <v-select
                v-if="column.key === 'status'"
                v-model="filters[column.key]"
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
        <template v-slot:item.status="{ item }">
          <v-chip
            :color="getStatusColor(item.status)"
            text-color="white"
          >
            {{ getStatusText(item.status) }}
          </v-chip>
        </template>

        <!-- Slot cho cột file -->
        <template v-slot:item.confirmationFilePath="{ item }">
          <v-btn
            v-if="item.confirmationFilePath"
            variant="text"
            color="primary"
            size="small"
            @click="viewFile(item.confirmationFilePath)"
          >
            <v-icon size="small" class="mr-1">mdi-file-pdf-box</v-icon>
            Xem file
          </v-btn>
          <span v-else class="text-grey">Chưa có file</span>
        </template>

        <!-- Slot cho cột ngày tạo -->
        <template v-slot:item.createdAt="{ item }">
          {{ formatDate(item.createdAt) }}
        </template>

        <!-- Slot cho cột ngày cập nhật -->
        <template v-slot:item.updatedAt="{ item }">
          {{ formatDate(item.updatedAt) }}
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
            v-if="item.status === 'PENDING'"
            size="small"
            class="mr-2"
            color="green"
            @click="approveExternalInternship(item)"
          >
            mdi-check-circle
          </v-icon>
          <v-icon
            v-if="item.status === 'PENDING'"
            size="small"
            class="mr-2"
            color="red"
            @click="rejectExternalInternship(item)"
          >
            mdi-close-circle
          </v-icon>
          <v-icon
            size="small"
            class="mr-2"
            color="blue"
            @click="openUploadModal(item)"
          >
            mdi-file-upload
          </v-icon>
          <v-icon
            size="small"
            color="error"
            @click="deleteExternalInternship(item)"
          >
            mdi-delete
          </v-icon>
        </template>
      </v-data-table>
    </v-card>

    <!-- Teleport External Internship Modal -->
    <TeleportModal
      v-model="showModal"
      :title="modalTitle"
      :view-only="dialogView"
      :save-disabled="!valid || loading"
      @save="save"
    >
      <v-form ref="form" v-model="valid">
        <v-container>
          <v-row>
            <v-col cols="12" sm="6">
              <v-autocomplete
                v-model="editedItem.studentId"
                :items="students"
                :loading="loadingStudents"
                item-title="displayName"
                item-value="id"
                label="Sinh viên"
                :readonly="dialogView || editedIndex > -1"
                :rules="[v => !!v || 'Vui lòng chọn sinh viên']"
                required
              ></v-autocomplete>
            </v-col>
            <v-col cols="12" sm="6">
              <v-select
                v-model="editedItem.periodId"
                :items="periods"
                item-title="displayName"
                item-value="id"
                label="Kỳ thực tập"
                :readonly="dialogView || editedIndex > -1"
                :rules="[v => !!v || 'Vui lòng chọn kỳ thực tập']"
                required
              ></v-select>
            </v-col>
            <v-col cols="12" sm="6" v-if="dialogView">
              <v-text-field
                :model-value="getStatusText(editedItem.status)"
                label="Trạng thái"
                readonly
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" v-if="dialogView && editedItem.confirmationFilePath">
              <v-btn
                variant="outlined"
                color="primary"
                @click="viewFile(editedItem.confirmationFilePath)"
                block
              >
                <v-icon class="mr-2">mdi-file-pdf-box</v-icon>
                Xem file xác nhận
              </v-btn>
            </v-col>
            <v-col cols="12" v-if="!dialogView && editedIndex === -1">
              <v-file-input
                v-model="confirmationFile"
                label="File xác nhận (PDF)"
                accept=".pdf"
                prepend-icon="mdi-file-pdf-box"
                :rules="[v => !!v || 'Vui lòng chọn file xác nhận']"
                required
              ></v-file-input>
            </v-col>
            <v-col cols="12" sm="6" v-if="dialogView">
              <v-text-field
                :model-value="formatDate(editedItem.createdAt)"
                label="Ngày tạo"
                readonly
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" v-if="dialogView">
              <v-text-field
                :model-value="formatDate(editedItem.updatedAt)"
                label="Ngày cập nhật"
                readonly
              ></v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-form>
    </TeleportModal>

    <!-- Upload File Modal -->
    <TeleportModal
      v-model="showUploadModal"
      title="Cập nhật file xác nhận"
      :save-disabled="!uploadFile"
      @save="updateConfirmationFile"
    >
      <v-container>
        <v-row>
          <v-col cols="12">
            <v-file-input
              v-model="uploadFile"
              label="File xác nhận mới (PDF)"
              accept=".pdf"
              prepend-icon="mdi-file-pdf-box"
              :rules="[v => !!v || 'Vui lòng chọn file xác nhận']"
              required
            ></v-file-input>
          </v-col>
        </v-row>
      </v-container>
    </TeleportModal>

    <!-- Confirm Dialog -->
    <v-dialog v-model="confirmDialog" max-width="400">
      <v-card>
        <v-card-title>{{ confirmTitle }}</v-card-title>
        <v-card-text>{{ confirmMessage }}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="confirmDialog = false">Hủy</v-btn>
          <v-btn
            :color="confirmAction === 'approve' ? 'green' : confirmAction === 'reject' ? 'red' : 'error'"
            variant="flat"
            @click="confirmExecute"
          >
            Xác nhận
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import {
  getExternalInternships,
  getExternalInternshipById,
  createExternalInternship,
  updateExternalInternshipStatus,
  updateExternalInternshipFile,
  deleteExternalInternshipById
} from '@/services/registrationService'
import { getStudents } from '@/services/userService'
import { getInternshipPeriods } from '@/services/registrationService'
import TeleportModal from '@/components/TeleportModal.vue'

const externalInternships = ref([])
const students = ref([])
const periods = ref([])
const loading = ref(false)
const loadingStudents = ref(false)
const showModal = ref(false)
const showUploadModal = ref(false)
const dialogView = ref(false)
const editedIndex = ref(-1)
const valid = ref(false)
const form = ref(null)
const confirmationFile = ref(null)
const uploadFile = ref(null)
const selectedItem = ref(null)

// Confirm dialog
const confirmDialog = ref(false)
const confirmTitle = ref('')
const confirmMessage = ref('')
const confirmAction = ref('')

// Filters
const filters = reactive({
  id: '',
  studentCode: '',
  studentName: '',
  studentEmail: '',
  periodId: '',
  status: null
})

const statusOptions = [
  { title: 'Tất cả', value: null },
  { title: 'Chờ duyệt', value: 'PENDING' },
  { title: 'Đã duyệt', value: 'APPROVED' },
  { title: 'Từ chối', value: 'REJECTED' },
  { title: 'Đã hủy', value: 'CANCELLED' }
]

const defaultItem = {
  id: null,
  studentId: null,
  periodId: '',
  confirmationFilePath: '',
  status: 'PENDING'
}

const editedItem = reactive({...defaultItem})

const headers = [
  { title: 'ID', key: 'id', sortable: true },
  { title: 'MSSV', key: 'studentCode', sortable: true },
  { title: 'Họ tên SV', key: 'studentName', sortable: true },
  { title: 'Email', key: 'studentEmail', sortable: true },
  { title: 'Kỳ thực tập', key: 'periodId', sortable: true },
  { title: 'File xác nhận', key: 'confirmationFilePath', sortable: false },
  { title: 'Trạng thái', key: 'status', sortable: true },
  { title: 'Ngày tạo', key: 'createdAt', sortable: true },
  { title: 'Ngày cập nhật', key: 'updatedAt', sortable: true },
  { title: 'Thao tác', key: 'actions', sortable: false }
]

const modalTitle = computed(() => {
  if (dialogView.value) return 'Chi tiết Đăng ký thực tập ngoài'
  return editedIndex.value === -1 ? 'Thêm Đăng ký mới' : 'Chỉnh sửa Đăng ký'
})

// Get status color
const getStatusColor = (status) => {
  const colors = {
    'PENDING': 'orange',
    'APPROVED': 'green',
    'REJECTED': 'red',
    'CANCELLED': 'grey'
  }
  return colors[status] || 'grey'
}

// Get status text
const getStatusText = (status) => {
  const texts = {
    'PENDING': 'Chờ duyệt',
    'APPROVED': 'Đã duyệt',
    'REJECTED': 'Từ chối',
    'CANCELLED': 'Đã hủy'
  }
  return texts[status] || status
}

// Format date
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN')
}

// View file
const viewFile = (filePath) => {
  // In real app, this would open the file or download it
  window.open(filePath, '_blank')
}

// Computed property để lọc dữ liệu
const filteredItems = computed(() => {
  return externalInternships.value.filter(item => {
    return Object.keys(filters).every(key => {
      if (!filters[key] && filters[key] !== false) return true

      if (key === 'status') {
        return filters[key] === null || item[key] === filters[key]
      }

      const itemValue = String(item[key] || '').toLowerCase()
      const filterValue = String(filters[key]).toLowerCase()

      return itemValue.includes(filterValue)
    })
  })
})

const fetchExternalInternships = async () => {
  loading.value = true
  try {
    const response = await getExternalInternships()
    externalInternships.value = response.data
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đăng ký thực tập ngoài:', error)
  } finally {
    loading.value = false
  }
}

const fetchStudents = async () => {
  loadingStudents.value = true
  try {
    const response = await getStudents()
    students.value = response.data.map(student => ({
      ...student,
      displayName: `${student.studentCode} - ${student.name}`
    }))
  } catch (error) {
    console.error('Lỗi khi lấy danh sách sinh viên:', error)
  } finally {
    loadingStudents.value = false
  }
}

const fetchPeriods = async () => {
  try {
    const response = await getInternshipPeriods()
    periods.value = response.data.map(period => ({
      ...period,
      displayName: `${period.id} - ${period.description}`
    }))
  } catch (error) {
    console.error('Lỗi khi lấy danh sách kỳ thực tập:', error)
  }
}

const openAddModal = () => {
  dialogView.value = false
  editedIndex.value = -1
  Object.assign(editedItem, defaultItem)
  confirmationFile.value = null
  showModal.value = true
}

const openViewModal = (item) => {
  editedIndex.value = externalInternships.value.indexOf(item)
  Object.assign(editedItem, item)
  dialogView.value = true
  showModal.value = true
}

const openUploadModal = (item) => {
  selectedItem.value = item
  uploadFile.value = null
  showUploadModal.value = true
}

const approveExternalInternship = (item) => {
  selectedItem.value = item
  confirmTitle.value = 'Xác nhận duyệt'
  confirmMessage.value = `Bạn có chắc chắn muốn duyệt đăng ký thực tập ngoài của sinh viên ${item.studentName}?`
  confirmAction.value = 'approve'
  confirmDialog.value = true
}

const rejectExternalInternship = (item) => {
  selectedItem.value = item
  confirmTitle.value = 'Xác nhận từ chối'
  confirmMessage.value = `Bạn có chắc chắn muốn từ chối đăng ký thực tập ngoài của sinh viên ${item.studentName}?`
  confirmAction.value = 'reject'
  confirmDialog.value = true
}

const deleteExternalInternship = (item) => {
  selectedItem.value = item
  confirmTitle.value = 'Xác nhận xóa'
  confirmMessage.value = `Bạn có chắc chắn muốn xóa đăng ký thực tập ngoài của sinh viên ${item.studentName}?`
  confirmAction.value = 'delete'
  confirmDialog.value = true
}

const confirmExecute = async () => {
  confirmDialog.value = false
  loading.value = true

  try {
    if (confirmAction.value === 'approve') {
      await updateExternalInternshipStatus(selectedItem.value.id, { status: 'APPROVED' })
    } else if (confirmAction.value === 'reject') {
      await updateExternalInternshipStatus(selectedItem.value.id, { status: 'REJECTED' })
    } else if (confirmAction.value === 'delete') {
      await deleteExternalInternshipById(selectedItem.value.id)
    }
    await fetchExternalInternships()
  } catch (error) {
    console.error('Lỗi khi thực hiện thao tác:', error)
  } finally {
    loading.value = false
  }
}

const updateConfirmationFile = async () => {
  if (!uploadFile.value) return

  loading.value = true
  try {
    await updateExternalInternshipFile(selectedItem.value.id, uploadFile.value)
    showUploadModal.value = false
    await fetchExternalInternships()
  } catch (error) {
    console.error('Lỗi khi cập nhật file:', error)
  } finally {
    loading.value = false
  }
}

const save = async () => {
  if (!form.value.validate()) return

  try {
    loading.value = true

    const formData = new FormData()
    const data = {
      studentId: editedItem.studentId,
      periodId: editedItem.periodId
    }
    formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }))
    formData.append('confirmationFile', confirmationFile.value)

    const response = await createExternalInternship(formData)
    if (response.status === 201) {
      await fetchExternalInternships()
    }

    showModal.value = false
  } catch (error) {
    console.error('Lỗi khi lưu dữ liệu:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchExternalInternships()
  fetchStudents()
  fetchPeriods()
})
</script>

<style scoped>
.external-internship-management {
  padding: 20px;
}
.filter-input {
  margin: 0;
  min-width: 80px;
}
</style>
