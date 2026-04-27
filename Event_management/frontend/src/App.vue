<template>
  <div id="app">
    <nav>
      <div class="container flex-between">
        <div class="logo">
          <h1 style="font-size: 1.2rem; font-weight: 900; letter-spacing: 0.2em; text-transform: uppercase;">Event MANAGEMENT</h1>
        </div>
        <div class="nav-links">
          <router-link to="/student">Student</router-link>
          <router-link to="/admin">Admin</router-link>
        </div>
      </div>
    </nav>
    <main class="container">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <footer style="margin-top: auto; padding: 4rem 0; border-top: 1px solid #eee; text-align: center; font-size: 0.8rem; color: #999;">
      &copy; 2026 EVENT MANAGEMENT SYSTEM.
    </footer>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
