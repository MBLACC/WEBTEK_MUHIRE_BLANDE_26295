<script setup>
import { RouterLink } from 'vue-router'
import { Menu, ShoppingCart, User, LayoutDashboard } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/useAuthStore'
import { ref, onMounted } from 'vue'

const isMenuOpen = ref(false)
const authStore = useAuthStore()

const fontSizeClass = ref('normal-font')

const toggleFontSize = () => {
  fontSizeClass.value = fontSizeClass.value === 'normal-font' ? 'large-font' : 'normal-font'
  document.documentElement.className = fontSizeClass.value
  localStorage.setItem('preferred-font', fontSizeClass.value)
}

onMounted(() => {
  const saved = localStorage.getItem('preferred-font')
  if (saved) {
    fontSizeClass.value = saved
    document.documentElement.className = saved
  }
})

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}
</script>

<template>
  <header class="navbar">
    <div class="container navbar-inner">
      <div class="nav-brand">
        <RouterLink to="/" class="brand-link" aria-label="BatelCollection Home">
          BatelCollection
        </RouterLink>
      </div>

      <nav class="nav-links desktop-only" aria-label="Main Navigation">
        <button @click="toggleFontSize" class="font-toggle-btn" aria-label="Toggle Font Size">
          Aa
          <span class="sr-only">Toggle font size</span>
        </button>
        <RouterLink to="/shop">Shop</RouterLink>
        <RouterLink to="/cart" aria-label="View Cart">
          <ShoppingCart :size="20" aria-hidden="true" />
          <span class="sr-only">Cart</span>
        </RouterLink>
        <RouterLink v-if="authStore.user?.isAdmin" to="/admin" aria-label="Admin Dashboard">
          <LayoutDashboard :size="20" aria-hidden="true" />
          <span class="sr-only">Admin Dashboard</span>
        </RouterLink>
        <RouterLink to="/account" aria-label="My Account">
          <User :size="20" aria-hidden="true" />
          <span class="sr-only">Account</span>
        </RouterLink>
      </nav>

      <button class="mobile-menu-btn" @click="toggleMenu" :aria-expanded="isMenuOpen" aria-controls="mobile-nav">
        <Menu :size="24" aria-hidden="true" />
        <span class="sr-only">Toggle Menu</span>
      </button>
    </div>

    <!-- Mobile Nav -->
    <nav v-show="isMenuOpen" id="mobile-nav" class="mobile-nav" aria-label="Mobile Navigation">
      <button @click="toggleFontSize" class="mobile-font-toggle">Toggle Font Size (Aa)</button>
      <RouterLink to="/shop" @click="isMenuOpen = false">Shop</RouterLink>
      <RouterLink to="/cart" @click="isMenuOpen = false">Cart</RouterLink>
      <RouterLink v-if="authStore.user?.isAdmin" to="/admin" @click="isMenuOpen = false">Admin Dashboard</RouterLink>
      <RouterLink to="/account" @click="isMenuOpen = false">Account</RouterLink>
    </nav>
  </header>
</template>

<style scoped>
.navbar {
  background-color: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 4rem;
}

.brand-link {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.nav-links a {
  font-weight: 600;
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-links a:hover,
.nav-links a:focus,
.nav-links a.router-link-active {
  color: var(--color-primary);
}

.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  color: var(--color-text);
  padding: 0.5rem;
}

.mobile-nav {
  display: none;
  flex-direction: column;
  padding: 1rem;
  background-color: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
}

.mobile-nav a {
  padding: 0.75rem 0;
  font-weight: 600;
  color: var(--color-text);
  border-bottom: 1px solid var(--color-border);
}

.mobile-nav a:last-child {
  border-bottom: none;
}

@media (max-width: 768px) {
  .desktop-only {
    display: none;
  }
  .mobile-menu-btn {
    display: block;
  }
  .mobile-nav {
    display: flex;
  }
}

.font-toggle-btn {
  background: none;
  border: 1px solid var(--color-border);
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1.1rem;
  color: var(--color-text);
  margin-right: 0.5rem;
}

.font-toggle-btn:hover {
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.mobile-font-toggle {
  background: none;
  border: none;
  text-align: left;
  padding: 0.75rem 0;
  font-weight: 600;
  color: var(--color-text);
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
}
</style>
