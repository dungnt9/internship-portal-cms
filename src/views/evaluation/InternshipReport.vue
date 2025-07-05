<template>
  <div class="internship-report-management">
    <v-card>
      <v-card-title>
        Quản lý Báo cáo Thực tập
        <v-spacer></v-spacer>
        <v-select
          v-model="selectedPeriod"
          :items="periods"
          item-title="displayName"
          item-value="id"
          label="Lọc theo kỳ thực tập"
          variant="outlined"
          density="compact"
          style="width: 300px"
          clearable
          @update:model-value="applyFilters"
        ></v-select>
        <v-btn color="primary" class="ml-4" @click="openAddModal"> Thêm Báo cáo mới </v-btn>
      </v-card-title>

      <!-- Bảng dữ liệu với lọc -->
      <v-data-table
        :headers="headers"
        :items="filteredItems"
        :loading="loading"
        class="elevation-1"
        multi-sort
        :items-per-page="15"
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
                v-if="
                  column.key !== 'actions' &&
                  column.key !== 'filePath' &&
                  column.key !== 'isEditable' &&
                  column.key !== 'isExternal'
                "
                v-model="filters[column.key]"
                hide-details
                density="compact"
                variant="outlined"
                class="filter-input"
                placeholder="Lọc..."
                @input="applyFilters"
              ></v-text-field>
              <v-select
                v-if="column.key === 'isExternal'"
                v-model="filters[column.key]"
                :items="externalOptions"
                hide-details
                density="compact"
                variant="outlined"
                class="filter-input"
                @update:model-value="applyFilters"
              ></v-select>
              <v-select
                v-if="column.key === 'isEditable'"
                v-model="filters.submitted"
                :items="submittedOptions"
                hide-details
                density="compact"
                variant="outlined"
                class="filter-input"
                @update:model-value="applyFilters"
              ></v-select>
            </th>
          </tr>
        </template>

        <!-- Slot cho cột loại thực tập -->
        <template v-slot:item.isExternal="{ item }">
          <v-chip :color="item.isExternal ? 'orange' : 'blue'" text-color="white" size="small">
            {{ item.isExternal ? 'Chưa liên kết' : 'Liên kết' }}
          </v-chip>
        </template>

        <!-- Slot cho cột file -->
        <template v-slot:item.filePath="{ item }">
          <v-btn
            v-if="item.filePath"
            variant="text"
            color="primary"
            size="small"
            @click="viewFile(item.filePath)"
          >
            <v-icon size="small" class="mr-1">mdi-file-pdf-box</v-icon>
            Xem file
          </v-btn>
          <span v-else class="text-grey">Chưa có file</span>
        </template>

        <!-- Slot cho trạng thái có thể chỉnh sửa -->
        <template v-slot:item.isEditable="{ item }">
          <v-chip :color="item.isEditable ? 'orange' : 'green'" text-color="white" size="small">
            {{ item.isEditable ? 'Có thể sửa' : 'Đã nộp' }}
          </v-chip>
        </template>

        <!-- Slot cho cột ngày nộp -->
        <template v-slot:item.submissionDate="{ item }">
          {{ item.submissionDate ? formatDate(item.submissionDate) : 'Chưa nộp' }}
        </template>

        <!-- Slot cho cột thao tác -->
        <template v-slot:item.actions="{ item }">
          <v-icon size="small" class="mr-2" @click="openViewModal(item)"> mdi-eye </v-icon>
          <v-icon size="small" class="mr-2" color="blue" @click="openEditModal(item)">
            mdi-pencil
          </v-icon>
          <v-icon size="small" class="mr-2" color="orange" @click="openUploadModal(item)">
            mdi-file-upload
          </v-icon>
          <v-icon size="small" color="error" @click="deleteReport(item)"> mdi-delete </v-icon>
        </template>
      </v-data-table>
    </v-card>

    <!-- Main Report Modal -->
    <TeleportModal
      v-model="showModal"
      :title="modalTitle"
      :view-only="dialogView"
      :save-disabled="!valid || loading"
      @save="save"
      max-width="1000"
    >
      <v-form ref="form" v-model="valid">
        <v-container>
          <v-row>
            <!-- Progress Selection (Only for Add mode) -->
            <v-col cols="12" sm="6" v-if="editedIndex === -1">
              <v-autocomplete
                v-model="editedItem.progressId"
                :items="availableProgress"
                :loading="loadingProgress"
                item-title="displayName"
                item-value="id"
                label="Chọn tiến trình thực tập"
                :readonly="dialogView"
                :rules="[(v) => !!v || 'Vui lòng chọn tiến trình thực tập']"
                required
                @update:model-value="onProgressChange"
              ></v-autocomplete>
            </v-col>

            <!-- Student Info (Read-only) -->
            <v-col cols="12" sm="6" v-if="editedItem.studentName">
              <v-text-field
                :model-value="`${editedItem.studentCode} - ${editedItem.studentName}`"
                label="Sinh viên"
                readonly
                variant="outlined"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" v-if="editedItem.studentEmail">
              <v-text-field
                :model-value="editedItem.studentEmail"
                label="Email sinh viên"
                readonly
                variant="outlined"
              ></v-text-field>
            </v-col>

            <!-- Internship Info (Read-only) -->
            <v-col cols="12" sm="6" v-if="editedItem.periodId">
              <v-text-field
                :model-value="editedItem.periodId"
                label="Kỳ thực tập"
                readonly
                variant="outlined"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" v-if="editedItem.companyName">
              <v-text-field
                :model-value="editedItem.companyName"
                label="Công ty"
                readonly
                variant="outlined"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" v-if="editedItem.positionTitle">
              <v-text-field
                :model-value="editedItem.positionTitle"
                label="Vị trí thực tập"
                readonly
                variant="outlined"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" v-if="editedItem.isExternal !== null">
              <v-text-field
                :model-value="editedItem.isExternal ? 'Chưa liên kết' : 'Liên kết'"
                label="Loại thực tập"
                readonly
                variant="outlined"
              ></v-text-field>
            </v-col>

            <!-- Report Content -->
            <v-col cols="12">
              <v-text-field
                v-model="editedItem.title"
                label="Tiêu đề báo cáo"
                :readonly="dialogView"
                :rules="[(v) => !!v || 'Vui lòng nhập tiêu đề báo cáo']"
                required
              ></v-text-field>
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="editedItem.content"
                label="Nội dung báo cáo"
                :readonly="dialogView"
                :rules="[(v) => !!v || 'Vui lòng nhập nội dung báo cáo']"
                required
                rows="10"
                auto-grow
              ></v-textarea>
            </v-col>

            <!-- File Upload (Only for Add mode) -->
            <v-col cols="12" v-if="editedIndex === -1 && !dialogView">
              <v-file-input
                v-model="reportFile"
                label="File báo cáo (PDF, DOC, DOCX)"
                accept=".pdf,.doc,.docx"
                prepend-icon="mdi-file-document"
                show-size
              ></v-file-input>
            </v-col>

            <!-- File Info (View/Edit mode) -->
            <v-col cols="12" sm="6" v-if="editedIndex > -1 && editedItem.filePath">
              <v-btn
                variant="outlined"
                color="primary"
                @click="viewFile(editedItem.filePath)"
                block
              >
                <v-icon class="mr-2">mdi-file-document</v-icon>
                Xem file báo cáo
              </v-btn>
            </v-col>

            <!-- Status Info (View mode) -->
            <template v-if="dialogView">
              <v-col cols="12"><v-divider></v-divider></v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  :model-value="editedItem.isEditable ? 'Có thể chỉnh sửa' : 'Đã nộp'"
                  label="Trạng thái"
                  readonly
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" v-if="editedItem.submissionDate">
                <v-text-field
                  :model-value="formatDate(editedItem.submissionDate)"
                  label="Ngày nộp"
                  readonly
                  variant="outlined"
                ></v-text-field>
              </v-col>
            </template>
          </v-row>
        </v-container>
      </v-form>
    </TeleportModal>

    <!-- Upload File Modal -->
    <TeleportModal
      v-model="showUploadModal"
      title="Cập nhật file báo cáo"
      :save-disabled="!uploadFile"
      @save="updateFile"
    >
      <v-container>
        <v-row>
          <v-col cols="12">
            <v-file-input
              v-model="uploadFile"
              label="File báo cáo mới (PDF, DOC, DOCX)"
              accept=".pdf,.doc,.docx"
              prepend-icon="mdi-file-document"
              :rules="[(v) => !!v || 'Vui lòng chọn file']"
              required
              show-size
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
          <v-btn color="error" variant="flat" @click="confirmExecute"> Xác nhận </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import {
  getInternshipReports,
  getInternshipReportById,
  createInternshipReport,
  updateInternshipReport,
  uploadReportFile,
  deleteInternshipReport,
} from '@/services/evaluationService'
import { getInternshipProgress, getInternshipPeriods } from '@/services/registrationService'
import TeleportModal from '@/components/TeleportModal.vue'
import { viewEvaluationFile } from '@/services/fileService'

