<template>
  <div class="auth-page container">
    <div class="card auth-card">
      <h2>Sign Up</h2>
      <form @submit.prevent="handleSignup">
        <div class="form-group">
          <label>Username</label>
          <input type="text" v-model="username" required minlength="3" />
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" v-model="password" required minlength="4" />
        </div>
        <div class="form-group">
          <label>Confirm Password</label>
          <input type="password" v-model="confirmPassword" required minlength="4" />
        </div>
        <p class="error" v-if="errorMessage">{{ errorMessage }}</p>
        <button type="submit" class="btn full-width">Create Account</button>
      </form>
      <p class="switch-auth">Already have an account? <router-link to="/login">Sign in</router-link></p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const router = useRouter()

const handleSignup = async () => {
  if (username.value.trim().length < 3 || password.value.trim().length < 4) {
    errorMessage.value = "Invalid input length";
    return;
  }
  if (password.value !== confirmPassword.value) {
    errorMessage.value = "Passwords do not match";
    return;
  }
  try {
    const res = await fetch('http://localhost:8080/api/users/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, password: password.value })
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('user', JSON.stringify(data));
      router.push('/dashboard');
    } else {
      errorMessage.value = data.message || "Signup failed";
    }
  } catch (err) {
    errorMessage.value = "Network error";
  }
}
</script>

<style scoped>
.auth-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80vh;
}
.auth-card {
  width: 100%;
  max-width: 400px;
}
.auth-card h2 {
  text-align: center;
  margin-bottom: 20px;
}
.form-group {
  margin-bottom: 15px;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}
.full-width {
  width: 100%;
  margin-top: 10px;
}
.error {
  color: var(--error-color);
  font-size: 0.9em;
  margin-bottom: 10px;
}
.switch-auth {
  text-align: center;
  margin-top: 20px;
  font-size: 0.9em;
}
.switch-auth a {
  color: var(--text-color);
  font-weight: bold;
}
</style>
