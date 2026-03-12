import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useAuthStore } from './useAuthStore'

export const useCartStore = defineStore('cart', () => {
  const authStore = useAuthStore()
  
  const getCartKey = () => {
    return authStore.user ? `cartItems_${authStore.user.id}` : 'cartItems_guest'
  }
  
  const items = ref(JSON.parse(localStorage.getItem(getCartKey())) || [])

  const saveCart = () => {
    localStorage.setItem(getCartKey(), JSON.stringify(items.value))
  }

  // Watch for user login/logout to change the cart data
  watch(() => authStore.user, () => {
    items.value = JSON.parse(localStorage.getItem(getCartKey())) || []
  })

  const addToCart = (product, size, color, quantity = 1) => {
    const existing = items.value.find(i => i.product.id === product.id && i.size === size && i.color === color)
    if (existing) {
      const newQty = existing.quantity + quantity
      if (product.stock > 0 && newQty > product.stock) {
        existing.quantity = product.stock
        alert(`Cannot add more. Only ${product.stock} items available in stock.`)
      } else {
        existing.quantity = newQty
      }
    } else {
      const initialQty = (product.stock > 0 && quantity > product.stock) ? product.stock : quantity
      if (product.stock > 0 && quantity > product.stock) {
        alert(`Adding maximum available stock: ${product.stock}.`)
      }
      items.value.push({ product, size, color, quantity: initialQty })
    }
    saveCart()
  }

  const removeFromCart = (index) => {
    items.value.splice(index, 1)
    saveCart()
  }

  const updateQuantity = (index, delta) => {
    const item = items.value[index]
    const newQty = item.quantity + delta
    
    if (newQty <= 0) {
      removeFromCart(index)
    } else if (item.product.stock > 0 && newQty > item.product.stock) {
      item.quantity = item.product.stock
      alert(`Cannot increase quantity. Only ${item.product.stock} items available in stock.`)
      saveCart()
    } else {
      item.quantity = newQty
      saveCart()
    }
  }

  const clearCart = () => {
    items.value = []
    saveCart()
  }

  const total = computed(() => {
    return items.value.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  })

  const totalItems = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  return { items, addToCart, removeFromCart, updateQuantity, clearCart, total, totalItems }
})
