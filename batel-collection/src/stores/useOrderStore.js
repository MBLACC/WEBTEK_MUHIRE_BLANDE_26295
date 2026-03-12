import { defineStore } from 'pinia'
import { ref } from 'vue'
import { storageService } from '../services/storageService'

export const useOrderStore = defineStore('orders', () => {
  const orders = ref([])

  const fetchOrders = async () => {
    orders.value = storageService.getAll('orders')
  }

  const createOrder = async (orderData) => {
    // 1. Reduce stock for each item in the order
    const products = storageService.getAll('products');
    const orderItems = orderData.items || [];
    
    orderItems.forEach(item => {
      const productIndex = products.findIndex(p => p.id === Number(item.product.id));
      if (productIndex !== -1) {
        const product = products[productIndex];
        product.stock = Math.max(0, product.stock - (item.quantity || 1));
        
        if (product.stock <= 0) {
          product.inStore = false;
        }
      }
    });

    // 2. Save updated products
    storageService.save('products', products);

    // 3. Create the order
    const newOrder = storageService.add('orders', { 
      ...orderData, 
      status: 'pending', 
      date: new Date().toISOString() 
    });

    orders.value.push(newOrder);
    return newOrder;
  }

  const updateOrderStatus = async (id, status) => {
    const updatedOrder = storageService.update('orders', id, { status });
    if (updatedOrder) {
      const index = orders.value.findIndex(o => o.id === Number(id));
      if (index !== -1) orders.value[index] = updatedOrder;
    }
  }

  const cancelOrder = async (id) => {
    storageService.delete('orders', id);
    orders.value = orders.value.filter(o => String(o.id) !== String(id));
  }

  return { orders, fetchOrders, createOrder, updateOrderStatus, cancelOrder }
})
