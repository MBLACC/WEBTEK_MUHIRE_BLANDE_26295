<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/useCartStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { useOrderStore } from '@/stores/useOrderStore'
import { useProductStore } from '@/stores/useProductStore'
import AccessibleInput from '@/components/AccessibleInput.vue'
import AccessibleButton from '@/components/AccessibleButton.vue'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()
const orderStore = useOrderStore()
const productStore = useProductStore()

if (cartStore.items.length === 0) {
  router.push('/shop')
}

const form = ref({
  fullName: authStore.user?.firstName ? `${authStore.user.firstName} ${authStore.user.lastName}` : '',
  countryCode: '+250',
  whatsappPhone: '',
  email: authStore.user?.email || '',
  address: '',
  city: 'Kigali',
  paymentType: 'full', // 'full' or 'preorder'
  agreedToTransport: false
})

const errors = ref({})

const transportFee = computed(() => {
  return form.value.city.toLowerCase() === 'kigali' ? 1500 : 0
})

const finalTotal = computed(() => cartStore.total + transportFee.value)
const inStockTotal = computed(() => {
  return cartStore.items
    .filter(i => i.product.inStore)
    .reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
})
const preorderTotal = computed(() => {
  return cartStore.items
    .filter(i => !i.product.inStore)
    .reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
})

const depositAmount = computed(() => {
  if (form.value.paymentType === 'preorder') {
    return inStockTotal.value + (preorderTotal.value / 2) + transportFee.value
  }
  return finalTotal.value
})

const hasPreorderItems = computed(() => cartStore.items.some(i => !i.product.inStore))

const validateForm = () => {
  errors.value = {}
  if (form.value.fullName.length < 2) errors.value.fullName = 'Full Name requires min 2 characters'
  if (!form.value.countryCode) errors.value.countryCode = 'Required'
  if (!/^\d+$/.test(form.value.whatsappPhone)) errors.value.whatsappPhone = 'Digits only allowed'
  if (form.value.address.length < 5) errors.value.address = 'Address requires min 5 characters'
  if (form.value.city.length < 2) errors.value.city = 'City requires min 2 characters'
  if (!form.value.agreedToTransport) errors.value.agreedToTransport = 'You must agree to the transport policy'

  return Object.keys(errors.value).length === 0
}

const placeOrder = async () => {
  if (!validateForm()) return
  
  const orderDetails = {
    userId: authStore.user?.id || 'guest',
    customerInfo: { ...form.value },
    items: cartStore.items.map(i => ({ ...i })), // snapshot of cart at time of order
    subtotal: cartStore.total,
    transportFee: transportFee.value,
    total: finalTotal.value,
    depositPaid: depositAmount.value,
    paymentType: form.value.paymentType
  }

  try {
    await orderStore.createOrder(orderDetails)
    // Re-fetch products so stock levels update immediately on client & admin pages
    await productStore.fetchProducts()
    cartStore.clearCart()
    router.push('/account')
  } catch (err) {
    console.error('Order placement failed:', err)
    alert('There was an error placing your order. Please try again.')
  }
}
</script>

