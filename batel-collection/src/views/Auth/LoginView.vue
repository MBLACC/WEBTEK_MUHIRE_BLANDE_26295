<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import AccessibleInput from '@/components/AccessibleInput.vue'
import AccessibleButton from '@/components/AccessibleButton.vue'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const username = ref('')
const password = ref('')
const errorMsg = ref('')
const successMsg = ref('')

if (route.query.deleted) {
  successMsg.value = 'Account permanently deleted. The action was successfully performed.'
}

const hasEmailInput = computed(() => username.value.length > 0)
const isEmailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username.value))
const emailError = computed(() => hasEmailInput.value && !isEmailValid.value ? 'Invalid email format' : '')

const passwordStrength = computed(() => {
  const p = password.value
  if (!p) return ''
  let score = 0
  if (p.length >= 8) score += 1
  if (/[A-Z]/.test(p)) score += 1
  if (/[0-9]/.test(p)) score += 1
  if (/[^A-Za-z0-9]/.test(p)) score += 1
  
  if (score < 2) return 'red'
  if (score === 2 || score === 3) return 'yellow'
  return 'green'
})

const strengthLabel = computed(() => {
  if (passwordStrength.value === 'red') return 'Weak'
  if (passwordStrength.value === 'yellow') return 'Medium'
  if (passwordStrength.value === 'green') return 'Strong'
  return ''
})

const handleLogin = async () => {
  errorMsg.value = ''
  if (!username.value || !password.value) {
    errorMsg.value = 'Please enter both username and password'
    return
  }
  if (!isEmailValid.value) {
    errorMsg.value = 'Username must be in a valid format (e.g. @username.gmail.com)'
    return
  }
  if (passwordStrength.value !== 'green') {
    errorMsg.value = 'Password is not strong enough to proceed.'
    return
  }
  
  const res = await authStore.login(username.value, password.value)
  if (res.success) {
    const redirect = route.query.redirect || (authStore.user?.isAdmin ? '/admin' : '/')
    router.push(redirect)
  } else {
    errorMsg.value = res.message
  }
}
</script>

<template>
  <div class="auth-page container section-spacing">
    <div class="auth-box">
      <h1 class="page-title">Login</h1>

      <form @submit.prevent="handleLogin" novalidate aria-label="Login form" :aria-describedby="errorMsg ? 'login-error' : null">
        <AccessibleInput 
          id="username" 
          label="Email Address" 
          v-model="username" 
          placeholder="username@gmail.com"
          :error="emailError"
          :success="hasEmailInput && isEmailValid"
          required 
        />
        <AccessibleInput 
          id="password" 
          label="Password" 
          type="password" 
          v-model="password" 
          placeholder="......."
          required 
        />
        <div v-if="password" class="strength-meter" :style="{ color: passwordStrength === 'yellow' ? '#d97706' : passwordStrength }">
          Password Strength: {{ strengthLabel }}
        </div>
        
        <div v-if="errorMsg" id="login-error" class="error-alert" role="alert" tabindex="-1" ref="errorAlert">
          {{ errorMsg }}
        </div>
        <div v-if="successMsg" id="login-success" class="success-alert" role="alert" tabindex="-1">
          {{ successMsg }}
        </div>

        <AccessibleButton type="submit" label="Login" class="full-width" :disabled="!isEmailValid || passwordStrength !== 'green'" />
      </form>

      <div class="auth-links">
        <RouterLink to="/forgot-password">Forgot Password?</RouterLink>
        <RouterLink to="/signup">Create an Account</RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
}

.auth-box {
  width: 100%;
  max-width: 400px;
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  border: 1px solid var(--color-border);
}

.page-title {
  text-align: center;
  margin-bottom: 0.5rem;
}

.demo-info {
  text-align: center;
  color: #666;
  font-size: 0.875rem;
  margin-bottom: 2rem;
}

.full-width {
  width: 100%;
  margin-top: 1rem;
}

.error-alert {
  background: #fee2e2;
  color: var(--color-error);
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  text-align: center;
}

.success-alert {
  background: #d1fae5;
  color: #065f46;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  text-align: center;
  border: 1px solid #34d399;
}

.strength-meter {
  font-size: 0.875rem;
  font-weight: 600;
  margin-top: -0.5rem;
  margin-bottom: 1rem;
}

.auth-links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
  margin-top: 1.5rem;
  font-size: 0.875rem;
}
</style>
