<template>
  <div class="company-management">
    <v-card>
      <v-card-title>
        Quản lý Công ty
        <v-spacer></v-spacer>
        <v-btn color="primary" class="ml-4" @click="openAddModal"> Thêm Công ty </v-btn>
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
                v-if="
                  column.key !== 'actions' &&
                  column.key !== 'isVerified' &&
                  column.key !== 'isForeignCompany' &&
                  column.key !== 'isLinked'
                "
                v-model="filters[column.key]"
                hide-details
                density="compact"
                variant="outlined"
                class="filter-input"
                placeholder="Lọc..."
              ></v-text-field>
              <v-select
                v-if="
                  column.key === 'isVerified' ||
                  column.key === 'isForeignCompany' ||
                  column.key === 'isLinked'
                "
                v-model="filters[column.key]"
                :items="booleanOptions"
                hide-details
                density="compact"
                variant="outlined"
                class="filter-input"
              ></v-select>
            </th>
          </tr>
        </template>

        <!-- Slot cho cột trạng thái xác thực -->
        <template v-slot:item.isVerified="{ item }">
          <v-chip :color="item.isVerified ? 'green' : 'amber'" text-color="white">
            {{ item.isVerified ? 'Đã xác thực' : 'Chưa xác thực' }}
          </v-chip>
        </template>

        <!-- Slot cho cột công ty nước ngoài -->
        <template v-slot:item.isForeignCompany="{ item }">
          <v-chip :color="item.isForeignCompany ? 'blue' : 'grey'" text-color="white">
            {{ item.isForeignCompany ? 'Công ty nước ngoài' : 'Công ty trong nước' }}
          </v-chip>
        </template>

        <!-- Slot cho cột đã liên kết -->
        <template v-slot:item.isLinked="{ item }">
          <v-chip :color="item.isLinked ? 'indigo' : 'grey'" text-color="white">
            {{ item.isLinked ? 'Đã liên kết' : 'Chưa liên kết' }}
          </v-chip>
        </template>

        <!-- Slot cho cột số vốn -->
        <template v-slot:item.capital="{ item }">
          {{ formatCurrency(item.capital) }}
        </template>

        <!-- Slot cho cột thao tác -->
        <template v-slot:item.actions="{ item }">
          <v-icon size="small" class="mr-2" @click="openViewModal(item)"> mdi-eye </v-icon>
          <v-icon size="small" class="mr-2" @click="openEditModal(item)"> mdi-pencil </v-icon>
        </template>
      </v-data-table>
    </v-card>

    <!-- Teleport Company Modal -->
    <TeleportModal
      v-model="showModal"
      :title="modalTitle"
      :view-only="dialogView"
      :save-disabled="!isChanged"
      @save="save"
    >
      <v-form ref="form" v-model="valid">
        <v-container>
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="editedItem.name"
                label="Tên công ty"
                :readonly="dialogView"
                :rules="[(v) => !!v || 'Vui lòng nhập tên công ty']"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="editedItem.shortName"
                label="Tên viết tắt"
                :readonly="dialogView"
                :rules="[(v) => !!v || 'Vui lòng nhập tên viết tắt']"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="editedItem.taxCode"
                label="Mã số thuế"
                :readonly="dialogView"
                :rules="[(v) => !!v || 'Vui lòng nhập mã số thuế']"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="editedItem.website"
                label="Website"
                :readonly="dialogView"
                :rules="[
                  (v) => !!v || 'Vui lòng nhập website',
                  (v) =>
                    /^(http(s)?:\/\/)?(www\.)?[a-zA-Z0-9]+([\-\.]{1}[a-zA-Z0-9]+)*\.[a-zA-Z]{2,5}(:[0-9]{1,5})?(\/.*)?$/.test(
                      v,
                    ) || 'Website không hợp lệ',
                ]"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="editedItem.businessType"
                label="Loại hình kinh doanh"
                :readonly="dialogView"
                :rules="[(v) => !!v || 'Vui lòng nhập loại hình kinh doanh']"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="editedItem.foundingYear"
                label="Năm thành lập"
                type="number"
                :readonly="dialogView"
                :rules="[
                  (v) => !!v || 'Vui lòng nhập năm thành lập',
                  (v) =>
                    (v > 1900 && v <= new Date().getFullYear()) || 'Năm thành lập không hợp lệ',
                ]"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="editedItem.employeeCount"
                label="Số lượng nhân viên"
                type="number"
                :readonly="dialogView"
                :rules="[(v) => v >= 0 || 'Số lượng nhân viên không hợp lệ']"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="editedItem.capital"
                label="Vốn (VNĐ)"
                type="number"
                :readonly="dialogView"
                :rules="[(v) => v >= 0 || 'Vốn không hợp lệ']"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="editedItem.address"
                label="Địa chỉ"
                :readonly="dialogView"
                :rules="[(v) => !!v || 'Vui lòng nhập địa chỉ']"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="editedItem.description"
                label="Mô tả"
                :readonly="dialogView"
                rows="3"
                auto-grow
              ></v-textarea>
            </v-col>
            <v-col cols="12" sm="4">
              <v-switch
                v-model="editedItem.isForeignCompany"
                label="Công ty nước ngoài"
                :readonly="dialogView"
                color="blue"
              ></v-switch>
            </v-col>
            <v-col cols="12" sm="4">
              <v-switch
                v-model="editedItem.isVerified"
                label="Trạng thái xác thực"
                :readonly="dialogView"
                color="green"
              ></v-switch>
            </v-col>
            <v-col cols="12" sm="4">
              <v-switch
                v-model="editedItem.isLinked"
                label="Đã liên kết"
                :readonly="dialogView"
                color="indigo"
              ></v-switch>
            </v-col>
          </v-row>
        </v-container>
      </v-form>
    </TeleportModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { getCompanies, getCompanyById, createCompany, updateCompany } from '@/services/userService'