// Data
const reports = ref([])
const periods = ref([])
const availableProgress = ref([])
const loading = ref(false)
const loadingProgress = ref(false)
const showModal = ref(false)
const showUploadModal = ref(false)
const dialogView = ref(false)
const editedIndex = ref(-1)
const valid = ref(false)
const form = ref(null)
const reportFile = ref(null)
const uploadFile = ref(null)
const selectedItem = ref(null)
const selectedPeriod = ref(null)

// Confirm dialog
const confirmDialog = ref(false)
const confirmTitle = ref('')
const confirmMessage = ref('')

// Filters
const filters = reactive({
  id: '',
  studentCode: '',
  studentName: '',
  companyName: '',
  positionTitle: '',
  title: '',
  isExternal: null,
  submitted: null,
})

const submittedOptions = [
  { title: 'Tất cả', value: null },
  { title: 'Đã nộp', value: false },
  { title: 'Chưa nộp', value: true },
]

const externalOptions = [
  { title: 'Tất cả', value: null },
  { title: 'Liên kết', value: false },
  { title: 'Chưa liên kết', value: true },
]

const defaultItem = {
  id: null,
  progressId: null,
  title: '',
  content: '',
  filePath: '',
  submissionDate: null,
  isEditable: true,
  // Student info
  studentId: null,
  studentCode: '',
  studentName: '',
  studentEmail: '',
  studentPhone: '',
  // Progress info
  periodId: '',
  positionTitle: '',
  companyName: '',
  startDate: '',
  endDate: '',
  isExternal: null,
  createdAt: null,
  updatedAt: null,
}

