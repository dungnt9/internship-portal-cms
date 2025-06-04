<template>
  <div class="internship-progress-management">
    <v-card>
      <v-card-title>
        Quản lý Tiến trình Thực tập
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
          @update:model-value="fetchProgress"
        ></v-select>
        <v-btn color="primary" class="ml-4" @click="openAddModal"> Thêm Tiến trình mới </v-btn>
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
                  column.key !== 'status' &&
                  column.key !== 'isExternal' &&
                  column.key !== 'teacherConfirmed'
                "
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
              <v-select
                v-if="column.key === 'isExternal'"
                v-model="filters[column.key]"
                :items="externalOptions"
                hide-details
                density="compact"
                variant="outlined"
                class="filter-input"
              ></v-select>
              <v-select
                v-if="column.key === 'teacherConfirmed'"
                v-model="filters[column.key]"
                :items="confirmedOptions"
                hide-details
                density="compact"
                variant="outlined"
                class="filter-input"
              ></v-select>
            </th>
          </tr>
        </template>

        <!-- Slot cho cột loại thực tập -->
        <template v-slot:item.isExternal="{ item }">
          <v-chip :color="item.isExternal ? 'orange' : 'blue'" text-color="white" size="small">
            {{ item.isExternal ? 'Ngoài trường' : 'Trong trường' }}
          </v-chip>
        </template>

        <!-- Slot cho cột công ty -->
        <template v-slot:item.companyName="{ item }">
          {{ item.isExternal ? item.companyName : item.internalCompanyName }}
        </template>

        <!-- Slot cho cột trạng thái -->
        <template v-slot:item.status="{ item }">
          <v-chip :color="getStatusColor(item.status)" text-color="white" size="small">
            {{ getStatusText(item.status) }}
          </v-chip>
        </template>

        <!-- Slot cho xác nhận giảng viên -->
        <template v-slot:item.teacherConfirmed="{ item }">
          <v-chip :color="item.teacherConfirmed ? 'green' : 'grey'" text-color="white" size="small">
            {{ item.teacherConfirmed ? 'Đã xác nhận' : 'Chưa xác nhận' }}
          </v-chip>
        </template>

        <!-- Slot cho cột thao tác -->
        <template v-slot:item.actions="{ item }">
          <v-icon size="small" class="mr-2" @click="openViewModal(item)"> mdi-eye </v-icon>
          <v-icon size="small" class="mr-2" color="blue" @click="openEditModal(item)">
            mdi-pencil
          </v-icon>
          <v-icon
            v-if="!item.teacherConfirmed"
            size="small"
            class="mr-2"
            color="green"
            @click="confirmProgress(item)"
          >
            mdi-check-circle
          </v-icon>
          <v-icon size="small" color="error" @click="deleteProgress(item)"> mdi-delete </v-icon>
        </template>
      </v-data-table>
    </v-card>

    <!-- Teleport Progress Modal -->
    <TeleportModal
      v-model="showModal"
      :title="modalTitle"
      :view-only="dialogView"
      :save-disabled="!valid || loading"
      @save="save"
      max-width="800"
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
                :rules="[(v) => !!v || 'Vui lòng chọn sinh viên']"
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
                :rules="[(v) => !!v || 'Vui lòng chọn kỳ thực tập']"
                required
                @update:model-value="onPeriodChange"
              ></v-select>
            </v-col>
            <v-col cols="12" sm="6">
              <v-select
                v-model="editedItem.teacherId"
                :items="teachers"
                :loading="loadingTeachers"
                item-title="displayName"
                item-value="id"
                label="Giảng viên hướng dẫn"
                :readonly="dialogView"
                :rules="[(v) => !!v || 'Vui lòng chọn giảng viên']"
                required
              ></v-select>
            </v-col>
            <v-col cols="12" sm="6">
              <v-switch
                v-model="editedItem.isExternal"
                label="Thực tập ngoài trường"
                :readonly="dialogView || editedIndex > -1"
                color="primary"
                @update:model-value="onExternalChange"
              ></v-switch>
            </v-col>

            <!-- Internal internship fields -->
            <template v-if="!editedItem.isExternal">
              <v-col cols="12" sm="6">
                <v-select
                  v-model="editedItem.selectedCompanyId"
                  :items="companies"
                  item-title="name"
                  item-value="id"
                  label="Công ty"
                  :readonly="dialogView || editedIndex > -1"
                  :rules="[(v) => !!v || 'Vui lòng chọn công ty']"
                  required
                  @update:model-value="onCompanyChange"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-autocomplete
                  v-model="editedItem.positionId"
                  :items="filteredPositions"
                  :loading="loadingPositions"
                  item-title="displayName"
                  item-value="id"
                  label="Vị trí thực tập"
                  :readonly="dialogView || editedIndex > -1"
                  :rules="[(v) => !!v || 'Vui lòng chọn vị trí thực tập']"
                  required
                  :disabled="!editedItem.selectedCompanyId || !editedItem.periodId"
                ></v-autocomplete>
              </v-col>
            </template>

            <!-- External internship fields -->
            <template v-if="editedItem.isExternal">
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.companyName"
                  label="Tên công ty"
                  :readonly="dialogView"
                  :rules="[(v) => !!v || 'Vui lòng nhập tên công ty']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.positionTitle"
                  label="Tên vị trí"
                  :readonly="dialogView"
                  :rules="[(v) => !!v || 'Vui lòng nhập tên vị trí']"
                  required
                ></v-text-field>
              </v-col>
            </template>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model="editedItem.startDate"
                label="Ngày bắt đầu"
                type="date"
                :readonly="dialogView"
                :rules="[(v) => !!v || 'Vui lòng chọn ngày bắt đầu']"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="editedItem.endDate"
                label="Ngày kết thúc"
                type="date"
                :readonly="dialogView"
                :rules="[(v) => !!v || 'Vui lòng chọn ngày kết thúc']"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-select
                v-model="editedItem.status"
                :items="statusItems"
                item-title="text"
                item-value="value"
                label="Trạng thái"
                :readonly="dialogView"
                :rules="[(v) => !!v || 'Vui lòng chọn trạng thái']"
                required
              ></v-select>
            </v-col>
            <v-col cols="12" sm="6" v-if="!dialogView">
              <v-switch
                v-model="editedItem.teacherConfirmed"
                label="Xác nhận của giảng viên"
                color="primary"
              ></v-switch>
            </v-col>

            <!-- Supervisor information -->
            <v-col cols="12"><v-divider></v-divider></v-col>
            <v-col cols="12"><h4>Thông tin người hướng dẫn</h4></v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="editedItem.supervisorName"
                label="Tên người hướng dẫn"
                :readonly="dialogView"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="editedItem.supervisorPosition"
                label="Chức vụ"
                :readonly="dialogView"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="editedItem.supervisorEmail"
                label="Email"
                :readonly="dialogView"
                type="email"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="editedItem.supervisorPhone"
                label="Số điện thoại"
                :readonly="dialogView"
              ></v-text-field>
            </v-col>

            <!-- View only fields -->
            <template v-if="dialogView">
              <v-col cols="12"><v-divider></v-divider></v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  :model-value="editedItem.teacherConfirmed ? 'Đã xác nhận' : 'Chưa xác nhận'"
                  label="Xác nhận giảng viên"
                  readonly
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" v-if="editedItem.teacherConfirmedAt">
                <v-text-field
                  :model-value="formatDate(editedItem.teacherConfirmedAt)"
                  label="Thời gian xác nhận"
                  readonly
                ></v-text-field>
              </v-col>
            </template>
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
            :color="confirmAction === 'confirm' ? 'green' : 'error'"
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
import { ref, reactive, computed, onMounted, watch } from 'vue'
import {
  getInternshipProgress,
  getInternshipProgressByPeriod,
  createInternshipProgress,
  updateInternshipProgress,
  deleteInternshipProgressById,
  getAdminInternshipPeriods,
  getInternshipPositions,
} from '@/services/registrationService'
import { getStudents, getTeachers, getAllCompanies } from '@/services/userService'
import TeleportModal from '@/components/TeleportModal.vue'

