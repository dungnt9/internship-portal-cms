<template>
  <div class="internship-application-management">
    <v-card>
      <v-card-title>
        Quản lý Đăng ký Thực tập
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
                v-if="column.key !== 'actions' && column.key !== 'cvFilePath'"
                v-model="filters[column.key]"
                hide-details
                density="compact"
                variant="outlined"
                class="filter-input"
                placeholder="Lọc..."
              ></v-text-field>
            </th>
          </tr>
        </template>

        <!-- Slot cho cột CV file -->
        <template v-slot:item.cvFilePath="{ item }">
          <v-btn
            v-if="item.cvFilePath"
            variant="text"
            color="primary"
            size="small"
            @click="viewFile(item.cvFilePath)"
          >
            <v-icon size="small" class="mr-1">mdi-file-pdf-box</v-icon>
            Xem CV
          </v-btn>
          <span v-else class="text-grey">Chưa có CV</span>
        </template>

        <!-- Slot cho cột details -->
        <template v-slot:item.detailsCount="{ item }">
          <v-chip
            :color="item.details && item.details.length > 0 ? 'green' : 'grey'"
            text-color="white"
            size="small"
          >
            {{ item.details ? item.details.length : 0 }} nguyện vọng
          </v-chip>
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
            size="small"
            class="mr-2"
            color="orange"
            @click="openUploadModal(item)"
          >
            mdi-file-upload
          </v-icon>
          <v-icon
            size="small"
            class="mr-2"
            color="purple"
            @click="openDetailsModal(item)"
          >
            mdi-format-list-bulleted
          </v-icon>
          <v-icon
            size="small"
            color="error"
            @click="deleteApplication(item)"
          >
            mdi-delete
          </v-icon>
        </template>
      </v-data-table>
    </v-card>

    <!-- Main Application Modal -->
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
                :readonly="dialogView"
                :rules="dialogView ? [] : [v => !!v || 'Vui lòng chọn sinh viên']"
                :required="!dialogView"
              ></v-autocomplete>
            </v-col>
            <v-col cols="12" sm="6">
              <v-select
                v-model="editedItem.periodId"
                :items="periods"
                item-title="displayName"
                item-value="id"
                label="Kỳ thực tập"
                :readonly="dialogView"
                :rules="dialogView ? [] : [v => !!v || 'Vui lòng chọn kỳ thực tập']"
                :required="!dialogView"
              ></v-select>
            </v-col>
            <v-col cols="12" v-if="!dialogView">
              <v-file-input
                v-model="cvFile"
                label="File CV (PDF)"
                accept=".pdf"
                prepend-icon="mdi-file-pdf-box"
                :rules="[v => !!v || 'Vui lòng chọn file CV']"
                required
              ></v-file-input>
            </v-col>
            <v-col cols="12" sm="6" v-if="dialogView && editedItem.cvFilePath">
              <v-btn
                variant="outlined"
                color="primary"
                @click="viewFile(editedItem.cvFilePath)"
                block
              >
                <v-icon class="mr-2">mdi-file-pdf-box</v-icon>
                Xem CV
              </v-btn>
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

          <!-- Application Details Section (for view mode) -->
          <v-row v-if="dialogView && editedItem.details && editedItem.details.length > 0">
            <v-col cols="12">
              <h3 class="mb-3">Nguyện vọng thực tập</h3>
              <v-card v-for="(detail, index) in editedItem.details" :key="detail.id" class="mb-2">
                <v-card-text>
                  <v-row>
                    <v-col cols="12" sm="3">
                      <strong>Thứ tự:</strong> {{ detail.preferenceOrder }}
                    </v-col>
                    <v-col cols="12" sm="6">
                      <strong>Vị trí:</strong> {{ detail.positionTitle }}
                    </v-col>
                    <v-col cols="12" sm="3">
                      <v-chip
                        :color="getStatusColor(detail.status)"
                        text-color="white"
                        size="small"
                      >
                        {{ getStatusText(detail.status) }}
                      </v-chip>
                    </v-col>
                    <v-col cols="12" v-if="detail.companyName">
                      <strong>Công ty:</strong> {{ detail.companyName }}
                    </v-col>
                    <v-col cols="12" v-if="detail.note">
                      <strong>Ghi chú:</strong> {{ detail.note }}
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-form>
    </TeleportModal>

    <!-- Upload CV Modal -->
    <TeleportModal
      v-model="showUploadModal"
      title="Cập nhật file CV"
      :save-disabled="!uploadFile"
      @save="updateCV"
    >
      <v-container>
        <v-row>
          <v-col cols="12">
            <v-file-input
              v-model="uploadFile"
              label="File CV mới (PDF)"
              accept=".pdf"
              prepend-icon="mdi-file-pdf-box"
              :rules="[v => !!v || 'Vui lòng chọn file CV']"
              required
            ></v-file-input>
          </v-col>
        </v-row>
      </v-container>
    </TeleportModal>

    <!-- Application Details Modal -->
    <TeleportModal
      v-model="showDetailsModal"
      title="Quản lý Nguyện vọng"
      :hide-save="true"
    >
      <v-container>
        <v-row>
          <v-col cols="12">
            <v-btn
              color="primary"
              class="mb-4"
              @click="openAddDetailModal"
              :disabled="applicationDetails.length >= 3"
            >
              Thêm nguyện vọng mới
            </v-btn>

            <v-alert
              v-if="applicationDetails.length >= 3"
              type="info"
              variant="tonal"
              class="mb-4"
            >
              Đã đạt tối đa 3 nguyện vọng cho đăng ký này
            </v-alert>

            <v-data-table
              :headers="detailHeaders"
              :items="applicationDetails"
              :loading="loadingDetails"
              class="elevation-1"
            >
              <!-- Slot cho cột trạng thái -->
              <template v-slot:item.status="{ item }">
                <v-chip
                  :color="getStatusColor(item.status)"
                  text-color="white"
                  size="small"
                >
                  {{ getStatusText(item.status) }}
                </v-chip>
              </template>

              <!-- Slot cho cột thao tác -->
              <template v-slot:item.actions="{ item }">
                <v-icon
                  size="small"
                  class="mr-2"
                  color="blue"
                  @click="openEditDetailModal(item)"
                >
                  mdi-pencil
                </v-icon>
                <v-icon
                  size="small"
                  color="error"
                  @click="deleteDetail(item)"
                >
                  mdi-delete
                </v-icon>
              </template>
            </v-data-table>
          </v-col>
        </v-row>
      </v-container>
    </TeleportModal>

    <!-- Application Detail Modal -->
    <TeleportModal
      v-model="showDetailModal"
      :title="detailModalTitle"
      :save-disabled="!validDetail || loading"
      @save="saveDetail"
    >
      <v-form ref="detailForm" v-model="validDetail">
        <v-container>
          <v-row>
            <v-col cols="12" sm="6">
              <v-select
                v-model="editedDetail.positionId"
                :items="getAvailablePositions()"
                item-title="displayName"
                item-value="id"
                label="Vị trí thực tập"
                :rules="[v => !!v || 'Vui lòng chọn vị trí']"
                required
              ></v-select>
            </v-col>
            <v-col cols="12" sm="6">
              <v-select
                v-model="editedDetail.preferenceOrder"
                :items="getAvailablePreferenceOrders()"
                label="Thứ tự ưu tiên"
                :rules="[v => !!v || 'Vui lòng chọn thứ tự']"
                required
              ></v-select>
            </v-col>
            <v-col cols="12" sm="6">
              <v-select
                v-model="editedDetail.status"
                :items="detailStatusOptions"
                item-title="title"
                item-value="value"
                label="Trạng thái"
                :rules="[v => !!v || 'Vui lòng chọn trạng thái']"
                required
              ></v-select>
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="editedDetail.note"
                label="Ghi chú"
                rows="3"
              ></v-textarea>
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
  getInternshipApplications,
  createInternshipApplicationWithCV,
  updateInternshipApplication,
  deleteInternshipApplicationById,
  uploadApplicationCV,
  getApplicationDetails,
  createApplicationDetail,
  updateApplicationDetail,
  deleteApplicationDetailById,
  getInternshipPositions
} from '@/services/registrationService'
import { getStudents } from '@/services/userService'
import { getInternshipPeriods } from '@/services/registrationService'
import TeleportModal from '@/components/TeleportModal.vue'

