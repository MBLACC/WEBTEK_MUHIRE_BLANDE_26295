<script setup>
import { useCartStore } from '@/stores/useCartStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { useRouter } from 'vue-router'
import AccessibleButton from '@/components/AccessibleButton.vue'
import { Trash2 } from 'lucide-vue-next'

const cartStore = useCartStore()
const authStore = useAuthStore()
const router = useRouter()

const proceedToCheckout = () => {
  if (authStore.user) {
    router.push('/checkout')
  } else {
    router.push('/login?redirect=/checkout')
  }
}
</script>

<template>
  <div class="cart-page container section-spacing">
    <h1 class="page-title">Your Cart</h1>
    
    <div v-if="cartStore.items.length === 0" class="empty-state">
      <p>Your cart is currently empty.</p>
      <AccessibleButton label="Continue Shopping" @click="router.push('/shop')" />
    </div>

    <div v-else class="cart-layout">
      <div class="cart-items" role="list" aria-label="Cart Items">
        <div v-for="(item, index) in cartStore.items" :key="index" class="cart-item" role="listitem">
          <div class="item-image">
            <img :src="item.product.image" :alt="item.product.name" />
          </div>
          
          <div class="item-details">
            <div class="item-header">
              <h3>{{ item.product.name }}</h3>
              <p class="item-price">{{ item.product.price.toLocaleString() }} RWF</p>
            </div>
            
            <p class="item-options">
              Size: {{ item.size }} | Color: {{ item.color }} 
              <span v-if="!item.product.inStore" class="preorder">(Pre-order)</span>
            </p>

            <div class="item-actions">
              <div class="quantity-control">
                <button @click="cartStore.updateQuantity(index, -1)" aria-label="Decrease quantity" class="qty-btn">-</button>
                <span class="qty" aria-live="polite">{{ item.quantity }}</span>
                <button @click="cartStore.updateQuantity(index, 1)" aria-label="Increase quantity" class="qty-btn">+</button>
              </div>
              
              <button @click="cartStore.removeFromCart(index)" class="remove-btn" aria-label="Remove item">
                <Trash2 :size="18" aria-hidden="true" />
                <span class="sr-only">Remove</span>
              </button>
            </div>
          </div>
          
          <div class="line-total">
            <p>Total: <strong>{{ (item.product.price * item.quantity).toLocaleString() }} RWF</strong></p>
          </div>
        </div>
      </div>

      <div class="cart-summary">
        <h2>Order Summary</h2>
        <div class="summary-row">
          <span>Subtotal</span>
          <span>{{ cartStore.total.toLocaleString() }} RWF</span>
        </div>
        <p class="summary-note">Taxes and shipping calculated at checkout</p>
        
        <AccessibleButton 
          label="Proceed to Checkout" 
          class="checkout-btn" 
          @click="proceedToCheckout" 
        />
        <p v-if="!authStore.user" class="login-note">You will be asked to log in first.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-title {
  margin-bottom: 2rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: var(--color-bg);
  border: 1px dashed var(--color-border);
  border-radius: 8px;
}

.empty-state p {
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
  color: #666;
}

.cart-layout {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
  align-items: start;
}

@media (max-width: 900px) {
  .cart-layout {
    grid-template-columns: 1fr;
  }
}

.cart-item {
  display: grid;
  grid-template-columns: 100px 1fr auto;
  gap: 1.5rem;
  padding: 1.5rem 0;
  border-bottom: 1px solid var(--color-border);
}

@media (max-width: 600px) {
  .cart-item {
    grid-template-columns: 80px 1fr;
  }
  .line-total {
    grid-column: 2;
    margin-top: 1rem;
  }
}

.item-image img {
  width: 100%;
  border-radius: 4px;
  object-fit: cover;
  aspect-ratio: 3/4;
}

.item-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.item-header h3 {
  font-size: 1.125rem;
  margin: 0;
}

.item-price {
  font-weight: 600;
  color: var(--color-primary);
}

.item-options {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 1rem;
}

.preorder {
  color: var(--color-primary);
  font-weight: 600;
}

.item-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.quantity-control {
  display: flex;
  align-items: center;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  overflow: hidden;
}

.qty-btn {
  background: var(--color-bg);
  border: none;
  padding: 0.25rem 0.5rem;
  font-size: 1rem;
}

.qty-btn:hover {
  background: var(--color-border);
}

.qty {
  padding: 0 0.75rem;
  min-width: 2rem;
  text-align: center;
}

.remove-btn {
  background: none;
  border: none;
  color: #666;
  padding: 0.25rem;
}

.remove-btn:hover {
  color: var(--color-error);
}

.line-total {
  text-align: right;
}

.cart-summary {
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
}

.cart-summary h2 {
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  font-size: 1.125rem;
  margin-bottom: 0.5rem;
}

.summary-note {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 1.5rem;
}

.checkout-btn {
  width: 100%;
}

.login-note {
  font-size: 0.875rem;
  color: var(--color-primary);
  text-align: center;
  margin-top: 0.75rem;
}
</style>
