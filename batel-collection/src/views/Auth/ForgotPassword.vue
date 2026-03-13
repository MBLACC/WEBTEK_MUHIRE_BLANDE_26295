<template>
  <div class="auth-page container section-spacing">
    <div class="auth-box">
      <h1 class="page-title">Forgot Password</h1>
      
      <div v-if="!submitted">
         <form @submit.prevent="handleForgotPassword">
           <AccessibleInput 
             v-model="email" 
             id="email" 
             label="Email Address" 
             type="email" 
             required 
             :error="emailError"
           />
           <div v-if="message" :class="['message', messageType]">{{ message }}</div>
           <AccessibleButton type="submit" label="Continue" class="full-width" :loading="loading" />
         </form>
      </div>
      <div v-else>
         <form @submit.prevent="handleResetPassword">
           <AccessibleInput 
             v-model="newPassword" 
             id="newpass" 
             label="New Password" 
             type="password" 
             required 
             :error="passwordError"
           />
           <AccessibleInput 
             v-model="confirmPassword" 
             id="confirmpass" 
             label="Confirm New Password" 
             type="password" 
             required 
           />
           <div v-if="message" :class="['message', messageType]">{{ message }}</div>
           <AccessibleButton type="submit" label="Reset Password" class="full-width" :loading="loading" />
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
const loading = ref(false)

const email = ref('')
const emailError = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const passwordError = ref('')
const message = ref('')
const messageType = ref('error')

const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    )
}

const handleForgotPassword = async () => {
  emailError.value = ''
  message.value = ''
  
  if (!validateEmail(email.value)) {
    emailError.value = 'Please enter a valid email address.'
    return
  }

  loading.value = true
  try {
    const response = await fetch('http://localhost:3001/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value })
    })
    
    let data;
    try {
      data = await response.json()
    } catch (parseError) {
      message.value = 'Server did not return a valid response. Please restart your backend server (node server.js).'
      messageType.value = 'error'
      return
    }
    
    if (response.ok) {
      submitted.value = true
      message.value = ''
    } else {
      message.value = data.error || 'Something went wrong.'
      messageType.value = 'error'
    }
  } catch (err) {
    message.value = 'Connection error. Please try again.'
    messageType.value = 'error'
  } finally {
    loading.value = false
  }
}

const handleResetPassword = async () => {
  passwordError.value = ''
  message.value = ''

  if (newPassword.value.length < 6) {
    passwordError.value = 'Password must be at least 6 characters.'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    message.value = 'Passwords do not match.'
    messageType.value = 'error'
    return
  }

  loading.value = true
  try {
    const response = await fetch('http://localhost:3001/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: newPassword.value })
    })

    let data;
    try {
      data = await response.json()
    } catch (parseError) {
      message.value = 'Server did not return a valid response. Please restart your backend server (node server.js).'
      messageType.value = 'error'
      return
    }

    if (response.ok) {
      message.value = 'Password reset successful! Redirecting...'
      messageType.value = 'success'
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } else {
      message.value = data.error || 'Something went wrong.'
      messageType.value = 'error'
    }
  } catch (err) {
    message.value = 'Connection error. Please try again.'
    messageType.value = 'error'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page { display: flex; justify-content: center; align-items: center; min-height: 50vh; }
.auth-box { width: 100%; max-width: 400px; padding: 2rem; border-radius: 8px; border: 1px solid var(--color-border); background:white; }
.page-title { text-align: center; margin-bottom: 0.5rem; }
.full-width { width: 100%; margin-top: 1rem; }
.auth-links { display: flex; justify-content: center; margin-top: 1.5rem; }

.message {
  padding: 0.75rem;
  border-radius: 4px;
  margin: 1rem 0;
  font-size: 0.875rem;
  text-align: center;
}
.message.error {
  background-color: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}
.message.success {
  background-color: #dcfce7;
  color: #15803d;
  border: 1px solid #bbf7d0;
}
</style>