const progressList = ref([])
const students = ref([])
const teachers = ref([])
const periods = ref([])
const positions = ref([])
const companies = ref([])
const filteredPositions = ref([])
const externalInternships = ref([])
const loading = ref(false)
const loadingStudents = ref(false)
const loadingTeachers = ref(false)
const loadingPositions = ref(false)
const showModal = ref(false)
const dialogView = ref(false)
const editedIndex = ref(-1)
const valid = ref(false)
const form = ref(null)
const selectedItem = ref(null)
const selectedPeriod = ref(null)

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
  teacherName: '',
  companyName: '',
  positionTitle: '',
  status: null,
  isExternal: null,
  teacherConfirmed: null,
})

const statusOptions = [
  { title: 'Tất cả', value: null },
  { title: 'Đang tiến hành', value: 'IN_PROGRESS' },
  { title: 'Hoàn thành', value: 'COMPLETED' },
  { title: 'Đã hủy', value: 'CANCELLED' },
]

const externalOptions = [
  { title: 'Tất cả', value: null },
  { title: 'Trong trường', value: false },
  { title: 'Ngoài trường', value: true },
]

const confirmedOptions = [
  { title: 'Tất cả', value: null },
  { title: 'Đã xác nhận', value: true },
  { title: 'Chưa xác nhận', value: false },
]

