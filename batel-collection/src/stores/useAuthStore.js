import { defineStore } from 'pinia'
import { ref } from 'vue'
import { storageService } from '../services/storageService'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user')) || null)
  const token = ref(localStorage.getItem('token') || null)

  const login = async (username, password) => {
    try {
      const users = storageService.getAll('users');
      const normalizedInput = username ? username.toLowerCase() : '';
      
      const foundUser = users.find(u => {
        const dbEmail = u.email ? u.email.toLowerCase() : '';
        const dbUser = u.username ? u.username.toLowerCase() : '';
        return (dbUser === normalizedInput || dbEmail === normalizedInput);
      });

      if (!foundUser || foundUser.password !== password) {
        return { success: false, message: 'Invalid credentials' }
      }

      if (foundUser.isPermanentlyLocked) {
        return { success: false, message: 'Account is permanently locked.' }
      }

      const { password: _, ...safeUser } = foundUser;
      user.value = safeUser
      token.value = 'fake-jwt-token-' + foundUser.id
      localStorage.setItem('user', JSON.stringify(user.value))
      localStorage.setItem('token', token.value)
      return { success: true }
    } catch (error) {
      return { success: false, message: 'Login failed' }
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
      const users = storageService.getAll('users');
      if (users.find(u => u.username === userData.username || u.email === userData.email)) {
        return { success: false, message: 'Username or email already exists' }
      }
      
      const newUser = storageService.add('users', { ...userData, isAdmin: false });
      const { password: _, ...safeUser } = newUser;
      
      user.value = safeUser
      token.value = 'fake-jwt-token-' + newUser.id
      localStorage.setItem('user', JSON.stringify(user.value))
      localStorage.setItem('token', token.value)
      return { success: true }
    } catch (error) {
      return { success: false, message: 'Signup failed' }
    }
  }

  return { user, token, login, logout, signup }
})