const applications = ref([])
const students = ref([])
const periods = ref([])
const positions = ref([])
const applicationDetails = ref([])
const loading = ref(false)
const loadingStudents = ref(false)
const loadingDetails = ref(false)
const showModal = ref(false)
const showUploadModal = ref(false)
const showDetailsModal = ref(false)
const showDetailModal = ref(false)
const dialogView = ref(false)
const editedIndex = ref(-1)
const editedDetailIndex = ref(-1)
const valid = ref(false)
const validDetail = ref(false)
const form = ref(null)
const detailForm = ref(null)
const cvFile = ref(null)
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
  periodId: ''
})

const defaultItem = {
  id: null,
  studentId: null,
  periodId: '',
  cvFilePath: ''
}

const defaultDetail = {
  id: null,
  applicationId: null,
  positionId: null,
  preferenceOrder: 1,
  status: 'PENDING',
  note: ''
}

const editedItem = reactive({...defaultItem})
const editedDetail = reactive({...defaultDetail})

const headers = [
  { title: 'ID', key: 'id', sortable: true },
  { title: 'MSSV', key: 'studentCode', sortable: true },
  { title: 'Họ tên SV', key: 'studentName', sortable: true },
  { title: 'Email', key: 'studentEmail', sortable: true },
  { title: 'Kỳ thực tập', key: 'periodId', sortable: true },
  { title: 'File CV', key: 'cvFilePath', sortable: false },
  { title: 'Nguyện vọng', key: 'detailsCount', sortable: false },
  { title: 'Ngày tạo', key: 'createdAt', sortable: true },
  { title: 'Ngày cập nhật', key: 'updatedAt', sortable: true },
  { title: 'Thao tác', key: 'actions', sortable: false }
]

