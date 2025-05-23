<template>
  <div class="internship-period-management">
    <v-card>
      <v-card-title>
        Quản lý Kỳ thực tập
        <v-spacer></v-spacer>
        <v-btn color="primary" class="ml-4" @click="openAddModal">
          Thêm Kỳ thực tập mới
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

        <!-- Slot cho cột ngày bắt đầu -->
        <template v-slot:item.startDate="{ item }">
          {{ formatDate(item.startDate) }}
        </template>

        <!-- Slot cho cột ngày kết thúc -->
        <template v-slot:item.endDate="{ item }">
          {{ formatDate(item.endDate) }}
        </template>

        <!-- Slot cho cột ngày bắt đầu đăng ký -->
        <template v-slot:item.registrationStartDate="{ item }">
          {{ formatDate(item.registrationStartDate) }}
        </template>

        <!-- Slot cho cột ngày kết thúc đăng ký -->
        <template v-slot:item.registrationEndDate="{ item }">
          {{ formatDate(item.registrationEndDate) }}
        </template>

        <!-- Slot cho cột ngày tạo -->
        <template v-slot:item.createdAt="{ item }">
          {{ formatDateTime(item.createdAt) }}
        </template>

        <!-- Slot cho cột ngày cập nhật -->
        <template v-slot:item.updatedAt="{ item }">
          {{ formatDateTime(item.updatedAt) }}
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
            color="blue"
            @click="openEditModal(item)"
          >
            mdi-pencil
          </v-icon>
          <v-icon
            size="small"
            color="error"
            @click="deleteInternshipPeriodConfirm(item)"
          >
            mdi-delete
          </v-icon>
        </template>
      </v-data-table>
    </v-card>

    <!-- Teleport Period Modal -->
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
              <v-text-field
                v-model="editedItem.id"
                label="Mã kỳ thực tập"
                :readonly="dialogView || editedIndex > -1"
                :rules="[v => !!v || 'Vui lòng nhập mã kỳ thực tập']"
                required
                hint="Ví dụ: 2024.2, 2025.1"
                persistent-hint
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-select
                v-model="editedItem.status"
                :items="statusSelectOptions"
                label="Trạng thái"
                :readonly="dialogView"
                :rules="[v => !!v || 'Vui lòng chọn trạng thái']"
                required
              ></v-select>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="editedItem.startDate"
                label="Ngày bắt đầu thực tập"
                type="date"
                :readonly="dialogView"
                :rules="[v => !!v || 'Vui lòng chọn ngày bắt đầu']"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="editedItem.endDate"
                label="Ngày kết thúc thực tập"
                type="date"
                :readonly="dialogView"
                :rules="[
                  v => !!v || 'Vui lòng chọn ngày kết thúc',
                  v => !editedItem.startDate || new Date(v) > new Date(editedItem.startDate) || 'Ngày kết thúc phải sau ngày bắt đầu'
                ]"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="editedItem.registrationStartDate"
                label="Ngày bắt đầu đăng ký"
                type="date"
                :readonly="dialogView"
                :rules="[v => !!v || 'Vui lòng chọn ngày bắt đầu đăng ký']"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="editedItem.registrationEndDate"
                label="Ngày kết thúc đăng ký"
                type="date"
                :readonly="dialogView"
                :rules="[
                  v => !!v || 'Vui lòng chọn ngày kết thúc đăng ký',
                  v => !editedItem.registrationStartDate || new Date(v) > new Date(editedItem.registrationStartDate) || 'Ngày kết thúc đăng ký phải sau ngày bắt đầu đăng ký'
                ]"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="editedItem.description"
                label="Mô tả"
                :readonly="dialogView"
                :rules="[v => !!v || 'Vui lòng nhập mô tả']"
                required
                rows="3"
              ></v-textarea>
            </v-col>
            <v-col cols="12" sm="6" v-if="dialogView && editedItem.createdAt">
              <v-text-field
                :model-value="formatDateTime(editedItem.createdAt)"
                label="Ngày tạo"
                readonly
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" v-if="dialogView && editedItem.updatedAt">
              <v-text-field
                :model-value="formatDateTime(editedItem.updatedAt)"
                label="Ngày cập nhật"
                readonly
              ></v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-form>
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
            color="error"
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
  getAdminInternshipPeriods,
  getAdminInternshipPeriodById,
  createInternshipPeriod,
  updateInternshipPeriod,
  deleteInternshipPeriod
} from '@/services/registrationService'
import TeleportModal from '@/components/TeleportModal.vue'

const internshipPeriods = ref([])
const loading = ref(false)
const showModal = ref(false)
const dialogView = ref(false)
const editedIndex = ref(-1)
const valid = ref(false)
const form = ref(null)
const selectedItem = ref(null)

// Confirm dialog
const confirmDialog = ref(false)
const confirmTitle = ref('')
const confirmMessage = ref('')