const statusItems = [
  { text: 'Đang tiến hành', value: 'IN_PROGRESS' },
  { text: 'Hoàn thành', value: 'COMPLETED' },
  { text: 'Đã hủy', value: 'CANCELLED' },
]

const defaultItem = {
  id: null,
  studentId: null,
  positionId: null,
  selectedCompanyId: null, // For UI selection
  periodId: '',
  teacherId: null,
  startDate: '',
  endDate: '',
  isExternal: false,
  externalId: null,
  companyName: '',
  positionTitle: '',
  status: 'IN_PROGRESS',
  supervisorName: '',
  supervisorPosition: '',
  supervisorEmail: '',
  supervisorPhone: '',
  teacherConfirmed: false,
}

const editedItem = reactive({ ...defaultItem })

const headers = [
  { title: 'ID', key: 'id', sortable: true },
  { title: 'MSSV', key: 'studentCode', sortable: true },
  { title: 'Họ tên SV', key: 'studentName', sortable: true },
  { title: 'Email SV', key: 'studentEmail', sortable: true },
  { title: 'Kỳ', key: 'periodId', sortable: true },
  { title: 'Loại', key: 'isExternal', sortable: true },
  { title: 'GV hướng dẫn', key: 'teacherName', sortable: true },
  { title: 'Công ty', key: 'companyName', sortable: true },
  { title: 'Vị trí', key: 'positionTitle', sortable: true },
  { title: 'Trạng thái', key: 'status', sortable: true },
  { title: 'Xác nhận GV', key: 'teacherConfirmed', sortable: true },
  { title: 'Thao tác', key: 'actions', sortable: false },
]

const modalTitle = computed(() => {
  if (dialogView.value) return 'Chi tiết Tiến trình thực tập'
  return editedIndex.value === -1 ? 'Thêm Tiến trình mới' : 'Chỉnh sửa Tiến trình'
})

// Get status color
const getStatusColor = (status) => {
  const colors = {
    IN_PROGRESS: 'blue',
    COMPLETED: 'green',
    CANCELLED: 'red',
  }
  return colors[status] || 'grey'
}

// Get status text
const getStatusText = (status) => {
  const texts = {
    IN_PROGRESS: 'Đang tiến hành',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
  }
  return texts[status] || status
}

// Format date
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN')
}

// Computed property để lọc dữ liệu
const filteredItems = computed(() => {
  return progressList.value.filter((item) => {
    return Object.keys(filters).every((key) => {
      if (!filters[key] && filters[key] !== false && filters[key] !== 0) return true

      if (key === 'status' || key === 'isExternal' || key === 'teacherConfirmed') {
        return filters[key] === null || item[key] === filters[key]
      }

      const itemValue = String(item[key] || '').toLowerCase()
      const filterValue = String(filters[key]).toLowerCase()

      return itemValue.includes(filterValue)
    })
  })
})

