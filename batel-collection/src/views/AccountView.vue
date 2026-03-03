<script setup>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { useOrderStore } from '@/stores/useOrderStore'
import AccessibleButton from '@/components/AccessibleButton.vue'

const authStore = useAuthStore()
const orderStore = useOrderStore()
const router = useRouter()

if (!authStore.user) {
  router.push('/login')
}

onMounted(() => {
  orderStore.fetchOrders()
})

const myOrders = computed(() => {
  return orderStore.orders.filter(o => o.userId === authStore.user?.id)
})

const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="account-page container section-spacing">
    <div class="account-header">
      <h1 class="page-title">My Account</h1>
      <AccessibleButton label="Logout" variant="secondary" @click="logout" />
    </div>

    <div v-if="authStore.user" class="account-details">
      <section class="profile-section">
        <h2>Profile</h2>
        <div class="profile-card">
          <p><strong>Name:</strong> {{ authStore.user.firstName }} {{ authStore.user.lastName }}</p>
          <p><strong>Email:</strong> {{ authStore.user.email }}</p>
          <p><strong>Username:</strong> {{ authStore.user.username }}</p>
        </div>
      </section>

      <section class="orders-section">
        <h2>Order History</h2>
        <div v-if="myOrders.length === 0" class="empty-orders">
          <p>You haven't placed any orders yet.</p>
        </div>
        <div class="order-list" v-else>
          <div v-for="order in myOrders" :key="order.id" class="order-card">
            <div class="order-header">
              <h3>Order #{{ order.id }}</h3>
              <span :class="['status-badge', order.status]">{{ order.status }}</span>
            </div>
            <p class="order-date">Placed: {{ new Date(order.date).toLocaleDateString() }}</p>
            <p class="order-total">Total: {{ order.total.toLocaleString() }} RWF</p>
            <p v-if="order.paymentType === 'preorder'" class="order-total">Paid: {{ order.depositPaid.toLocaleString() }} / {{ order.total.toLocaleString() }} (50% Pre-order)</p>
            <div class="order-items">
              <span v-for="(item, idx) in order.items" :key="idx" class="order-item-chip">
                {{ item.quantity }}x {{ item.product.name }}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.account-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  margin: 0;
}

.account-details {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 3rem;
}

@media (max-width: 768px) {
  .account-details {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}

.profile-section h2, .orders-section h2 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 0.5rem;
}

.profile-card {
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
}

.profile-card p {
  margin-bottom: 0.5rem;
}

.empty-orders {
  padding: 2rem;
  background: #f9f9f9;
  text-align: center;
  border-radius: 8px;
  color: #666;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.order-card {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.5rem;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.order-header h3 {
  margin: 0;
  font-size: 1.125rem;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.pending { background: #fef08a; color: #854d0e; }
.status-badge.confirmed { background: #bae6fd; color: #0c4a6e; }
.status-badge.preparing { background: #ddd6fe; color: #4c1d95; }
.status-badge.delivered { background: #bbf7d0; color: #14532d; }

.order-date, .order-total {
  font-size: 0.875rem;
  color: #555;
  margin-bottom: 0.25rem;
}

.order-items {
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.order-item-chip {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  padding: 0.25rem 0.5rem;
  border-radius: 99px;
  font-size: 0.75rem;
}
</style>
