<template>
  <div class="company-contact-management">
    <v-card>
      <v-card-title>
        Quản lý Liên hệ Công ty
        <v-spacer></v-spacer>
        <v-btn color="primary" class="ml-4" @click="openAddModal">
          Thêm Liên hệ
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

    <!-- Teleport Modal -->
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
              v-model="editedItem.position"
              label="Chức vụ"
              :readonly="dialogView"
              :rules="[v => !!v || 'Vui lòng nhập chức vụ']"
              required
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-select
              v-model="editedItem.companyId"
              :items="companies"
              item-title="name"
              item-value="id"
              label="Công ty"
              :readonly="dialogView"
              :rules="[v => !!v || 'Vui lòng chọn công ty']"
              required
            ></v-select>
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
          <v-col cols="12" sm="6" v-if="dialogView">
            <v-text-field
              v-model="editedItem.companyName"
              label="Tên công ty"
              readonly
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" v-if="dialogView">
            <v-text-field
              v-model="editedItem.companyShortName"
              label="Tên viết tắt công ty"
              readonly
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
import { ref, reactive, computed, onMounted } from 'vue'
import {
  getCompanyContacts,
  getCompanyContactById,
  createCompanyContact,
  updateCompanyContact
} from '@/services/userService'
import TeleportModal from '@/components/TeleportModal.vue'

const contacts = ref([])
const loading = ref(false)
const showModal = ref(false)
const dialogView = ref(false)
const editedIndex = ref(-1)
const valid = ref(false)
const form = ref(null)

// Companies list - Giả sử danh sách công ty đã được biết trước
// Trong thực tế bạn sẽ cần gọi API để lấy danh sách công ty
const companies = [
  { id: 1, name: 'FPT Software' },
  { id: 2, name: 'Viettel' },
  { id: 3, name: 'VNG' },
  { id: 4, name: 'CMC Corporation' }
]

// Filters
const filters = reactive({
  id: '',
  name: '',
  email: '',
  phone: '',
  companyName: '',
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
  companyId: null,
  position: '',
  password: '',
  isActive: true,
  companyName: '',
  companyShortName: ''
}

const editedItem = reactive({...defaultItem})

const headers = [
  { title: 'ID', key: 'id', sortable: true },
  { title: 'Họ tên', key: 'name', sortable: true },
  { title: 'Email', key: 'email', sortable: true },
  { title: 'Số điện thoại', key: 'phone', sortable: true },
  { title: 'Công ty', key: 'companyName', sortable: true },
  { title: 'Chức vụ', key: 'position', sortable: true },
  { title: 'Trạng thái', key: 'isActive', sortable: true },
  { title: 'Thao tác', key: 'actions', sortable: false }
]

const modalTitle = computed(() => {
  if (dialogView.value) return 'Chi tiết Liên hệ'
  return editedIndex.value === -1 ? 'Thêm Liên hệ mới' : 'Chỉnh sửa Liên hệ'
})

// Computed property để lọc dữ liệu
const filteredItems = computed(() => {
  return contacts.value.filter(contact => {
    // Kiểm tra tất cả các điều kiện lọc
    return Object.keys(filters).every(key => {
      // Nếu không có giá trị lọc cho trường này, trả về true
      if (!filters[key] && filters[key] !== false) return true

      // Trường hợp đặc biệt cho isActive vì là boolean
      if (key === 'isActive') {
        return filters[key] === null || contact[key] === filters[key]
      }

      // Chuyển cả hai giá trị sang chuỗi chữ thường để so sánh không phân biệt chữ hoa/thường
      const contactValue = String(contact[key] || '').toLowerCase()
      const filterValue = String(filters[key]).toLowerCase()

      // Kiểm tra nếu chuỗi contactValue có chứa chuỗi filterValue
      return contactValue.includes(filterValue)
    })
  })
})

const fetchContacts = async () => {
  loading.value = true
  try {
    const response = await getCompanyContacts()
    contacts.value = response.data
  } catch (error) {
    console.error('Lỗi khi lấy danh sách liên hệ:', error)
  } finally {
    loading.value = false
  }
}

const fetchContactDetail = async (id) => {
  loading.value = true
  try {
    const response = await getCompanyContactById({ id })
    // Copy the properties to editedItem
    Object.assign(editedItem, response.data)
  } catch (error) {
    console.error('Lỗi khi lấy thông tin chi tiết liên hệ:', error)
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
  editedIndex.value = contacts.value.indexOf(item)
  Object.assign(editedItem, item)
  dialogView.value = true
  showModal.value = true
}

const openEditModal = (item) => {
  editedIndex.value = contacts.value.indexOf(item)
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
      // Updating existing contact
      const response = await updateCompanyContact(editedItem)
      if (response.status === 200) {
        Object.assign(contacts.value[editedIndex.value], response.data)
      }
    } else {
      // Creating new contact
      const response = await createCompanyContact(editedItem)
      if (response.status === 200) {
        contacts.value.push(response.data)
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
  fetchContacts()
})
</script>

<style scoped>
.company-contact-management {
  padding: 20px;
}
.filter-input {
  margin: 0;
  min-width: 80px;
}
</style>
