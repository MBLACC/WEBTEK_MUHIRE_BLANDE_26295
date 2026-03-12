<template>
  <div class="auth-page container section-spacing">
    <div class="auth-box">
      <h1 class="page-title">Forgot Password</h1>
      
      <div v-if="!submitted">
         <form @submit.prevent="submitted = true">
           <AccessibleInput id="email" label="Email Address" type="email" required />
           <AccessibleButton type="submit" label="Send Code" class="full-width" />
         </form>
      </div>
      <div v-else>
         <form @submit.prevent="router.push('/login')">
           <AccessibleInput id="code" label="6-digit Code" required />
           <AccessibleInput id="newpass" label="New Password" type="password" required />
           <AccessibleButton type="submit" label="Reset Password" class="full-width" />
         </form>
      </div>
      
      <div class="auth-links">
        <RouterLink to="/login">Back to Login</RouterLink>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import AccessibleInput from '@/components/AccessibleInput.vue'
import AccessibleButton from '@/components/AccessibleButton.vue'
const router = useRouter()
const submitted = ref(false)
</script>
<style scoped>
.auth-page { display: flex; justify-content: center; align-items: center; min-height: 50vh; }
.auth-box { width: 100%; max-width: 400px; padding: 2rem; border-radius: 8px; border: 1px solid var(--color-border); background:white; }
.page-title { text-align: center; margin-bottom: 0.5rem; }
.full-width { width: 100%; margin-top: 1rem; }
.auth-links { display: flex; justify-content: center; margin-top: 1.5rem; }
</style>
