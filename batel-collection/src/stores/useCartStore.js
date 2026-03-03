import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const items = ref(JSON.parse(localStorage.getItem('cartItems')) || [])

  const saveCart = () => {
    localStorage.setItem('cartItems', JSON.stringify(items.value))
  }

  const addToCart = (product, size, color, quantity = 1) => {
    const existing = items.value.find(i => i.product.id === product.id && i.size === size && i.color === color)
    if (existing) {
      existing.quantity += quantity
    } else {
      items.value.push({ product, size, color, quantity })
    }
    saveCart()
  }

  const removeFromCart = (index) => {
    items.value.splice(index, 1)
    saveCart()
  }

  const updateQuantity = (index, delta) => {
    items.value[index].quantity += delta
    if (items.value[index].quantity <= 0) {
      removeFromCart(index)
    } else {
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

  return { items, addToCart, removeFromCart, updateQuantity, clearCart, total }
})
