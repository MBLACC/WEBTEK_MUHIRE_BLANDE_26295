<script setup>
import { RouterLink } from 'vue-router'
import { Menu, ShoppingCart, User, LayoutDashboard, Home } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/useAuthStore'
import { useCartStore } from '@/stores/useCartStore'
import FontSizeToggle from '@/components/FontSizeToggle.vue'
import { ref } from 'vue'

const isMenuOpen = ref(false)
const authStore = useAuthStore()
const cartStore = useCartStore()

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}
</script>

<template>
  <header class="navbar">
    <div class="container navbar-inner">
      <div class="nav-brand">
        <RouterLink to="/" class="brand-link" aria-label="BatelCollection Home">
          <img src="@/assets/logo_image/LOGO.png" alt="Logo" class="brand-logo" />
          BatelCollection
        </RouterLink>
      </div>

      <nav class="nav-links desktop-only" aria-label="Main Navigation">
        <RouterLink to="/" aria-label="Home">
          <Home :size="20" aria-hidden="true" />
          <span>Home</span>
        </RouterLink>
        <RouterLink to="/shop">Shop</RouterLink>
        <RouterLink to="/cart" aria-label="View Cart" class="cart-link">
          <ShoppingCart :size="20" aria-hidden="true" />
          <span v-if="cartStore.totalItems > 0" class="cart-badge">{{ cartStore.totalItems }}</span>
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
        <FontSizeToggle />
      </nav>

      <button class="mobile-menu-btn" @click="toggleMenu" :aria-expanded="isMenuOpen" aria-controls="mobile-nav">
        <Menu :size="24" aria-hidden="true" />
        <span class="sr-only">Toggle Menu</span>
      </button>
    </div>

    <!-- Mobile Nav -->
    <nav v-show="isMenuOpen" id="mobile-nav" class="mobile-nav" aria-label="Mobile Navigation">
      <RouterLink to="/" @click="isMenuOpen = false">Home</RouterLink>
      <RouterLink to="/shop" @click="isMenuOpen = false">Shop</RouterLink>
      <RouterLink to="/cart" @click="isMenuOpen = false" class="cart-link mobile-cart-link">
        Cart
        <span v-if="cartStore.totalItems > 0" class="cart-badge">{{ cartStore.totalItems }}</span>
      </RouterLink>
      <RouterLink v-if="authStore.user?.isAdmin" to="/admin" @click="isMenuOpen = false">Admin Dashboard</RouterLink>
      <RouterLink to="/account" @click="isMenuOpen = false">Account</RouterLink>
      <div class="mobile-font-control">
         <span style="font-weight: 600; color: var(--color-text);">Text Size</span>
         <FontSizeToggle />
      </div>
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.brand-logo {
  height: 32px;
  width: auto;
  object-fit: contain;
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

.mobile-font-control {
  padding: 0.75rem 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
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


.cart-link {
  position: relative;
}

.cart-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: var(--color-error);
  color: white;
  font-size: 0.7rem;
  font-weight: bold;
  height: 18px;
  min-width: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  padding: 0 4px;
}

.mobile-cart-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mobile-cart-link .cart-badge {
  position: static;
  margin-left: 0.5rem;
}
</style>