<template>
  <div class="checkout-page container section-spacing">
    <h1 class="page-title">Checkout</h1>
    
    <div class="checkout-layout">
      <div class="checkout-form">
        <form @submit.prevent="placeOrder" aria-label="Checkout Form" novalidate>
          <fieldset>
            <legend class="section-heading">Contact Information</legend>
            <AccessibleInput id="fullname" label="Full Name" v-model="form.fullName" :error="errors.fullName" required />
            <div class="form-row">
              <AccessibleInput id="code" label="Country Code" v-model="form.countryCode" placeholder="+250" :error="errors.countryCode" required />
              <AccessibleInput id="phone" label="WhatsApp Phone" v-model="form.whatsappPhone" placeholder="78..." :error="errors.whatsappPhone" required />
            </div>
            <AccessibleInput id="email" label="Email (Optional)" v-model="form.email" type="email" />
          </fieldset>

          <fieldset>
            <legend class="section-heading">Delivery Address</legend>
            <AccessibleInput id="address" label="Address" v-model="form.address" placeholder="Street, Neighborhood" :error="errors.address" required />
            <AccessibleInput id="city" label="City" v-model="form.city" :error="errors.city" required />
          </fieldset>

          <fieldset>
            <legend class="section-heading">Transport Policy</legend>
            <div class="policy-box">
              <p>Delivery in Kigali is 1,500 RWF. For countryside, we will contact you via WhatsApp for the fee.</p>
              <label class="checkbox-label">
                <input type="checkbox" v-model="form.agreedToTransport" :aria-invalid="!!errors.agreedToTransport" />
                I agree to the transport policy
              </label>
              <div v-if="errors.agreedToTransport" class="error-msg" role="alert">{{ errors.agreedToTransport }}</div>
            </div>
          </fieldset>

          <fieldset>
            <legend class="section-heading">Payment Information</legend>
            <div v-if="inStockTotal > 0" class="policy-box" style="margin-bottom: 1rem;">
               <strong>In-Stock Items:</strong> {{ inStockTotal.toLocaleString() }} RWF 
               <br/><small>(Requires full payment now)</small>
            </div>
            
            <div v-if="hasPreorderItems">
              <strong style="display: block; margin-bottom: 0.5rem;">Pre-Order Items ({{ preorderTotal.toLocaleString() }} RWF)</strong>
              <div class="payment-options">
                <label class="radio-label">
                  <input type="radio" value="full" v-model="form.paymentType" />
                  <div>
                    <strong>Pay Pre-Order in Full</strong>
                    <p>Pay 100% now ({{ preorderTotal.toLocaleString() }} RWF)</p>
                  </div>
                </label>
                <label class="radio-label">
                  <input type="radio" value="preorder" v-model="form.paymentType" />
                  <div>
                    <strong>Pay Half Now, Half on Arrival</strong>
                    <p>Pay 50% now ({{ (preorderTotal / 2).toLocaleString() }} RWF). Remaining 50% due later.</p>
                  </div>
                </label>
              </div>
            </div>
            <div v-else class="policy-box">
               <strong>All items are in-stock and will be paid in full today.</strong>
            </div>
          </fieldset>

          <AccessibleButton label="Place Order" type="submit" class="submit-btn" />
        </form>
      </div>
      
      <div class="checkout-summary">
        <h2 class="section-heading">Order Summary</h2>
        <div class="scroll-items">
          <div v-for="(item, index) in cartStore.items" :key="index" class="summary-item">
            <span class="qty-badge">{{ item.quantity }}</span>
            <img :src="item.product.image" :alt="item.product.name" class="tiny-img" />
            <div class="item-meta">
              <span>{{ item.product.name }}</span>
              <small>{{ item.size }}, {{ item.color }}</small>
            </div>
            <span>{{ (item.product.price * item.quantity).toLocaleString() }} RWF</span>
          </div>
        </div>

        <div class="totals">
          <div class="row"><span>Subtotal</span><span>{{ cartStore.total.toLocaleString() }} RWF</span></div>
          <div class="row">
            <span>Transport ({{ form.city === 'Kigali' ? 'Kigali' : 'Countryside' }})</span>
            <span>{{ transportFee > 0 ? transportFee.toLocaleString() : 'TBD' }} RWF</span>
          </div>
          <div class="row total-row"><span>Order Total</span><span>{{ finalTotal.toLocaleString() }} RWF</span></div>
          <div class="row due-row">
            <span>Amount Due Today</span>
            <span>{{ depositAmount.toLocaleString() }} RWF</span>
          </div>
          <div class="row" v-if="form.paymentType === 'preorder' && hasPreorderItems">
            <span style="color: #666; font-size: 0.85rem;">Balance due on arrival:</span>
            <span style="color: #666; font-size: 0.85rem;">{{ (preorderTotal / 2).toLocaleString() }} RWF</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-title {
  margin-bottom: 2rem;
}

.checkout-page {
  padding-bottom: 6rem; /* Add space above footer */
}

.checkout-layout {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 3rem;
}

@media (max-width: 900px) {
  .checkout-layout {
    grid-template-columns: 1fr;
    flex-direction: column-reverse;
  }
}

form fieldset {
  border: none;
  padding: 0;
  margin-bottom: 2rem;
}

.section-heading {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--color-primary);
  width: 100%;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-row > * {
  flex: 1;
}

.policy-box {
  background: #f9f9f9;
  padding: 1rem;
  border-radius: 4px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
}

.error-msg {
  color: var(--color-error);
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.payment-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.radio-label {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.radio-label:has(input:checked) {
  border-color: var(--color-primary);
  background: rgba(80, 65, 67, 0.05);
}

.submit-btn {
  width: 100%;
  font-size: 1.125rem;
  padding: 1rem;
}

.checkout-summary {
  background: #f9f9f9;
  padding: 2rem;
  border-radius: 8px;
  align-self: flex-start;
}

.scroll-items {
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 1.5rem;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  position: relative;
}

.tiny-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.qty-badge {
  position: absolute;
  top: -8px;
  left: 50px;
  background: rgba(80, 65, 67, 0.9);
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  z-index: 1;
}

.item-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  font-size: 0.875rem;
}

.totals {
  border-top: 1px solid var(--color-border);
  padding-top: 1rem;
}

.row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.total-row {
  font-size: 1.25rem;
  font-weight: 700;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px dashed var(--color-border);
}

.due-row {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-primary);
}
</style>
