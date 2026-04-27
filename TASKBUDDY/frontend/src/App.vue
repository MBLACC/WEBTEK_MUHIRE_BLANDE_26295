<template>
  <div id="app-wrapper">
    <header class="app-header" v-if="showHeader">
      <div class="logo">
        <router-link to="/">TaskBuddy</router-link>
      </div>
    </header>
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const showHeader = computed(() => !['/dashboard', '/profile'].includes(route.path))

onMounted(() => {
  const theme = localStorage.getItem('theme') || 'light';
  const font = localStorage.getItem('font') || 'Inter';
  
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
  document.documentElement.style.setProperty('--font-family', `"${font}", sans-serif`);
});
</script>

<style scoped>
.app-header {
  padding: 20px;
  background-color: var(--surface-color);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: center;
}

.logo a {
  font-size: 24px;
  font-weight: bold;
  text-decoration: none;
  color: var(--text-color);
  letter-spacing: 1px;
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