const detailHeaders = [
  { title: 'ID', key: 'id', sortable: true },
  { title: 'Vị trí', key: 'positionTitle', sortable: true },
  { title: 'Công ty', key: 'companyName', sortable: true },
  { title: 'Thứ tự', key: 'preferenceOrder', sortable: true },
  { title: 'Trạng thái', key: 'status', sortable: true },
  { title: 'Ghi chú', key: 'note', sortable: false },
  { title: 'Thao tác', key: 'actions', sortable: false }
]

const detailStatusOptions = [
  { title: 'Chờ xử lý', value: 'PENDING' },
  { title: 'Đã duyệt', value: 'APPROVED' },
  { title: 'Từ chối', value: 'REJECTED' },
  { title: 'Đã hủy', value: 'CANCELLED' }
]

const modalTitle = computed(() => {
  if (dialogView.value) return 'Chi tiết Đăng ký thực tập'
  return 'Thêm Đăng ký mới'
})

const detailModalTitle = computed(() => {
  return editedDetailIndex.value === -1 ? 'Thêm Nguyện vọng mới' : 'Chỉnh sửa Nguyện vọng'
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
    'PENDING': 'Chờ xử lý',
    'APPROVED': 'Đã duyệt',
    'REJECTED': 'Từ chối',
    'CANCELLED': 'Đã hủy'
  }
  return texts[status] || status
}

// Get available preference orders (exclude already used orders for current application)
const getAvailablePreferenceOrders = () => {
  const usedOrders = applicationDetails.value
    .filter(detail => detail.id !== editedDetail.id) // Exclude current detail when editing
    .map(detail => detail.preferenceOrder)

  return [1, 2, 3].filter(order => !usedOrders.includes(order))
}

// Get available positions (exclude already selected positions for current application)
const getAvailablePositions = () => {
  const usedPositionIds = applicationDetails.value
    .filter(detail => detail.id !== editedDetail.id) // Exclude current detail when editing
    .map(detail => detail.positionId)

  return positions.value.filter(position => !usedPositionIds.includes(position.id))
}

// Format date
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN')
}

// View file
const viewFile = (filePath) => {
  window.open(filePath, '_blank')
}

// Computed property để lọc dữ liệu
const filteredItems = computed(() => {
  return applications.value.filter(item => {
    return Object.keys(filters).every(key => {
      if (!filters[key]) return true

      const itemValue = String(item[key] || '').toLowerCase()
      const filterValue = String(filters[key]).toLowerCase()

      return itemValue.includes(filterValue)
    })
  })
})