import TeleportModal from '@/components/TeleportModal.vue'

const companies = ref([])
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
  shortName: '',
  taxCode: '',
  businessType: '',
  website: '',
  address: '',
  foundingYear: '',
  employeeCount: '',
  capital: '',
  isVerified: null,
  isForeignCompany: null,
  isLinked: null,
})

const booleanOptions = [
  { title: 'Tất cả', value: null },
  { title: 'Có', value: true },
  { title: 'Không', value: false },
]

const defaultItem = {
  id: null,
  name: '',
  shortName: '',
  isForeignCompany: false,
  taxCode: '',
  website: '',
  address: '',
  businessType: '',
  description: '',
  foundingYear: new Date().getFullYear(),
  employeeCount: 0,
  capital: 0,
  logoPath: null,
  isVerified: false,
  verificationDate: null,
  isLinked: false,
}

const editedItem = reactive({ ...defaultItem })

const headers = [
  { title: 'ID', key: 'id', sortable: true },
  { title: 'Tên công ty', key: 'name', sortable: true },
  { title: 'Tên viết tắt', key: 'shortName', sortable: true },
  { title: 'Mã số thuế', key: 'taxCode', sortable: true },
  { title: 'Loại hình KD', key: 'businessType', sortable: true },
  { title: 'Năm thành lập', key: 'foundingYear', sortable: true },
  { title: 'Số nhân viên', key: 'employeeCount', sortable: true },
  { title: 'Vốn', key: 'capital', sortable: true },
  { title: 'Công ty nước ngoài', key: 'isForeignCompany', sortable: true },
  { title: 'Trạng thái xác thực', key: 'isVerified', sortable: true },
  { title: 'Đã liên kết', key: 'isLinked', sortable: true },
  { title: 'Thao tác', key: 'actions', sortable: false },
]

const originalItem = ref({ ...defaultItem })

const isChanged = computed(() => {
  // So sánh từng trường, chỉ cần 1 trường khác là true
  return Object.keys(defaultItem).some((key) => editedItem[key] !== originalItem.value[key])
})

const modalTitle = computed(() => {
  if (dialogView.value) return 'Chi tiết Công ty'
  return editedIndex.value === -1 ? 'Thêm Công ty mới' : 'Chỉnh sửa Công ty'
})

// Format số tiền
const formatCurrency = (value) => {
  if (!value) return '0 VND'
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

// Computed property để lọc dữ liệu
const filteredItems = computed(() => {
  return companies.value.filter((company) => {
    // Kiểm tra tất cả các điều kiện lọc
    return Object.keys(filters).every((key) => {
      // Nếu không có giá trị lọc cho trường này, trả về true
      if (!filters[key] && filters[key] !== false) return true

      // Trường hợp đặc biệt cho các trường boolean
      if (key === 'isVerified' || key === 'isForeignCompany' || key === 'isLinked') {
        return filters[key] === null || company[key] === filters[key]
      }

      // Chuyển cả hai giá trị sang chuỗi chữ thường để so sánh không phân biệt chữ hoa/thường
      const companyValue = String(company[key] || '').toLowerCase()
      const filterValue = String(filters[key]).toLowerCase()

      // Kiểm tra nếu chuỗi companyValue có chứa chuỗi filterValue
      return companyValue.includes(filterValue)
    })
  })
})

const fetchCompanies = async () => {
  loading.value = true
  try {
    const response = await getCompanies()
    companies.value = response.data
  } catch (error) {
    console.error('Lỗi khi lấy danh sách công ty:', error)
  } finally {
    loading.value = false
  }
}

const fetchCompanyDetail = async (id) => {
  loading.value = true
  try {
    const response = await getCompanyById({ id })
    // Copy the properties to editedItem
    Object.assign(editedItem, response.data)
  } catch (error) {
    console.error('Lỗi khi lấy thông tin chi tiết công ty:', error)
  } finally {
    loading.value = false
  }
}

const openAddModal = () => {
  dialogView.value = false
  editedIndex.value = -1
  Object.assign(editedItem, defaultItem)
  originalItem.value = { ...defaultItem }
  showModal.value = true
}

const openViewModal = (item) => {
  editedIndex.value = companies.value.indexOf(item)
  Object.assign(editedItem, item)
  originalItem.value = { ...item }
  dialogView.value = true
  showModal.value = true
}

const openEditModal = (item) => {
  editedIndex.value = companies.value.indexOf(item)
  Object.assign(editedItem, item)
  originalItem.value = { ...item }
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
      // Updating existing company
      const response = await updateCompany(editedItem)
      if (response.status === 200) {
        Object.assign(companies.value[editedIndex.value], response.data)
      }
    } else {
      // Creating new company
      const response = await createCompany(editedItem)
      if (response.status === 200) {
        companies.value.push(response.data)
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
    if (key === 'isVerified' || key === 'isForeignCompany' || key === 'isLinked') {
      filters[key] = null
    } else {
      filters[key] = ''
    }
  }
}

onMounted(() => {
  fetchCompanies()
})
</script>

<style scoped>
.company-management {
  padding: 20px;
}
.filter-input {
  margin: 0;
  min-width: 80px;
}
</style>
