<template>
  <div class="app-layout">
    <aside class="app-sidebar">
      <div class="logo">
        <router-link to="/">Task 🖤 Buddy</router-link>
      </div>
      
      <nav class="nav-menu">
        <router-link to="/dashboard" class="nav-item" exact-active-class="active">
          Dashboard
        </router-link>
        <div class="nav-item disabled">To Do</div>
        <div class="nav-item disabled">In Progress</div>
        <div class="nav-item disabled">Completed</div>
      </nav>
      
      <div class="account-section">
        <div class="section-title">ACCOUNT</div>
        <div class="user-info">
          <div class="avatar">{{ userInitial }}</div>
          <span class="username">{{ username }}</span>
          <router-link to="/profile" class="settings-icon" title="Profile Settings">⚙️</router-link>
        </div>
        <button class="logout-link" @click="logout">Log out</button>
      </div>
    </aside>
    
    <main class="app-content">
      <slot></slot>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = ref(JSON.parse(localStorage.getItem('user')))

const username = computed(() => user.value?.username || 'Guest')
const userInitial = computed(() => username.value.charAt(0).toUpperCase())

const logout = () => {
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--surface-color);
}

.app-sidebar {
  width: 250px;
  background-color: var(--bg-color);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.logo {
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 40px;
}

.logo a {
  text-decoration: none;
  color: var(--text-color);
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.nav-item {
  padding: 10px 15px;
  border-radius: 6px;
  text-decoration: none;
  color: var(--text-color);
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.nav-item:hover {
  background-color: var(--surface-color);
}

.nav-item.active {
  background-color: var(--surface-color);
  font-weight: 700;
}

.nav-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.account-section {
  border-top: 1px solid var(--border-color);
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.section-title {
  font-size: 12px;
  font-weight: bold;
  color: #888;
  letter-spacing: 1px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 32px;
  height: 32px;
  background-color: var(--text-color);
  color: var(--bg-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
}

.username {
  font-weight: 500;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.settings-icon {
  text-decoration: none;
  font-size: 18px;
  cursor: pointer;
}

.logout-link {
  background: none;
  border: none;
  color: var(--error-color);
  padding: 0;
  font-size: 14px;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  opacity: 0.8;
}

.logout-link:hover {
  background: none;
  opacity: 1;
  text-decoration: underline;
  transform: none;
}

.app-content {
  flex: 1;
  padding: 0;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color);
}
</style>