// Filters
const filters = reactive({
  id: '',
  description: '',
  status: null,
  startDate: '',
  endDate: ''
})

const statusOptions = [
  { title: 'Tất cả', value: null },
  { title: 'Hoạt động', value: 'ACTIVE' },
  { title: 'Sắp tới', value: 'UPCOMING' },
  { title: 'Đã kết thúc', value: 'END' }
]

const statusSelectOptions = [
  { title: 'Hoạt động', value: 'ACTIVE' },
  { title: 'Sắp tới', value: 'UPCOMING' },
  { title: 'Đã kết thúc', value: 'END' }
]

const defaultItem = {
  id: '',
  startDate: '',
  endDate: '',
  registrationStartDate: '',
  registrationEndDate: '',
  status: 'UPCOMING',
  description: '',
  createdAt: null,
  updatedAt: null
}

const editedItem = reactive({...defaultItem})

const headers = [
  { title: 'Mã kỳ', key: 'id', sortable: true },
  { title: 'Mô tả', key: 'description', sortable: true },
  { title: 'Ngày bắt đầu', key: 'startDate', sortable: true },
  { title: 'Ngày kết thúc', key: 'endDate', sortable: true },
  { title: 'Bắt đầu ĐK', key: 'registrationStartDate', sortable: true },
  { title: 'Kết thúc ĐK', key: 'registrationEndDate', sortable: true },
  { title: 'Trạng thái', key: 'status', sortable: true },
  { title: 'Ngày tạo', key: 'createdAt', sortable: true },
  { title: 'Ngày cập nhật', key: 'updatedAt', sortable: true },
  { title: 'Thao tác', key: 'actions', sortable: false }
]

const modalTitle = computed(() => {
  if (dialogView.value) return 'Chi tiết Kỳ thực tập'
  return editedIndex.value === -1 ? 'Thêm Kỳ thực tập mới' : 'Chỉnh sửa Kỳ thực tập'
})

// Get status color
const getStatusColor = (status) => {
  const colors = {
    'ACTIVE': 'green',
    'UPCOMING': 'blue',
    'END': 'grey'
  }
  return colors[status] || 'grey'
}

// Get status text
const getStatusText = (status) => {
  const texts = {
    'ACTIVE': 'Hoạt động',
    'UPCOMING': 'Sắp tới',
    'END': 'Đã kết thúc'
  }
  return texts[status] || status
}

// Format date (YYYY-MM-DD)
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN')
}

// Format datetime
const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN')
}

// Computed property để lọc dữ liệu
const filteredItems = computed(() => {
  return internshipPeriods.value.filter(item => {
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

const fetchInternshipPeriods = async () => {
  loading.value = true
  try {
    const response = await getAdminInternshipPeriods()
    internshipPeriods.value = response.data
  } catch (error) {
    console.error('Lỗi khi lấy danh sách kỳ thực tập:', error)
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
  editedIndex.value = internshipPeriods.value.indexOf(item)
  Object.assign(editedItem, item)
  dialogView.value = true
  showModal.value = true
}

const openEditModal = (item) => {
  editedIndex.value = internshipPeriods.value.indexOf(item)
  Object.assign(editedItem, item)
  dialogView.value = false
  showModal.value = true
}

const deleteInternshipPeriodConfirm = (item) => {
  selectedItem.value = item
  confirmTitle.value = 'Xác nhận xóa'
  confirmMessage.value = `Bạn có chắc chắn muốn xóa kỳ thực tập "${item.id} - ${item.description}"?`
  confirmDialog.value = true
}

const confirmExecute = async () => {
  confirmDialog.value = false
  loading.value = true

  try {
    await deleteInternshipPeriod(selectedItem.value.id)
    await fetchInternshipPeriods()
  } catch (error) {
    console.error('Lỗi khi xóa kỳ thực tập:', error)
  } finally {
    loading.value = false
  }
}

const save = async () => {
  if (!form.value.validate()) return

  try {
    loading.value = true

    const periodData = {
      id: editedItem.id,
      startDate: editedItem.startDate,
      endDate: editedItem.endDate,
      registrationStartDate: editedItem.registrationStartDate,
      registrationEndDate: editedItem.registrationEndDate,
      status: editedItem.status,
      description: editedItem.description
    }

    if (editedIndex.value === -1) {
      // Create new period
      await createInternshipPeriod(periodData)
    } else {
      // Update existing period
      await updateInternshipPeriod(editedItem.id, periodData)
    }

    await fetchInternshipPeriods()
    showModal.value = false
  } catch (error) {
    console.error('Lỗi khi lưu dữ liệu:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchInternshipPeriods()
})
</script>

<style scoped>
.internship-period-management {
  padding: 20px;
}
.filter-input {
  margin: 0;
  min-width: 80px;
}
</style>