const editedItem = reactive({ ...defaultItem })

const headers = [
  { title: 'ID', key: 'id', sortable: true },
  { title: 'MSSV', key: 'studentCode', sortable: true },
  { title: 'Họ tên SV', key: 'studentName', sortable: true },
  { title: 'Kỳ', key: 'periodId', sortable: true },
  { title: 'Loại', key: 'isExternal', sortable: true },
  { title: 'Công ty', key: 'companyName', sortable: true },
  { title: 'Vị trí', key: 'positionTitle', sortable: true },
  { title: 'Tiêu đề', key: 'title', sortable: true },
  { title: 'File', key: 'filePath', sortable: false },
  { title: 'Trạng thái', key: 'isEditable', sortable: true },
  { title: 'Ngày nộp', key: 'submissionDate', sortable: true },
  { title: 'Thao tác', key: 'actions', sortable: false },
]

const modalTitle = computed(() => {
  if (dialogView.value) return 'Chi tiết Báo cáo thực tập'
  return editedIndex.value === -1 ? 'Thêm Báo cáo mới' : 'Chỉnh sửa Báo cáo'
})

// Computed property để lọc dữ liệu
const filteredItems = computed(() => {
  return reports.value.filter((item) => {
    return Object.keys(filters).every((key) => {
      if (!filters[key] && filters[key] !== false && filters[key] !== 0) return true

      if (key === 'isExternal' || key === 'submitted') {
        if (filters[key] === null) return true
        if (key === 'submitted') {
          // submitted = true means "chưa nộp" (isEditable = true)
          // submitted = false means "đã nộp" (isEditable = false)
          return filters[key] === item.isEditable
        }
        return filters[key] === item[key]
      }

      const itemValue = String(item[key] || '').toLowerCase()
      const filterValue = String(filters[key]).toLowerCase()

      return itemValue.includes(filterValue)
    })
  })
})

// Format date
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN')
}

// View file
const viewFile = (filePath) => {
  if (filePath) {
    // Use evaluation service for report files
    const fullUrl = viewEvaluationFile(filePath)
    window.open(fullUrl, '_blank')
  }
}

// API functions
const fetchReports = async () => {
  loading.value = true
  try {
    const filterParams = {
      periodId: selectedPeriod.value,
      studentName: filters.studentName || null,
      companyName: filters.companyName || null,
      submitted: filters.submitted,
    }

    const response = await getInternshipReports(filterParams)
    reports.value = response.data || []
  } catch (error) {
    console.error('Lỗi khi lấy danh sách báo cáo thực tập:', error)
    reports.value = []
  } finally {
    loading.value = false
  }
}

const fetchPeriods = async () => {
  try {
    const response = await getInternshipPeriods()
    periods.value = response.data.map((period) => ({
      ...period,
      displayName: `${period.id} - ${period.description || ''}`,
    }))
  } catch (error) {
    console.error('Lỗi khi lấy danh sách kỳ thực tập:', error)
  }
}

const fetchAvailableProgress = async () => {
  loadingProgress.value = true
  try {
    const response = await getInternshipProgress()
    // Filter progress that don't have reports yet
    const existingProgressIds = reports.value.map((report) => report.progressId)

    availableProgress.value = response.data
      .filter((progress) => !existingProgressIds.includes(progress.id))
      .map((progress) => ({
        id: progress.id,
        displayName: `${progress.studentCode} - ${progress.studentName} (${progress.periodId})`,
      }))
  } catch (error) {
    console.error('Lỗi khi lấy danh sách tiến trình thực tập:', error)
  } finally {
    loadingProgress.value = false
  }
}