const fetchApplications = async () => {
  loading.value = true
  try {
    const response = await getInternshipApplications()
    applications.value = response.data
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đăng ký thực tập:', error)
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

const fetchPositions = async () => {
  try {
    const response = await getInternshipPositions()
    positions.value = response.data.map(position => ({
      ...position,
      displayName: `${position.title} - ${position.companyName}`
    }))
  } catch (error) {
    console.error('Lỗi khi lấy danh sách vị trí thực tập:', error)
  }
}

const fetchApplicationDetails = async (applicationId) => {
  loadingDetails.value = true
  try {
    const response = await getApplicationDetails(applicationId)
    applicationDetails.value = response.data
  } catch (error) {
    console.error('Lỗi khi lấy danh sách nguyện vọng:', error)
  } finally {
    loadingDetails.value = false
  }
}

const openAddModal = () => {
  dialogView.value = false
  editedIndex.value = -1
  Object.assign(editedItem, defaultItem)
  cvFile.value = null
  showModal.value = true
}

const openViewModal = (item) => {
  editedIndex.value = applications.value.indexOf(item)
  Object.assign(editedItem, item)
  dialogView.value = true
  showModal.value = true
}

const openUploadModal = (item) => {
  selectedItem.value = item
  uploadFile.value = null
  showUploadModal.value = true
}

const openDetailsModal = async (item) => {
  selectedItem.value = item
  await fetchApplicationDetails(item.id)
  showDetailsModal.value = true
}

const openAddDetailModal = () => {
  // Kiểm tra đã có đủ 3 nguyện vọng chưa
  if (applicationDetails.value.length >= 3) {
    alert('Mỗi đăng ký chỉ được có tối đa 3 nguyện vọng!')
    return
  }

  editedDetailIndex.value = -1
  Object.assign(editedDetail, {
    ...defaultDetail,
    applicationId: selectedItem.value.id
  })
  // Fetch positions when opening detail modal
  fetchPositions()
  showDetailModal.value = true
}

const openEditDetailModal = (item) => {
  editedDetailIndex.value = applicationDetails.value.indexOf(item)
  Object.assign(editedDetail, item)
  // Fetch positions when opening detail modal
  fetchPositions()
  showDetailModal.value = true
}

const deleteApplication = (item) => {
  selectedItem.value = item
  confirmTitle.value = 'Xác nhận xóa'
  confirmMessage.value = `Bạn có chắc chắn muốn xóa đăng ký thực tập của sinh viên ${item.studentName}?`
  confirmAction.value = 'delete'
  confirmDialog.value = true
}

const deleteDetail = (item) => {
  selectedItem.value = item
  confirmTitle.value = 'Xác nhận xóa'
  confirmMessage.value = `Bạn có chắc chắn muốn xóa nguyện vọng này?`
  confirmAction.value = 'deleteDetail'
  confirmDialog.value = true
}

const confirmExecute = async () => {
  confirmDialog.value = false
  loading.value = true

  try {
    if (confirmAction.value === 'delete') {
      await deleteInternshipApplicationById(selectedItem.value.id)
      await fetchApplications()
      console.log('Xóa đăng ký thành công!')
    } else if (confirmAction.value === 'deleteDetail') {
      await deleteApplicationDetailById(selectedItem.value.id)
      await fetchApplicationDetails(selectedItem.value.applicationId)
      console.log('Xóa nguyện vọng thành công!')
    }
  } catch (error) {
    console.error('Lỗi khi thực hiện thao tác:', error)
    alert('Có lỗi xảy ra. Vui lòng thử lại!')
  } finally {
    loading.value = false
  }
}

const updateCV = async () => {
  if (!uploadFile.value) return

  loading.value = true
  try {
    await uploadApplicationCV(selectedItem.value.id, uploadFile.value)

    // Đóng modal và reload bảng
    showUploadModal.value = false
    await fetchApplications()

    // Reset form
    uploadFile.value = null

    console.log('Cập nhật CV thành công!')

  } catch (error) {
    console.error('Lỗi khi cập nhật CV:', error)
    alert('Có lỗi xảy ra khi cập nhật CV. Vui lòng thử lại!')
  } finally {
    loading.value = false
  }
}

const save = async () => {
  if (!form.value.validate()) return

  try {
    loading.value = true

    // Chỉ tạo mới, không có chỉnh sửa
    if (!cvFile.value) {
      console.error('CV file is required')
      return
    }

    // Tạo application với CV file - gửi dưới dạng form parameters
    const formData = new FormData()
    formData.append('studentId', editedItem.studentId.toString())
    formData.append('periodId', editedItem.periodId)
    formData.append('cvFile', cvFile.value)

    const response = await createInternshipApplicationWithCV(formData)

    // Đóng modal và reload bảng khi thành công
    showModal.value = false
    await fetchApplications()

    // Reset form
    Object.assign(editedItem, defaultItem)
    cvFile.value = null

    console.log('Tạo đăng ký thực tập thành công!')

  } catch (error) {
    console.error('Lỗi khi lưu dữ liệu:', error)
    // Có thể thêm thông báo lỗi cho user
    alert('Có lỗi xảy ra khi tạo đăng ký. Vui lòng thử lại!')
  } finally {
    loading.value = false
  }
}

const saveDetail = async () => {
  if (!detailForm.value.validate()) return

  try {
    loading.value = true

    if (editedDetailIndex.value > -1) {
      // Update
      await updateApplicationDetail(editedDetail.id, {
        preferenceOrder: editedDetail.preferenceOrder,
        status: editedDetail.status,
        note: editedDetail.note
      })
    } else {
      // Create
      await createApplicationDetail(editedDetail)
    }

    // Đóng modal và reload data
    showDetailModal.value = false
    await fetchApplicationDetails(selectedItem.value.id)

    // Reset form
    Object.assign(editedDetail, defaultDetail)

    console.log('Lưu nguyện vọng thành công!')

  } catch (error) {
    console.error('Lỗi khi lưu nguyện vọng:', error)
    alert('Có lỗi xảy ra khi lưu nguyện vọng. Vui lòng thử lại!')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchApplications()
  fetchStudents()
  fetchPeriods()
  fetchPositions()
})
</script>

<style scoped>
.internship-application-management {
  padding: 20px;
}
.filter-input {
  margin: 0;
  min-width: 80px;
}
</style>