const fetchProgress = async () => {
  loading.value = true
  try {
    let response
    if (selectedPeriod.value) {
      response = await getInternshipProgressByPeriod(selectedPeriod.value)
    } else {
      response = await getInternshipProgress()
    }
    progressList.value = response.data
  } catch (error) {
    console.error('Lỗi khi lấy danh sách tiến trình thực tập:', error)
  } finally {
    loading.value = false
  }
}

const fetchStudents = async () => {
  loadingStudents.value = true
  try {
    const response = await getStudents()
    students.value = response.data.map((student) => ({
      ...student,
      displayName: `${student.studentCode} - ${student.name}`,
    }))
  } catch (error) {
    console.error('Lỗi khi lấy danh sách sinh viên:', error)
  } finally {
    loadingStudents.value = false
  }
}

const fetchTeachers = async () => {
  loadingTeachers.value = true
  try {
    const response = await getTeachers()
    teachers.value = response.data.map((teacher) => ({
      ...teacher,
      displayName: `${teacher.name} - ${teacher.department || ''}`,
    }))
  } catch (error) {
    console.error('Lỗi khi lấy danh sách giảng viên:', error)
  } finally {
    loadingTeachers.value = false
  }
}

const fetchPeriods = async () => {
  try {
    const response = await getAdminInternshipPeriods()
    periods.value = response.data.map((period) => ({
      ...period,
      displayName: `${period.id} - ${period.description || ''}`,
    }))
  } catch (error) {
    console.error('Lỗi khi lấy danh sách kỳ thực tập:', error)
  }
}

const fetchPositions = async () => {
  loadingPositions.value = true
  try {
    const response = await getInternshipPositions()
    positions.value = response.data.map((position) => ({
      ...position,
      displayName: `${position.title} - ${position.companyName}`,
    }))
  } catch (error) {
    console.error('Lỗi khi lấy danh sách vị trí thực tập:', error)
  } finally {
    loadingPositions.value = false
  }
}

const fetchCompanies = async () => {
  try {
    const response = await getAllCompanies()
    companies.value = response.data || []
  } catch (error) {
    console.error('Lỗi khi lấy danh sách công ty:', error)
  }
}

// Remove fetchExternalInternships function since we don't need it

const onExternalChange = (value) => {
  if (value) {
    editedItem.positionId = null
    editedItem.selectedCompanyId = null
  } else {
    editedItem.companyName = ''
    editedItem.positionTitle = ''
    editedItem.externalId = null
  }
}

const onPeriodChange = (periodId) => {
  // Reset company and position when period changes
  editedItem.selectedCompanyId = null
  editedItem.positionId = null
  filteredPositions.value = []

  // Filter positions by period if needed
  if (periodId && !editedItem.isExternal) {
    updateFilteredPositions()
  }
}

const onCompanyChange = (companyId) => {
  // Reset position when company changes
  editedItem.positionId = null

  // Update filtered positions
  updateFilteredPositions()
}

const updateFilteredPositions = () => {
  if (!editedItem.selectedCompanyId || !editedItem.periodId) {
    filteredPositions.value = []
    return
  }

  // Filter positions by selected company and period
  filteredPositions.value = positions.value.filter((position) => {
    return (
      position.companyId === editedItem.selectedCompanyId &&
      position.periodId === editedItem.periodId
    )
  })
}

const openAddModal = () => {
  dialogView.value = false
  editedIndex.value = -1
  Object.assign(editedItem, defaultItem)
  showModal.value = true
}

const openViewModal = (item) => {
  editedIndex.value = progressList.value.indexOf(item)
  Object.assign(editedItem, item)

  // Set selectedCompanyId for internal internships
  if (!item.isExternal && item.positionId) {
    const position = positions.value.find((p) => p.id === item.positionId)
    if (position) {
      editedItem.selectedCompanyId = position.companyId
      updateFilteredPositions()
    }
  }

  dialogView.value = true
  showModal.value = true
}

