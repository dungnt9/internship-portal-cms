<template>
  <div class="evaluation-criteria-management">
    <v-card>
      <v-card-title>
        Quản lý Tiêu chí Đánh giá
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="openAddModal">
          Thêm Tiêu chí mới
        </v-btn>
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
                v-if="column.key !== 'actions' && column.key !== 'createdAt' && column.key !== 'updatedAt'"
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

        <!-- Slot cho cột mô tả -->
        <template v-slot:item.description="{ item }">
          <div class="text-truncate" style="max-width: 300px;" :title="item.description">
            {{ item.description }}
          </div>
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
            color="blue"
            @click="openEditModal(item)"
          >
            mdi-pencil
          </v-icon>
          <v-icon
            size="small"
            color="error"
            @click="deleteCriteria(item)"
          >
            mdi-delete
          </v-icon>
        </template>
      </v-data-table>
    </v-card>

    <!-- Teleport Criteria Modal -->
    <TeleportModal
      v-model="showModal"
      :title="modalTitle"
      :view-only="dialogView"
      :save-disabled="!valid || loading"
      @save="save"
      max-width="600"
    >
      <v-form ref="form" v-model="valid">
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="editedItem.name"
                label="Tên tiêu chí"
                :readonly="dialogView"
                :rules="dialogView ? [] : [v => !!v || 'Vui lòng nhập tên tiêu chí', v => v.length <= 100 || 'Tên tiêu chí không được vượt quá 100 ký tự']"
                :required="!dialogView"
                counter="100"
                clearable
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="editedItem.description"
                label="Mô tả tiêu chí"
                :readonly="dialogView"
                rows="5"
                counter="500"
                :rules="dialogView ? [] : [v => !v || v.length <= 500 || 'Mô tả không được vượt quá 500 ký tự']"
                clearable
                hint="Mô tả chi tiết về tiêu chí đánh giá này"
              ></v-textarea>
            </v-col>

            <!-- View only fields -->
            <template v-if="dialogView">
              <v-col cols="12"><v-divider></v-divider></v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  :model-value="formatDate(editedItem.createdAt)"
                  label="Ngày tạo"
                  readonly
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  :model-value="formatDate(editedItem.updatedAt)"
                  label="Ngày cập nhật"
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
            color="error"
            variant="flat"
            @click="confirmExecute"
          >
            Xác nhận
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Error Dialog -->
    <v-dialog v-model="errorDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6 error--text">Lỗi</v-card-title>
        <v-card-text>{{ errorMessage }}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="errorDialog = false">Đóng</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import {
  getEvaluationCriteria,
  getEvaluationCriteriaById,
  createEvaluationCriteria,
  updateEvaluationCriteria,
  deleteEvaluationCriteria
} from '@/services/evaluationService'
import TeleportModal from '@/components/TeleportModal.vue'

const criteriaList = ref([])
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

// Error dialog
const errorDialog = ref(false)
const errorMessage = ref('')

// Filters
const filters = reactive({
  id: '',
  name: '',
  description: ''
})

const defaultItem = {
  id: null,
  name: '',
  description: '',
  createdAt: null,
  updatedAt: null
}

const editedItem = reactive({...defaultItem})

const headers = [
  { title: 'ID', key: 'id', sortable: true },
  { title: 'Tên tiêu chí', key: 'name', sortable: true },
  { title: 'Mô tả', key: 'description', sortable: false },
  { title: 'Ngày tạo', key: 'createdAt', sortable: true },
  { title: 'Ngày cập nhật', key: 'updatedAt', sortable: true },
  { title: 'Thao tác', key: 'actions', sortable: false }
]

const modalTitle = computed(() => {
  if (dialogView.value) return 'Chi tiết Tiêu chí đánh giá'
  return editedIndex.value === -1 ? 'Thêm Tiêu chí mới' : 'Chỉnh sửa Tiêu chí'
})

// Format date
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN')
}

// Computed property để lọc dữ liệu
const filteredItems = computed(() => {
  return criteriaList.value.filter(item => {
    return Object.keys(filters).every(key => {
      if (!filters[key]) return true

      const itemValue = String(item[key] || '').toLowerCase()
      const filterValue = String(filters[key]).toLowerCase()

      return itemValue.includes(filterValue)
    })
  })
})

const fetchCriteria = async () => {
  loading.value = true
  try {
    const response = await getEvaluationCriteria()
    criteriaList.value = response.data
  } catch (error) {
    console.error('Lỗi khi lấy danh sách tiêu chí đánh giá:', error)
    showError('Không thể tải danh sách tiêu chí đánh giá')
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

const openViewModal = async (item) => {
  try {
    const response = await getEvaluationCriteriaById(item.id)
    editedIndex.value = criteriaList.value.indexOf(item)
    Object.assign(editedItem, response.data)
    dialogView.value = true
    showModal.value = true
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết tiêu chí:', error)
    showError('Không thể tải chi tiết tiêu chí')
  }
}

const openEditModal = async (item) => {
  try {
    const response = await getEvaluationCriteriaById(item.id)
    editedIndex.value = criteriaList.value.indexOf(item)
    Object.assign(editedItem, response.data)
    dialogView.value = false
    showModal.value = true
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết tiêu chí:', error)
    showError('Không thể tải chi tiết tiêu chí')
  }
}

const deleteCriteria = (item) => {
  selectedItem.value = item
  confirmTitle.value = 'Xác nhận xóa'
  confirmMessage.value = `Bạn có chắc chắn muốn xóa tiêu chí "${item.name}"? Thao tác này không thể hoàn tác.`
  confirmDialog.value = true
}

const confirmExecute = async () => {
  confirmDialog.value = false
  loading.value = true

  try {
    await deleteEvaluationCriteria(selectedItem.value.id)
    await fetchCriteria()
    console.log('Xóa tiêu chí thành công!')
  } catch (error) {
    console.error('Lỗi khi xóa tiêu chí:', error)
    if (error.response?.status === 409) {
      showError('Không thể xóa tiêu chí này vì đang được sử dụng trong các đánh giá')
    } else {
      showError('Có lỗi xảy ra khi xóa tiêu chí')
    }
  } finally {
    loading.value = false
  }
}

const save = async () => {
  if (!form.value.validate()) return

  try {
    loading.value = true

    if (editedIndex.value === -1) {
      // Create new
      const data = {
        name: editedItem.name.trim(),
        description: editedItem.description ? editedItem.description.trim() : null
      }

      const response = await createEvaluationCriteria(data)
      if (response.status === 201) {
        await fetchCriteria()
        console.log('Tạo tiêu chí thành công!')
      }
    } else {
      // Update existing
      const data = {
        name: editedItem.name.trim(),
        description: editedItem.description ? editedItem.description.trim() : null
      }

      const response = await updateEvaluationCriteria(editedItem.id, data)
      if (response.status === 200) {
        await fetchCriteria()
        console.log('Cập nhật tiêu chí thành công!')
      }
    }

    showModal.value = false
  } catch (error) {
    console.error('Lỗi khi lưu dữ liệu:', error)
    if (error.response?.status === 400) {
      showError(error.response.data.message || 'Dữ liệu không hợp lệ')
    } else {
      showError('Có lỗi xảy ra khi lưu tiêu chí')
    }
  } finally {
    loading.value = false
  }
}

const showError = (message) => {
  errorMessage.value = message
  errorDialog.value = true
}

onMounted(() => {
  fetchCriteria()
})
</script>

<style scoped>
.evaluation-criteria-management {
  padding: 20px;
}
.filter-input {
  margin: 0;
  min-width: 80px;
}
.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
