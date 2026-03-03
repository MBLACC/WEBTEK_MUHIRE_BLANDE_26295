<script setup>
import { RouterView } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import FooterBar from '@/components/FooterBar.vue'
</script>

<template>
  <div class="app-wrapper">
    <NavBar />
    <main id="main-content" tabindex="-1">
      <RouterView />
    </main>
    <FooterBar />
  </div>
</template>

<style scoped>
.app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  flex: 1;
}

/* For accessibility skip link */
#main-content:focus {
  outline: none;
}
</style>

<style>
html.large-font {
  font-size: 110%; /* Makes all rem-based units 10% larger */
}
html.normal-font {
  font-size: 100%;
}
</style>
