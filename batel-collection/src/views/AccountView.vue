<script setup>
import { onMounted, computed, ref } from 'vue'
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
  return orderStore.orders.filter(o => o.userId === authStore.user?.id).sort((a,b) => new Date(b.date) - new Date(a.date))
})

const canCancel = (order) => {
  if (order.status !== 'pending') return false;
  const orderDate = new Date(order.date);
  const now = new Date();
  const diffHours = (now - orderDate) / (1000 * 60 * 60);
  return diffHours <= 12;
}

const notification = ref({ show: false, message: '', type: 'success' })
const showNotification = (msg, type = 'success') => {
  notification.value = { show: true, message: msg, type }
  setTimeout(() => notification.value.show = false, 3000)
}

const cancelOrder = async (orderId) => {
  if (confirm('Are you sure you want to cancel this order?')) {
    await orderStore.cancelOrder(orderId);
    showNotification('Order successfully cancelled and removed from the system.');
  }
}

const showDeleteModal = ref(false)

const logout = () => {
  authStore.logout()
  router.push('/login')
}

const promptDeleteAccount = () => {
  showDeleteModal.value = true
}

const cancelDeleteAccount = () => {
  showDeleteModal.value = false
}

const confirmDeleteAccount = async () => {
  showDeleteModal.value = false
  const userId = authStore.user.id;
  const result = await authStore.deleteAccount(userId);
  if (result.success) {
    router.push('/login?deleted=true');
  } else {
    showNotification(result.message || 'Failed to delete account', 'error');
  }
}
</script>

<template>
  <div v-if="notification.show" class="notification-toast" :class="notification.type" role="alert">
    {{ notification.message }}
  </div>
  <div class="account-page container section-spacing">
    <div class="account-header">
      <h1 class="page-title">My Account</h1>
      <AccessibleButton label="Logout" variant="secondary" @click="logout" />
    </div>

    <!-- Custom Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Delete Account</h3>
        <p>Are you sure you want to permanently delete your account? This action cannot be undone and you will lose all access to your order history.</p>
        <div class="modal-actions">
          <AccessibleButton label="Cancel" variant="secondary" @click="cancelDeleteAccount" />
          <button class="modal-delete-btn" @click="confirmDeleteAccount">Yes, Delete My Account</button>
        </div>
      </div>
    </div>

    <!-- Account Details -->
    <div v-if="authStore.user" class="account-details">
      <section class="profile-section">
        <h2>Profile</h2>
        <div class="profile-card">
          <p><strong>Name:</strong> {{ authStore.user.firstName }} {{ authStore.user.lastName }}</p>
          <p><strong>Email:</strong> {{ authStore.user.email }}</p>
          <p><strong>Username:</strong> {{ authStore.user.username }}</p>
          <div class="profile-actions">
            <button class="delete-account-btn" @click="promptDeleteAccount">Delete Account</button>
          </div>
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
              <div class="header-actions">
                <span :class="['status-badge', order.status]">{{ order.status }}</span>
                <button v-if="canCancel(order)" class="cancel-btn" @click="cancelOrder(order.id)">Cancel Order</button>
              </div>
            </div>
            <p class="order-date">Placed: {{ new Date(order.date).toLocaleString() }}</p>
            <p class="order-total">Total: {{ order.total.toLocaleString() }} RWF</p>
            <p class="order-payment">Payment: {{ order.paymentType === 'preorder' ? 'Half (Pre-order Deposit)' : 'Full' }}</p>
            <p v-if="order.paymentType === 'preorder'" class="order-total">Paid: {{ order.depositPaid.toLocaleString() }} / {{ order.total.toLocaleString() }}</p>
            <div class="order-items">
              <div v-for="(item, idx) in order.items" :key="idx" class="order-item-detail">
                <img :src="item.product.images?.length ? item.product.images[0] : item.product.image" :alt="item.product.name" class="item-img" />
                <div class="item-info">
                  <p class="item-name">{{ item.product.name }}</p>
                  <p class="item-meta">Qty: {{ item.quantity }} | Size: {{ item.size || 'N/A' }} | Color: {{ item.color || 'N/A' }}</p>
                  <p class="item-meta">Paid in {{ order.paymentType === 'preorder' ? 'Half' : 'Full' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.notification-toast {
  position: fixed;
  top: 1rem;
  right: 1rem;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  z-index: 9999;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  animation: slideIn 0.3s ease-out;
}
.notification-toast.success { background-color: #10b981; }
.notification-toast.error { background-color: #ef4444; }

@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--color-error);
  font-size: 1.25rem;
}

.modal-content p {
  color: #4b5563;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.modal-delete-btn {
  background-color: var(--color-error);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.modal-delete-btn:hover {
  background-color: #b91c1c;
}

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

.profile-actions {
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--color-border);
}

.delete-account-btn {
  background-color: var(--color-error);
  color: white;
  border: 1px solid var(--color-error);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-account-btn:hover {
  background-color: #b91c1c; /* darker red */
  border-color: #b91c1c;
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
.status-badge.cancelled { background: #fee2e2; color: #ef4444; }

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.cancel-btn {
  background: white;
  border: 1px solid var(--color-error);
  color: var(--color-error);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: var(--color-error);
  color: white;
}

.order-date, .order-total, .order-payment {
  font-size: 0.875rem;
  color: #555;
  margin-bottom: 0.25rem;
}

.order-items {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border-top: 1px solid var(--color-border);
  padding-top: 1rem;
}

.order-item-detail {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.item-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid var(--color-border);
}

.item-info {
  display: flex;
  flex-direction: column;
}

.item-name {
  font-weight: 600;
  margin: 0;
  font-size: 0.95rem;
}

.item-meta {
  margin: 0;
  font-size: 0.85rem;
  color: #666;
}
</style>