const openEditModal = (item) => {
  editedIndex.value = progressList.value.indexOf(item)
  Object.assign(editedItem, item)

  // Set selectedCompanyId for internal internships
  if (!item.isExternal && item.positionId) {
    const position = positions.value.find((p) => p.id === item.positionId)
    if (position) {
      editedItem.selectedCompanyId = position.companyId
      updateFilteredPositions()
    }
  }

  dialogView.value = false
  showModal.value = true
}

const confirmProgress = (item) => {
  selectedItem.value = item
  confirmTitle.value = 'Xác nhận tiến trình'
  confirmMessage.value = `Bạn có chắc chắn muốn xác nhận tiến trình thực tập của sinh viên ${item.studentName}?`
  confirmAction.value = 'confirm'
  confirmDialog.value = true
}

const deleteProgress = (item) => {
  selectedItem.value = item
  confirmTitle.value = 'Xác nhận xóa'
  confirmMessage.value = `Bạn có chắc chắn muốn xóa tiến trình thực tập của sinh viên ${item.studentName}?`
  confirmAction.value = 'delete'
  confirmDialog.value = true
}

const confirmExecute = async () => {
  confirmDialog.value = false
  loading.value = true

  try {
    if (confirmAction.value === 'confirm') {
      await updateInternshipProgress(selectedItem.value.id, { teacherConfirmed: true })
    } else if (confirmAction.value === 'delete') {
      await deleteInternshipProgressById(selectedItem.value.id)
    }
    await fetchProgress()
  } catch (error) {
    console.error('Lỗi khi thực hiện thao tác:', error)
  } finally {
    loading.value = false
  }
}

const save = async () => {
  if (!form.value.validate()) return

  try {
    loading.value = true

    if (editedIndex.value === -1) {
      // Create new - send all fields
      const data = {
        studentId: editedItem.studentId,
        positionId: editedItem.isExternal ? null : editedItem.positionId,
        periodId: editedItem.periodId,
        teacherId: editedItem.teacherId,
        startDate: editedItem.startDate,
        endDate: editedItem.endDate,
        isExternal: editedItem.isExternal,
        externalId: null, // Remove externalId as it's not needed
        companyName: editedItem.isExternal ? editedItem.companyName : null,
        positionTitle: editedItem.isExternal ? editedItem.positionTitle : null,
        status: editedItem.status,
        supervisorName: editedItem.supervisorName,
        supervisorPosition: editedItem.supervisorPosition,
        supervisorEmail: editedItem.supervisorEmail,
        supervisorPhone: editedItem.supervisorPhone,
        teacherConfirmed: editedItem.teacherConfirmed,
      }

      const response = await createInternshipProgress(data)
      if (response.status === 201) {
        await fetchProgress()
      }
    } else {
      // Update existing - only send updatable fields
      const data = {
        teacherId: editedItem.teacherId,
        startDate: editedItem.startDate,
        endDate: editedItem.endDate,
        status: editedItem.status,
        supervisorName: editedItem.supervisorName,
        supervisorPosition: editedItem.supervisorPosition,
        supervisorEmail: editedItem.supervisorEmail,
        supervisorPhone: editedItem.supervisorPhone,
        teacherConfirmed: editedItem.teacherConfirmed,
      }

      // Only add external fields if this is an external internship
      if (editedItem.isExternal) {
        data.companyName = editedItem.companyName
        data.positionTitle = editedItem.positionTitle
      }

      const response = await updateInternshipProgress(editedItem.id, data)
      if (response.status === 200) {
        await fetchProgress()
      }
    }

    showModal.value = false
  } catch (error) {
    console.error('Lỗi khi lưu dữ liệu:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProgress()
  fetchStudents()
  fetchTeachers()
  fetchPeriods()
  fetchPositions()
  fetchCompanies()
  // Remove fetchExternalInternships() since we don't need it anymore
})
</script>

<style scoped>
.internship-progress-management {
  padding: 20px;
}
.filter-input {
  margin: 0;
  min-width: 80px;
}
</style>
