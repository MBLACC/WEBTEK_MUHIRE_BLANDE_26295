import { defineStore } from 'pinia'
import axios from 'axios'
import { ref } from 'vue'

const API_URL = 'http://localhost:3001/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user')) || null)
  const token = ref(localStorage.getItem('token') || null)

  const login = async (username, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { username, password })
      user.value = response.data.user
      token.value = response.data.token
      localStorage.setItem('user', JSON.stringify(user.value))
      localStorage.setItem('token', token.value)
      return { success: true }
    } catch (error) {
      return { success: false, message: error.response?.data?.error || 'Login failed' }
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  const signup = async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, userData)
      user.value = response.data.user
      token.value = response.data.token
      localStorage.setItem('user', JSON.stringify(user.value))
      localStorage.setItem('token', token.value)
      return { success: true }
    } catch (error) {
      return { success: false, message: error.response?.data?.error || 'Signup failed' }
    }
  }

  return { user, token, login, logout, signup }
})