// Apply filters
const applyFilters = () => {
  fetchReports()
}

// Modal functions
const openAddModal = async () => {
  dialogView.value = false
  editedIndex.value = -1
  Object.assign(editedItem, defaultItem)
  reportFile.value = null
  await fetchAvailableProgress()
  showModal.value = true
}

const openViewModal = async (item) => {
  try {
    const response = await getInternshipReportById(item.id)
    Object.assign(editedItem, response.data)
    editedIndex.value = reports.value.indexOf(item)
    dialogView.value = true
    showModal.value = true
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết báo cáo:', error)
  }
}

const openEditModal = async (item) => {
  try {
    const response = await getInternshipReportById(item.id)
    Object.assign(editedItem, response.data)
    editedIndex.value = reports.value.indexOf(item)
    dialogView.value = false
    showModal.value = true
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết báo cáo:', error)
  }
}

const openUploadModal = (item) => {
  selectedItem.value = item
  uploadFile.value = null
  showUploadModal.value = true
}

const deleteReport = (item) => {
  selectedItem.value = item
  confirmTitle.value = 'Xác nhận xóa'
  confirmMessage.value = `Bạn có chắc chắn muốn xóa báo cáo thực tập của sinh viên ${item.studentName}?`
  confirmDialog.value = true
}

// Progress change handler
const onProgressChange = async (progressId) => {
  if (!progressId) return

  try {
    // Fetch progress details to populate student and internship info
    const progressResponse = await getInternshipProgress()
    const selectedProgress = progressResponse.data.find((p) => p.id === progressId)

    if (selectedProgress) {
      editedItem.studentId = selectedProgress.studentId
      editedItem.studentCode = selectedProgress.studentCode
      editedItem.studentName = selectedProgress.studentName
      editedItem.studentEmail = selectedProgress.studentEmail
      editedItem.periodId = selectedProgress.periodId
      editedItem.positionTitle = selectedProgress.positionTitle
      editedItem.companyName = selectedProgress.companyName
      editedItem.isExternal = selectedProgress.isExternal
    }
  } catch (error) {
    console.error('Lỗi khi lấy thông tin tiến trình:', error)
  }
}

// Action functions
const save = async () => {
  if (!form.value.validate()) return

  try {
    loading.value = true

    if (editedIndex.value === -1) {
      // Create new report
      const formData = new FormData()

      // Append report data as JSON blob
      const reportData = {
        progressId: editedItem.progressId,
        title: editedItem.title,
        content: editedItem.content,
      }
      formData.append('data', new Blob([JSON.stringify(reportData)], { type: 'application/json' }))

      // Append file if selected
      if (reportFile.value) {
        formData.append('file', reportFile.value)
      }

      await createInternshipReport(formData)
    } else {
      // Update existing report
      const updateData = {
        title: editedItem.title,
        content: editedItem.content,
      }

      await updateInternshipReport(editedItem.id, updateData)
    }

    showModal.value = false
    await fetchReports()
    Object.assign(editedItem, defaultItem)
    reportFile.value = null

    console.log('Lưu báo cáo thành công!')
  } catch (error) {
    console.error('Lỗi khi lưu báo cáo:', error)
    alert('Có lỗi xảy ra khi lưu báo cáo. Vui lòng thử lại!')
  } finally {
    loading.value = false
  }
}

const updateFile = async () => {
  if (!uploadFile.value) return

  loading.value = true
  try {
    await uploadReportFile(selectedItem.value.id, uploadFile.value)

    showUploadModal.value = false
    await fetchReports()
    uploadFile.value = null

    console.log('Cập nhật file thành công!')
  } catch (error) {
    console.error('Lỗi khi cập nhật file:', error)
    alert('Có lỗi xảy ra khi cập nhật file. Vui lòng thử lại!')
  } finally {
    loading.value = false
  }
}

const confirmExecute = async () => {
  confirmDialog.value = false
  loading.value = true

  try {
    await deleteInternshipReport(selectedItem.value.id)
    await fetchReports()
    console.log('Xóa báo cáo thành công!')
  } catch (error) {
    console.error('Lỗi khi xóa báo cáo:', error)
    alert('Có lỗi xảy ra khi xóa báo cáo. Vui lòng thử lại!')
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  fetchReports()
  fetchPeriods()
})
</script>

<style scoped>
.internship-report-management {
  padding: 20px;
}
.filter-input {
  margin: 0;
  min-width: 80px;
}
</style>
