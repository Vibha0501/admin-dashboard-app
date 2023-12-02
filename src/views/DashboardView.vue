<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="search">
          <input
            type="text"
            placeholder="Search"
            v-model="searchQuery"
            class="form-control"
            @keyup.enter="search()"
          />
          <button @click="search()" class="btn btn-primary m-2 search-icon">
            <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
          </button>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-md-12">
        <table class="table table-bordered text-center">
          <thead>
            <tr>
              <th>
                <input type="checkbox" @change="selectAllRows" v-model="selectAll" />
              </th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in paginatedUsers" :key="user.id">
              <td :style="{ backgroundColor: getRowColor(user.id) }">
                <input
                  type="checkbox"
                  :checked="isSelected(user.id)"
                  @change="toggleSelection(user.id)"
                />
              </td>
              <td :style="{ backgroundColor: getRowColor(user.id) }">
                <template v-if="selectedUser && selectedUser.id === user.id">
                  <input v-model="selectedUser.name" class="form-control" />
                </template>
                <template v-else>
                  {{ user.name }}
                </template>
              </td>
              <td :style="{ backgroundColor: getRowColor(user.id) }">
                <template v-if="selectedUser && selectedUser.id === user.id">
                  <input v-model="selectedUser.email" class="form-control" />
                </template>
                <template v-else>
                  {{ user.email }}
                </template>
              </td>
              <td :style="{ backgroundColor: getRowColor(user.id) }">
                <template v-if="selectedUser && selectedUser.id === user.id">
                  <select v-model="selectedUser.role" class="form-control">
                    <option v-for="role in roles" :key="role" :value="role">{{ role }}</option>
                  </select>
                </template>
                <template v-else>
                  {{ user.role }}
                </template>
              </td>

              <td :style="{ backgroundColor: getRowColor(user.id) }">
                <button
                  v-if="selectedUser && selectedUser.id === user.id"
                  @click="saveUserChanges(selectedUser)"
                  class="btn btn-success btn-sm"
                >
                  <font-awesome-icon :icon="['far', 'floppy-disk']" />
                </button>
                <button v-else @click="editUser(user)" class="btn btn-info btn-sm mx-2">
                  <font-awesome-icon :icon="['far', 'pen-to-square']" />
                </button>
                <button @click="deleteUser(user)" class="btn btn-danger btn-sm mx-2">
                  <font-awesome-icon :icon="['fas', 'trash']" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div>
          <button @click="deleteSelected()" class="btn btn-danger btn-sm justify-content-start">
            Delete Selected <font-awesome-icon :icon="['fas', 'trash']" />
          </button>
          <ul class="pagination justify-content-end">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link first-page" @click="goToPage(1)">First</button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link previous-page" @click="previousPage()">&laquo;</button>
            </li>
            <li
              class="page-item"
              v-for="page in maxPage"
              :key="page"
              :class="{ active: currentPage === page }"
            >
              <button class="page-link" @click="goToPage(page)">{{ page }}</button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === maxPage }">
              <button class="page-link next-page" @click="nextPage()">&raquo;</button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === maxPage }">
              <button class="page-link last-page" @click="goToPage(maxPage)">Last</button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      users: [],
      filteredUsers: [],
      paginatedUsers: [],
      roles: ['admin', 'member'],
      currentPage: 1,
      maxPage: 1,
      searchQuery: '',
      selectAll: false,
      selectedRows: [],
      selectedUser: null
    }
  },

  mounted() {
    this.fetchUsers()
  },

  methods: {
    fetchUsers() {
      axios
        .get('https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json')
        .then((response) => {
          this.users = response.data
          this.filterUsers()
        })
    },

    filterUsers() {
      const filteredUsers = this.users.filter((user) => {
        return (
          user.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          user.role.toLowerCase().includes(this.searchQuery.toLowerCase())
        )
      })

      this.filteredUsers = filteredUsers
      this.calculateMaxPage()
      this.paginateUsers()
    },
    editUser(user) {
      this.selectedUser = { ...user } // Assign the selected user for editing
    },

    saveUserChanges(updatedUser) {
      // Logic to handle saving the changes made to the user
      console.log('Saving changes for user:', updatedUser)
      // Find the index of the selected user in the filteredUsers array
      const index = this.filteredUsers.findIndex((user) => user.id === updatedUser.id)
      if (index !== -1) {
        this.filteredUsers[index] = { ...updatedUser }
        console.log('Filtered Users after update:', this.filteredUsers)
      }
      this.selectedUser = null
      this.paginateUsers()
    },
    calculateMaxPage() {
      const pageSize = 10
      const totalRecords = this.filteredUsers.length
      this.maxPage = Math.ceil(totalRecords / pageSize)
    },

    paginateUsers() {
      const pageSize = 10
      const startIndex = (this.currentPage - 1) * pageSize
      const endIndex = startIndex + pageSize
      this.paginatedUsers = this.filteredUsers.slice(startIndex, endIndex)
    },

    previousPage() {
      if (this.currentPage > 1) {
        this.currentPage--
        this.paginateUsers()
      }
    },

    nextPage() {
      if (this.currentPage < this.maxPage) {
        this.currentPage++
        this.paginateUsers()
      }
    },

    goToPage(page) {
      this.currentPage = page
      this.paginateUsers()
    },

    search() {
      this.currentPage = 1
      this.filterUsers()
    },
    toggleSelection(userId) {
      if (this.isSelected(userId)) {
        this.selectedRows = this.selectedRows.filter((id) => id !== userId)
      } else {
        this.selectedRows.push(userId)
      }
    },
    isSelected(userId) {
      return this.selectedRows.includes(userId)
    },
    getRowColor(userId) {
      return this.isSelected(userId) ? '#f2f2f2' : 'transparent'
    },
    selectAllRows() {
      if (this.selectAll) {
        this.selectedRows = this.paginatedUsers.map((user) => user.id)
      } else {
        this.selectedRows = []
      }
    },
    deleteUser(user) {
      // Logic to handle deleting the user
      const userId = user.id
      this.users = this.users.filter((u) => u.id !== userId)
      this.filteredUsers = this.filteredUsers.filter((u) => u.id !== userId)
      this.calculateMaxPage() // Recalculate max pages after deletion
      this.paginateUsers() // Update paginated data after deletion
      console.log('Deleting user:', user)
    },
    deleteSelected() {
      this.users = this.users.filter((user) => !this.selectedRows.includes(user.id))
      this.filteredUsers = this.filteredUsers.filter((user) => !this.selectedRows.includes(user.id))

      this.selectedRows = []
      this.calculateMaxPage()
      this.paginateUsers()
    }
  }
}
</script>

<style scoped>
.page-item {
  display: inline-block;
  margin-right: 5px;
}
.page-link {
  border: 1px solid #ccc;
  padding: 5px 10px;
  cursor: pointer;
}
.disabled {
  pointer-events: none;
  opacity: 0.6;
}
.container {
  margin-top: 30px;
}
.selected-row {
  background-color: #f2f2f2;
}
.search {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.table {
  border: 1px solid #ccc;
}

.pagination {
  text-align: center;
  margin-top: 20px;
}
</style>
