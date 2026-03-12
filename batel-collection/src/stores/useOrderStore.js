import { defineStore } from 'pinia'
import axios from 'axios'
import { ref } from 'vue'

const API_URL = 'http://localhost:3001/api'

export const useOrderStore = defineStore('orders', () => {
  const orders = ref([])

  const fetchOrders = async () => {
    const res = await axios.get(`${API_URL}/orders`)
    orders.value = res.data
  }

  const createOrder = async (orderData) => {
    const res = await axios.post(`${API_URL}/orders`, { ...orderData, status: 'pending', date: new Date().toISOString() })
    orders.value.push(res.data)
    return res.data
  }

  const updateOrderStatus = async (id, status) => {
    const order = orders.value.find(o => o.id === Number(id))
    if (order) {
        order.status = status
        await axios.put(`${API_URL}/orders/${id}`, order)
    }
  }
  const cancelOrder = async (id) => {
    try {
      console.log('Cancelling order:', id, 'Type:', typeof id);
      await axios.delete(`${API_URL}/orders/${id}`);
      // Use string comparison to be safe with large IDs or mixed types
      orders.value = orders.value.filter(o => String(o.id) !== String(id));
      console.log('Order removed from local state');
    } catch (error) {
      console.error('Failed to cancel order:', error);
      throw error;
    }
  }

  return { orders, fetchOrders, createOrder, updateOrderStatus, cancelOrder }
})
