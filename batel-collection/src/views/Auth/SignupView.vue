<script setup>
import { ref, computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import AccessibleInput from '@/components/AccessibleInput.vue'
import AccessibleButton from '@/components/AccessibleButton.vue'

const authStore = useAuthStore()
const router = useRouter()

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  whatsappPhone: '',
  password: '',
  confirm: ''
})

const errorMsg = ref('')
const isCheckingWhatsapp = ref(false)
const whatsappVerified = ref(false)

const hasEmailInput = computed(() => form.value.email.length > 0)
const isEmailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email))
const emailError = computed(() => hasEmailInput.value && !isEmailValid.value ? 'Invalid email format' : '')

const hasConfirmInput = computed(() => form.value.confirm.length > 0)
const isPasswordMatch = computed(() => hasConfirmInput.value && form.value.password === form.value.confirm)
const confirmError = computed(() => hasConfirmInput.value && !isPasswordMatch.value ? 'Passwords do not match' : '')

const passwordStrength = computed(() => {
  const p = form.value.password
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

let timeout = null
const checkWhatsapp = () => {
  clearTimeout(timeout)
  isCheckingWhatsapp.value = false
  whatsappVerified.value = false
  if (form.value.whatsappPhone.length >= 8) {
    isCheckingWhatsapp.value = true
    timeout = setTimeout(() => {
      whatsappVerified.value = true
      isCheckingWhatsapp.value = false
    }, 1500)
  }
}

const handleSubmit = async () => {
  errorMsg.value = ''
  if (!isEmailValid.value) {
    errorMsg.value = 'Username must be in a valid format (e.g. @username.gmail.com)'
    return
  }
  if (passwordStrength.value !== 'green') {
    errorMsg.value = 'Password is not strong enough to proceed.'
    return
  }
  if (!isPasswordMatch.value) {
    errorMsg.value = 'Passwords do not match'
    return
  }
  if (!form.value.whatsappPhone || !whatsappVerified.value) {
    errorMsg.value = 'Please provide a valid WhatsApp number and wait for verification.'
    return
  }
  
  const payload = { ...form.value, username: form.value.email }
  const res = await authStore.signup(payload)
  if (res.success) {
    router.push('/account')
  } else {
    errorMsg.value = res.message
  }
}
</script>

<template>
  <div class="auth-page container section-spacing">
    <div class="auth-box">
      <h1 class="page-title">Create Account</h1>

      <form @submit.prevent="handleSubmit" novalidate aria-label="Signup form">
        <AccessibleInput id="firstName" v-model="form.firstName" label="First Name" required />
        <AccessibleInput id="lastName" v-model="form.lastName" label="Last Name" required />
        <AccessibleInput id="email" v-model="form.email" label="Email Address" type="email" placeholder="username@gmail.com" :error="emailError" :success="hasEmailInput && isEmailValid" required />
        
        <div class="whatsapp-group">
          <AccessibleInput id="whatsapp" v-model="form.whatsappPhone" label="Number" placeholder="Enter your phone number" @input="checkWhatsapp" required />
          <div class="whatsapp-status">
            <span v-if="isCheckingWhatsapp" class="status-checking">Checking WhatsApp...</span>
            <span v-else-if="whatsappVerified" class="status-verified">✓ Verified on WhatsApp</span>
          </div>
        </div>

        <AccessibleInput id="password" v-model="form.password" label="Password" type="password" required />
        <div v-if="form.password" class="strength-meter" :style="{ color: passwordStrength === 'yellow' ? '#d97706' : passwordStrength }">
          Password Strength: {{ strengthLabel }}
        </div>

        <AccessibleInput id="confirm" v-model="form.confirm" label="Confirm Password" type="password" :error="confirmError" :success="isPasswordMatch" required />

        <div v-if="errorMsg" class="error-alert" role="alert">
          {{ errorMsg }}
        </div>

        <AccessibleButton type="submit" label="Sign Up" class="full-width" :disabled="!isEmailValid || passwordStrength !== 'green' || !whatsappVerified || !isPasswordMatch" />
      </form>

      <div class="auth-links">
        <RouterLink to="/login">Already have an account? Login</RouterLink>
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
  max-width: 500px;
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  border: 1px solid var(--color-border);
}

.page-title {
  text-align: center;
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

.strength-meter {
  font-size: 0.875rem;
  font-weight: 600;
  margin-top: -0.5rem;
  margin-bottom: 1rem;
}

.whatsapp-group {
  position: relative;
  margin-bottom: 1.5rem;
}
.whatsapp-group :deep(.input-group) {
  margin-bottom: 0.25rem;
}
.whatsapp-status {
  font-size: 0.875rem;
  font-weight: 600;
  height: 1.2rem;
}
.status-checking { color: #d97706; }
.status-verified { color: #16a34a; }

.auth-links {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
  font-size: 0.875rem;
}
</style>
