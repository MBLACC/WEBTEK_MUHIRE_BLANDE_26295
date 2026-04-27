<template>
  <div class="profile-section">
    <div class="profile-header">
      <h3>Profile & Settings</h3>
      <p>Logged in as: <strong>{{ user?.username }}</strong></p>
    </div>
    <div class="settings-grid">
      <div class="setting-item">
        <label>Rename Username:</label>
        <div class="rename-form">
          <input type="text" v-model="newUsername" placeholder="New username" />
          <button class="btn" @click="renameUser">Rename</button>
        </div>
        <p class="error" v-if="errorMsg">{{ errorMsg }}</p>
      </div>

      <div class="setting-item flex-between">
        <label>Theme:</label>
        <button class="btn outline" @click="toggleTheme">{{ isDark ? 'Light Mode' : 'Dark Mode' }}</button>
      </div>

      <div class="setting-item flex-between">
        <label>Font Family:</label>
        <select v-model="selectedFont" @change="changeFont">
          <option value="Inter">Inter</option>
          <option value="Roboto">Roboto</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
        </select>
      </div>

      <div class="setting-item">
        <button class="btn delete-btn" @click="deleteAccount">Delete Account</button>
        <button class="btn outline logout-btn" @click="logout" style="margin-left: 10px;">Logout</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = ref(JSON.parse(localStorage.getItem('user')))
const newUsername = ref('')
const errorMsg = ref('')
const isDark = ref(localStorage.getItem('theme') === 'dark')
const selectedFont = ref(localStorage.getItem('font') || 'Inter')

const toggleTheme = () => {
  isDark.value = !isDark.value
  const theme = isDark.value ? 'dark' : 'light'
  localStorage.setItem('theme', theme)
  if (isDark.value) {
    document.documentElement.setAttribute('data-theme', 'dark')
  } else {
    document.documentElement.removeAttribute('data-theme')
  }
}

const changeFont = () => {
  localStorage.setItem('font', selectedFont.value)
  document.documentElement.style.setProperty('--font-family', `"${selectedFont.value}", sans-serif`)
}

const renameUser = async () => {
  if (newUsername.value.trim().length < 3) {
    errorMsg.value = "Username must be at least 3 characters"
    return
  }
  try {
    const res = await fetch(`http://localhost:8080/api/users/${user.value.id}/update-username`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: newUsername.value })
    })
    if (res.ok) {
      const updatedUser = await res.json()
      localStorage.setItem('user', JSON.stringify(updatedUser))
      user.value = updatedUser
      newUsername.value = ""
      errorMsg.value = ""
      alert('Username updated successfully!')
    } else {
      const data = await res.json()
      errorMsg.value = data.message
    }
  } catch (err) {
    errorMsg.value = "Network Error"
  }
}

const deleteAccount = async () => {
  if (!confirm("Are you sure you want to delete your account? This action is permanent.")) return;
  try {
    await fetch(`http://localhost:8080/api/users/${user.value.id}/delete`, { method: 'DELETE' })
    logout()
  } catch (err) {
    alert("Error deleting account")
  }
}

const logout = () => {
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<style scoped>
.profile-header {
  margin-bottom: 15px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 10px;
}
.settings-grid {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.setting-item {
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-color);
}
.setting-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
  padding-top: 10px;
}
.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.rename-form {
  display: flex;
  gap: 10px;
  margin-top: 5px;
}
.error {
  color: var(--error-color);
  font-size: 0.85em;
  margin-top: 5px;
}
.btn.outline {
  background-color: transparent;
  color: var(--text-color);
  border: 1px solid var(--text-color);
}
.delete-btn {
  background-color: var(--error-color);
  color: #fff;
}
.delete-btn:hover {
  background-color: #cc0000;
}
</style>
