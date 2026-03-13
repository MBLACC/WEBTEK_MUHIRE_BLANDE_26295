<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { useOrderStore } from '@/stores/useOrderStore'
import { useProductStore } from '@/stores/useProductStore'
import AccessibleButton from '@/components/AccessibleButton.vue'
import AccessibleInput from '@/components/AccessibleInput.vue'

const authStore = useAuthStore()
const orderStore = useOrderStore()
const productStore = useProductStore()
const router = useRouter()

if (!authStore.user?.isAdmin) {
  router.push('/account')
}

const activeTab = ref('Dashboard')
const tabs = ['Dashboard', 'Products', 'Categories', 'New Arrivals', 'Orders']

// --- New Order Notification ---
const lastSeenOrderCount = ref(parseInt(localStorage.getItem('lastSeenOrderCount') || '0'))
const newOrdersCount = computed(() => {
  const total = orderStore.orders.length
  return total > lastSeenOrderCount.value ? total - lastSeenOrderCount.value : 0
})
const markOrdersAsSeen = () => {
  lastSeenOrderCount.value = orderStore.orders.length
  localStorage.setItem('lastSeenOrderCount', String(orderStore.orders.length))
}

onMounted(async () => {
  await Promise.all([
    orderStore.fetchOrders(),
    productStore.fetchProducts(),
    productStore.fetchCategories(),
    productStore.fetchNewArrivals()
  ])
})

// --- Utilities ---
const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = () => resolve(reader.result)
  reader.onerror = error => reject(error)
})

// --- Dashboard ---
const totalRevenue = computed(() => orderStore.orders.reduce((sum, o) => sum + o.total, 0))
const totalCustomers = computed(() => new Set(orderStore.orders.map(o => o.userId)).size)
const soldOutProducts = computed(() => productStore.products.filter(p => p.stock <= 0))
const recentOrders = computed(() => [...orderStore.orders].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 5))

// --- Products ---
const showProductForm = ref(false)
const editingProductId = ref(null)
const productForm = ref({ name: '', category: '', subcategory: '', price: 0, description: '', size: [], color: [], stock: 0, image: '', images: [], inStore: true })

const selectedCategoryView = ref(null)
const selectedSubcategoryView = ref(null)

const productExplorerData = computed(() => {
  const data = {};
  for (const [cat, subs] of Object.entries(productStore.categories || {})) {
    data[cat] = {};
    for (const sub of subs) {
      data[cat][sub] = [];
    }
  }
  
  (productStore.products || []).forEach(p => {
    if (!p.category) return;
    if (!data[p.category]) data[p.category] = {};
    const sub = p.subcategory || 'Uncategorized';
    if (!data[p.category][sub]) data[p.category][sub] = [];
    data[p.category][sub].push(p);
  });
  
  return data;
})

const availableSubcategories = computed(() => {
  return productStore.categories[productForm.value.category] || []
})

const availableSizes = computed(() => {
  if (productForm.value.category === 'Clothes') return ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL']
  if (productForm.value.category === 'Shoes') return Array.from({length: 16}, (_, i) => String(30 + i))
  return ['One Size']
})

const commonColors = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple', 'Brown', 'Grey', 'Orange', 'Navy', 'Beige']
const colorSearch = ref('')

const addColor = () => {
  const c = colorSearch.value.trim()
  if (c && !productForm.value.color.includes(c)) {
    productForm.value.color.push(c)
  }
  colorSearch.value = ''
}
const removeColor = (idx) => {
  productForm.value.color.splice(idx, 1)
}

// Auto-select first subcategory when category changes
watch(() => productForm.value.category, (newCat, oldCat) => {
  if (oldCat && newCat !== oldCat) {
    productForm.value.size = []
  }
  if (newCat && productStore.categories[newCat]) {
    const subs = productStore.categories[newCat]
    if (!subs.includes(productForm.value.subcategory)) {
      productForm.value.subcategory = subs[0] || ''
    }
  }
})

const handleProductImages = async (e) => {
  const files = Array.from(e.target.files)
  for (const file of files) {
    const base64 = await fileToBase64(file)
    productForm.value.images.push(base64)
  }
}
const removeImage = (index) => {
  productForm.value.images.splice(index, 1)
}

const editProduct = (p) => {
  editingProductId.value = p.id
  productForm.value = { 
    ...p, 
    size: p.size || [], 
    color: p.color || [],
    images: p.images || (p.image ? [p.image] : [])
  }
  showProductForm.value = true
}

const resetProductForm = () => {
  editingProductId.value = null
  showProductForm.value = false
  productForm.value = { name: '', category: '', subcategory: '', price: 0, description: '', size: [], color: [], stock: 0, image: '', images: [], inStore: true }
}

const saveProduct = async () => {
  const payload = {
    ...productForm.value,
    size: [...productForm.value.size],
    color: [...productForm.value.color],
    price: Number(productForm.value.price),
    stock: Number(productForm.value.stock),
    image: productForm.value.images.length ? productForm.value.images[0] : productForm.value.image
  }
  
  if (editingProductId.value) {
    await productStore.updateProduct(editingProductId.value, payload)
    showNotification('Product updated successfully!')
  } else {
    await productStore.addProduct(payload)
    showNotification('Product added successfully!')
  }
  resetProductForm()
}

const deleteProduct = async (id) => {
  if (confirm('Delete this product permanently?')) await productStore.deleteProduct(id)
}

// --- Categories ---
const newCatName = ref('')
const newSubName = ref('')
const selectedParentForSub = ref('')

const addCategory = async () => {
  if (!newCatName.value) return
  const current = JSON.parse(JSON.stringify(productStore.categories))
  if(!current[newCatName.value]) {
    current[newCatName.value] = []
    autoSaveStatus.value = 'saving'
    try {
      await productStore.updateCategories(current)
      autoSaveStatus.value = 'saved'
      showNotification(`Category "${newCatName.value}" added successfully!`)
      newCatName.value = ''
      setTimeout(() => { if (autoSaveStatus.value === 'saved') autoSaveStatus.value = '' }, 3000)
    } catch (e) {
      autoSaveStatus.value = 'error'
      const errorMsg = e.response?.data?.details || e.response?.data?.error || e.message;
      showNotification(`Failed to add category: ${errorMsg}`, "error")
      console.error("Add category error:", e)
    }
  } else {
    showNotification("Category already exists!", "error")
  }
}

const addSubcategory = async () => {
  if (!selectedParentForSub.value || !newSubName.value) return
  const current = JSON.parse(JSON.stringify(productStore.categories))
  if (!current[selectedParentForSub.value].includes(newSubName.value)) {
    current[selectedParentForSub.value].push(newSubName.value)
    autoSaveStatus.value = 'saving'
    try {
      await productStore.updateCategories(current)
      autoSaveStatus.value = 'saved'
      showNotification(`Subcategory "${newSubName.value}" added successfully!`)
      newSubName.value = ''
      setTimeout(() => { if (autoSaveStatus.value === 'saved') autoSaveStatus.value = '' }, 3000)
    } catch (e) {
      autoSaveStatus.value = 'error'
      const errorMsg = e.response?.data?.details || e.response?.data?.error || e.message;
      showNotification(`Failed to add subcategory: ${errorMsg}`, "error")
      console.error("Add subcategory error:", e)
    }
  } else {
    showNotification("Subcategory already exists!", "error")
  }
}

const deleteCategory = async (cat) => {
  if (confirm(`Delete the entire category "${cat}" and all its subcategories?`)) {
    const current = JSON.parse(JSON.stringify(productStore.categories))
    delete current[cat]
    autoSaveStatus.value = 'saving'
    try {
      await productStore.updateCategories(current)
      autoSaveStatus.value = 'saved'
      showNotification(`Category "${cat}" deleted.`)
      setTimeout(() => { if (autoSaveStatus.value === 'saved') autoSaveStatus.value = '' }, 3000)
    } catch (e) {
      autoSaveStatus.value = 'error'
      const errorMsg = e.response?.data?.details || e.response?.data?.error || e.message;
      showNotification(`Failed to delete category: ${errorMsg}`, "error")
      console.error("Delete category error:", e)
    }
  }
}

const deleteSubcategory = async (cat, sub) => {
  if (confirm(`Delete the subcategory "${sub}" from "${cat}"?`)) {
    const current = JSON.parse(JSON.stringify(productStore.categories))
    current[cat] = current[cat].filter(s => s !== sub)
    autoSaveStatus.value = 'saving'
    try {
      await productStore.updateCategories(current)
      autoSaveStatus.value = 'saved'
      showNotification(`Subcategory "${sub}" removed.`)
      setTimeout(() => { if (autoSaveStatus.value === 'saved') autoSaveStatus.value = '' }, 3000)
    } catch (e) {
      autoSaveStatus.value = 'error'
      const errorMsg = e.response?.data?.details || e.response?.data?.error || e.message;
      showNotification(`Failed to update subcategories: ${errorMsg}`, "error")
      console.error("Delete subcategory error:", e)
    }
  }
}

// --- New Arrivals ---
const showArrivalForm = ref(false)
const editingArrivalId = ref(null)
const arrivalForm = ref({ name: '', category: '', subcategory: '', image: '' })

const availableArrivalSubcats = computed(() => productStore.categories[arrivalForm.value.category] || [])

watch(() => arrivalForm.value.category, (newCat) => {
  if (productStore.categories[newCat]) {
    arrivalForm.value.subcategory = productStore.categories[newCat][0] || ''
  }
})

const handleArrivalImage = async (e) => {
  const file = e.target.files[0]
  if (file) arrivalForm.value.image = await fileToBase64(file)
}

const editArrival = (arr) => {
  editingArrivalId.value = arr.id
  arrivalForm.value = { ...arr }
  showArrivalForm.value = true
}

const resetArrivalForm = () => {
  editingArrivalId.value = null
  showArrivalForm.value = false
  arrivalForm.value = { name: '', category: '', subcategory: '', image: '' }
}

const saveArrival = async () => {
  if (editingArrivalId.value) {
    await productStore.updateNewArrival(editingArrivalId.value, { ...arrivalForm.value })
    showNotification('New Arrival updated successfully!')
  } else {
    await productStore.addNewArrival({ ...arrivalForm.value })
    showNotification('New Arrival added successfully!')
  }
  resetArrivalForm()
}

const deleteArrival = async (id) => {
  if (confirm('Delete this new arrival permanently?')) {
    await productStore.deleteNewArrival(id)
    showNotification('New Arrival deleted.')
  }
}

// --- Orders ---
const statuses = ['pending', 'confirmed', 'preparing', 'delivered', 'cancelled']
const updateStatus = async (id, status) => {
  await orderStore.updateOrderStatus(id, status)
}

const orderFilters = ref({
  client: '',
  product: '',
  date: '',
  payment: '',
  status: ''
})

const filteredOrders = computed(() => {
  return orderStore.orders.filter(o => {
    const matchClient = !orderFilters.value.client || 
      o.customerInfo.fullName.toLowerCase().includes(orderFilters.value.client.toLowerCase());
    
    const matchProduct = !orderFilters.value.product || 
      o.items.some(item => item.product.name.toLowerCase().includes(orderFilters.value.product.toLowerCase()));
    
    const matchDate = !orderFilters.value.date || 
      new Date(o.date).toLocaleDateString() === new Date(orderFilters.value.date).toLocaleDateString();
    
    const matchPayment = !orderFilters.value.payment || 
      (orderFilters.value.payment === 'preorder' ? o.paymentType === 'preorder' : o.paymentType !== 'preorder');
    
    const matchStatus = !orderFilters.value.status || o.status === orderFilters.value.status;

    return matchClient && matchProduct && matchDate && matchPayment && matchStatus;
  });
})

const deleteOrder = async (id) => {
  if (confirm('Permanently delete this order from the system?')) {
    try {
      await orderStore.cancelOrder(id);
      showNotification('Order deleted successfully.');
    } catch (error) {
      showNotification('Failed to delete order.', 'error');
    }
  }
}

// --- autoSaveStatus (used by Categories) ---
const autoSaveStatus = ref('') // 'saving', 'saved', 'error'
// --- Notifications ---
const notification = ref({ show: false, message: '', type: 'success' })
const showNotification = (msg, type = 'success') => {
  notification.value = { show: true, message: msg, type }
  setTimeout(() => notification.value.show = false, 3000)
}
</script>

<template>
  <div v-if="notification.show" class="notification-toast" :class="notification.type" role="alert">
    {{ notification.message }}
  </div>
  <div class="admin-page container section-spacing">
    <div class="admin-header">
      <div class="admin-brand">
        <img src="@/assets/logo_image/LOGO.png" alt="Logo" class="admin-logo" />
        <h1 class="page-title">Admin Dashboard</h1>
      </div>
      <AccessibleButton label="Exit Admin" variant="secondary" @click="router.push('/')" />
    </div>

    <div class="admin-tabs" role="tablist" aria-label="Admin Navigation">
      <button 
        v-for="tab in tabs" :key="tab"
        :id="`tab-${tab}`"
        role="tab"
        :aria-selected="activeTab === tab"
        :class="['tab-btn', { active: activeTab === tab }]"
        @click="activeTab = tab; if(tab === 'Orders') markOrdersAsSeen()"
        style="position: relative;"
      >
        {{ tab }}
        <span v-if="tab === 'Orders' && newOrdersCount > 0 && activeTab !== 'Orders'" class="order-badge" aria-label="New Orders">{{ newOrdersCount }}</span>
      </button>
    </div>

    <div class="tab-content">
      <!-- DASHBOARD TAB -->
      <div v-if="activeTab === 'Dashboard'" class="dashboard-panel" role="tabpanel" aria-labelledby="tab-Dashboard">
        <div class="stats-grid">
          <div class="stat-card">
            <h3>Total Revenue</h3>
            <p class="stat-value">{{ totalRevenue.toLocaleString() }} RWF</p>
          </div>
          <div class="stat-card">
            <h3>Total Orders</h3>
            <p class="stat-value">{{ orderStore.orders.length }}</p>
          </div>
          <div class="stat-card">
            <h3>Total Customers</h3>
            <p class="stat-value">{{ totalCustomers }}</p>
          </div>
          <div class="stat-card">
            <h3>Sold Out Items</h3>
            <p class="stat-value">{{ soldOutProducts.length }}</p>
          </div>
        </div>

        <div class="dashboard-split">
          <div class="panel">
            <h2>Recent Orders</h2>
            <ul class="simple-list">
              <li v-for="order in recentOrders" :key="order.id">
                Order #{{ order.id }} - {{ order.status }} <br>
                <small>{{ new Date(order.date).toLocaleDateString() }} | {{ order.total.toLocaleString() }} RWF</small>
              </li>
              <li v-if="recentOrders.length === 0">No recent orders</li>
            </ul>
          </div>
          
          <div class="panel">
            <h2>Sold Out Products</h2>
            <ul class="simple-list">
               <li v-for="product in soldOutProducts" :key="product.id" style="display: flex; gap: 1rem; align-items: center; justify-content: space-between;">
                 <div style="display: flex; gap: 1rem; align-items: center; flex: 1;">
                   <img :src="product.images?.length ? product.images[0] : product.image" class="thumb" alt="" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" />
                   <div>
                     <strong>{{ product.name }}</strong> <br>
                     <small>{{ product.category }} - {{ product.subcategory }}</small>
                   </div>
                 </div>
                 <button class="action-btn text-primary" @click="activeTab = 'Products'; editProduct(product)">Restock/Edit</button>
               </li>
               <li v-if="soldOutProducts.length === 0">All products in stock!</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- PRODUCTS TAB -->
      <div v-if="activeTab === 'Products'" role="tabpanel" aria-labelledby="tab-Products">
        <div class="panel-header">
          <div style="display: flex; gap: 1rem; align-items: center;">
            <AccessibleButton label="← Back" variant="secondary" @click="activeTab = 'Dashboard'" />
            <h2 style="margin: 0;">Manage Products</h2>
          </div>
          <AccessibleButton v-if="!showProductForm" label="Add Product" @click="showProductForm = true" />
        </div>

        <div v-if="showProductForm" class="form-card">
          <h3>{{ editingProductId ? 'Edit Product' : 'New Product' }}</h3>
          <form @submit.prevent="saveProduct" class="grid-form">
            <AccessibleInput id="p-name" label="Name" v-model="productForm.name" required />
            <AccessibleInput id="p-price" label="Price (RWF)" type="number" v-model="productForm.price" required />
            
            <div class="input-group">
                <label>Category</label>
                <select v-model="productForm.category" class="custom-select" required>
                    <option v-for="(subs, cat) in productStore.categories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
            </div>

             <div class="input-group">
                <label>Subcategory</label>
                <select v-model="productForm.subcategory" class="custom-select" required>
                    <option v-for="sub in availableSubcategories" :key="sub" :value="sub">{{ sub }}</option>
                </select>
            </div>

            <div class="input-group" style="grid-column: 1 / -1;">
              <label for="p-desc">Product Description</label>
              <textarea id="p-desc" v-model="productForm.description" rows="3" class="custom-select" placeholder="Enter product description here..." required></textarea>
            </div>

            <!-- Image Multiple Upload logic -->
            <div class="input-group" style="grid-column: 1 / -1;">
              <label>Images (URL or File Upload)</label>
              <AccessibleInput id="p-img" label="Add URL (Optional)" v-model="productForm.image" />
              <input type="file" multiple accept="image/*" @change="handleProductImages" style="margin-top: 0.5rem;" />
              
              <!-- Image Previews -->
              <div v-if="productForm.images.length" class="image-previews">
                 <div v-for="(img, idx) in productForm.images" :key="idx" class="preview-item">
                    <img :src="img" alt="Preview" />
                    <button type="button" class="remove-btn" @click="removeImage(idx)">X</button>
                 </div>
              </div>
            </div>

            <AccessibleInput id="p-stock" label="Stock Quantity" type="number" v-model="productForm.stock" required />
            
            <div class="input-group">
              <label>Sizes</label>
              <div class="checkbox-grid">
                <label v-for="s in availableSizes" :key="s" class="checkbox-label" style="font-weight: normal;">
                  <input type="checkbox" :value="s" v-model="productForm.size" /> {{ s }}
                </label>
              </div>
            </div>

            <div class="input-group" style="grid-column: 1 / -1;">
              <label>Colors</label>
              <div class="checkbox-grid">
                <label v-for="c in commonColors" :key="c" class="checkbox-label" style="font-weight: normal; margin-right: 0.5rem;">
                  <input type="checkbox" :value="c" v-model="productForm.color" /> {{ c }}
                </label>
              </div>
              <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem; max-width: 400px;">
                <input v-model="colorSearch" class="custom-select" placeholder="Add custom color..." @keyup.enter="addColor" style="flex: 1;" />
                <button type="button" class="action-btn text-primary" @click="addColor" style="background: var(--color-border); padding: 0 1rem; border-radius: 4px;">Add Custom</button>
              </div>
              <div class="color-tags" v-if="productForm.color.filter(c => !commonColors.includes(c)).length" style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.5rem;">
                <span v-for="c in productForm.color.filter(c => !commonColors.includes(c))" :key="c" style="background: var(--color-border); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.875rem; display: flex; align-items: center; gap: 0.5rem;">
                  {{ c }}
                  <button type="button" @click="removeColor(productForm.color.indexOf(c))" style="background: none; border: none; cursor: pointer; color: var(--color-error); font-weight: bold;">&times;</button>
                </span>
              </div>
            </div>
            
            <label class="checkbox-label" style="grid-column: 1 / -1;">
                <input type="checkbox" v-model="productForm.inStore" /> Is Available In-Store (Uncheck for Pre-order only)
            </label>

            <div class="form-actions" style="grid-column: 1 / -1;">
              <AccessibleButton label="Save Product" type="submit" />
              <AccessibleButton label="Cancel" variant="secondary" @click="resetProductForm" type="button" />
            </div>
          </form>
        </div>

        <div v-if="!showProductForm" class="product-explorer" style="margin-top: 2rem;">
          <!-- Level 1: Categories -->
          <div v-if="!selectedCategoryView">
            <h3 style="margin-bottom: 1rem;">Categories</h3>
            <div class="explorer-grid">
              <div v-for="(subs, cat) in productExplorerData" :key="cat" class="explorer-card" @click="selectedCategoryView = cat; selectedSubcategoryView = null">
                <h4>{{ cat }}</h4>
                <p>{{ Object.keys(subs).length }} Subcategories</p>
                <p style="font-size: 0.8rem; color: var(--color-primary); margin-top: 0.5rem;">
                  {{ Object.values(subs).reduce((acc, prods) => acc + prods.length, 0) }} Total Products
                </p>
              </div>
            </div>
            <div v-if="Object.keys(productExplorerData).length === 0" style="padding: 1rem; color: #666;">
              No categories found. Start by adding some!
            </div>
          </div>

          <!-- Level 2: Subcategories -->
          <div v-else-if="!selectedSubcategoryView">
            <div class="explorer-header" style="display: flex; gap: 1rem; align-items: center; margin-bottom: 1.5rem; background: var(--color-bg); padding: 0.75rem; border-radius: 6px;">
              <AccessibleButton label="← Back to Categories" variant="secondary" @click="selectedCategoryView = null" />
              <h3 style="margin: 0;">{{ selectedCategoryView }} > Subcategories</h3>
            </div>
            <div class="explorer-grid">
              <div v-for="(prods, sub) in productExplorerData[selectedCategoryView]" :key="sub" class="explorer-card" @click="selectedSubcategoryView = sub">
                <h4>{{ sub }}</h4>
                <p>{{ prods.length }} Products</p>
              </div>
            </div>
            <div v-if="Object.keys(productExplorerData[selectedCategoryView] || {}).length === 0" style="padding: 1rem; color: #666;">
              No subcategories found in this category.
            </div>
          </div>

          <!-- Level 3: Products -->
          <div v-else>
            <div class="explorer-header" style="display: flex; gap: 1rem; align-items: center; margin-bottom: 1.5rem; background: var(--color-bg); padding: 0.75rem; border-radius: 6px;">
              <AccessibleButton label="← Back to Subcategories" variant="secondary" @click="selectedSubcategoryView = null" />
              <h3 style="margin: 0; font-size: 1.1rem;">{{ selectedCategoryView }} > {{ selectedSubcategoryView }} > Products</h3>
            </div>
            <div class="table-responsive">
              <table class="data-table">
                <caption class="sr-only">Products in {{ selectedCategoryView }} > {{ selectedSubcategoryView }}</caption>
                <thead>
                  <tr>
                    <th>Image</th><th>Name</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="p in productExplorerData[selectedCategoryView]?.[selectedSubcategoryView] || []" :key="p.id">
                    <td><img :src="p.images?.length ? p.images[0] : p.image" class="thumb" alt=""/></td>
                    <td>{{ p.name }}</td>
                    <td>{{ p.price.toLocaleString() }}</td>
                    <td>{{ p.stock }}</td>
                    <td>
                      <span v-if="p.stock > 0 && p.inStore" class="stock-badge in-stock">In-Stock</span>
                      <span v-else-if="p.stock > 0 && !p.inStore" class="stock-badge pre-order">Pre-order</span>
                      <span v-else class="stock-badge out-of-stock">Out of Stock (Pre-order)</span>
                    </td>
                    <td class="action-cells">
                      <button class="action-btn text-primary" @click="editProduct(p)">Edit</button>
                      <button class="action-btn text-error" @click="deleteProduct(p.id)">Delete</button>
                    </td>
                  </tr>
                  <tr v-if="(productExplorerData[selectedCategoryView]?.[selectedSubcategoryView] || []).length === 0">
                    <td colspan="6" style="text-align: center; padding: 2rem; color: #666;">No products found in this subcategory.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'Categories'" role="tabpanel" aria-labelledby="tab-Categories">
        <div class="panel-header" style="justify-content: space-between; gap: 1rem;">
          <div style="display: flex; gap: 1rem; align-items: center;">
            <AccessibleButton label="← Back" variant="secondary" @click="activeTab = 'Dashboard'" />
            <h2 style="margin: 0;">Manage Categories</h2>
          </div>
          <div v-if="autoSaveStatus" :class="['autosave-bar', autoSaveStatus]">
            <span v-if="autoSaveStatus === 'saving'" class="spinner"></span>
            {{ autoSaveStatus === 'saving' ? 'Saving changes...' : (autoSaveStatus === 'saved' ? 'Saved automatically' : 'Save failed') }}
          </div>
        </div>

        <div class="dashboard-split" style="margin-top: 1.5rem;">
            <div class="panel">
                <h3>Add New Parent Category</h3>
                <form @submit.prevent="addCategory" style="margin-top: 1rem;">
                    <AccessibleInput id="new-cat" label="Category Name" v-model="newCatName" required />
                    <AccessibleButton type="submit" label="Add Category" />
                </form>
            </div>
            <div class="panel">
                <h3>Add New Subcategory</h3>
                <form @submit.prevent="addSubcategory" style="margin-top: 1rem;">
                    <div class="input-group">
                        <label>Parent Category</label>
                        <select v-model="selectedParentForSub" class="custom-select" required>
                            <option value="">Select Parent...</option>
                            <option v-for="(subs, cat) in productStore.categories" :key="cat" :value="cat">{{ cat }}</option>
                        </select>
                    </div>
                    <AccessibleInput id="new-subcat" label="Subcategory Name" v-model="newSubName" required />
                    <AccessibleButton type="submit" label="Add Subcategory" :disabled="!selectedParentForSub" />
                </form>
            </div>
        </div>

        <div class="panel" style="margin-top: 2rem;">
            <h3>Current Data</h3>
            <ul class="simple-list" style="margin-top: 1rem;">
                <li v-for="(subs, cat) in productStore.categories" :key="cat" style="display: flex; flex-direction: column; gap: 0.5rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; background: #f0f0f0; padding: 0.5rem; border-radius: 4px;">
                        <strong>{{ cat }}</strong>
                        <button class="action-btn text-error" @click="deleteCategory(cat)">Delete Category</button>
                    </div>
                    <ul style="padding-left: 2rem; list-style: circle;">
                        <li v-for="sub in subs" :key="sub" style="display: flex; justify-content: space-between; align-items: center; border-bottom: none; padding: 0.25rem 0;">
                            <span>{{ sub }}</span>
                            <button class="action-btn text-error" style="font-size: 0.8rem;" @click="deleteSubcategory(cat, sub)">Remove</button>
                        </li>
                        <li v-if="subs.length === 0" style="color: #666; font-size: 0.875rem;">No subcategories</li>
                    </ul>
                </li>
            </ul>
        </div>
      </div>

      <!-- NEW ARRIVALS TAB -->
      <div v-if="activeTab === 'New Arrivals'" role="tabpanel" aria-labelledby="tab-New Arrivals">
        <div class="panel-header">
          <div style="display: flex; gap: 1rem; align-items: center;">
            <AccessibleButton label="← Back" variant="secondary" @click="activeTab = 'Dashboard'" />
            <h2 style="margin: 0;">New Arrivals Marketing</h2>
          </div>
          <AccessibleButton v-if="!showArrivalForm" label="Add New Arrival" @click="showArrivalForm = true" />
        </div>

        <div v-if="showArrivalForm" class="form-card">
          <h3>{{ editingArrivalId ? 'Edit Arrival' : 'New Arrival' }}</h3>
          <form @submit.prevent="saveArrival" class="grid-form">
            <AccessibleInput id="na-name" label="Product Name" v-model="arrivalForm.name" required />
            <AccessibleInput id="na-url" label="Image URL (Or Upload Below)" v-model="arrivalForm.image" />
            
            <div class="input-group">
               <label>Upload Image</label>
               <input type="file" accept="image/*" @change="handleArrivalImage" />
               <img v-if="arrivalForm.image" :src="arrivalForm.image" style="height: 60px; margin-top: 10px; object-fit: cover; border-radius: 4px;" />
            </div>

            <div class="input-group">
                <label>Category</label>
                <select v-model="arrivalForm.category" class="custom-select" required>
                    <option v-for="(subs, cat) in productStore.categories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
            </div>

             <div class="input-group">
                <label>Subcategory</label>
                <select v-model="arrivalForm.subcategory" class="custom-select" required>
                    <option v-for="sub in availableArrivalSubcats" :key="sub" :value="sub">{{ sub }}</option>
                </select>
            </div>

            <div class="form-actions" style="grid-column: 1 / -1;">
              <AccessibleButton :label="editingArrivalId ? 'Update Arrival' : 'Save'" type="submit" />
              <AccessibleButton label="Cancel" variant="secondary" @click="resetArrivalForm" type="button" />
            </div>
          </form>
        </div>

        <ul class="simple-list" style="background: white; padding: 1rem; border-radius: 8px;">
            <li v-for="arr in productStore.newArrivals" :key="arr.id" style="display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; gap: 1rem; align-items: center;">
                    <img v-if="arr.image" :src="arr.image" class="thumb" />
                    <div>
                        <strong>{{ arr.name }}</strong> <br/>
                        <small>{{ arr.category }} > {{ arr.subcategory }}</small>
                    </div>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                  <button class="action-btn text-primary" @click="editArrival(arr)">Edit</button>
                  <button class="action-btn text-error" @click="deleteArrival(arr.id)">Delete</button>
                </div>
            </li>
            <li v-if="productStore.newArrivals.length === 0">No direct new arrivals specified.</li>
        </ul>
      </div>

      <!-- ORDERS TAB -->
      <div v-if="activeTab === 'Orders'" role="tabpanel" aria-labelledby="tab-Orders">
        <div class="panel-header" style="justify-content: flex-start; gap: 1rem;">
          <AccessibleButton label="← Back" variant="secondary" @click="activeTab = 'Dashboard'" />
          <h2 style="margin: 0;">Manage Orders</h2>
        </div>

        <!-- Order Filters -->
        <div class="filters-panel" style="background: #f9f9f9; padding: 1rem; border-radius: 8px; margin-bottom: 2rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
          <input type="text" v-model="orderFilters.client" placeholder="Filter by Client Name" class="custom-select" />
          <input type="text" v-model="orderFilters.product" placeholder="Filter by Product Name" class="custom-select" />
          <input type="date" v-model="orderFilters.date" class="custom-select" />
          <select v-model="orderFilters.payment" class="custom-select">
            <option value="">All Payments</option>
            <option value="full">Paid Full</option>
            <option value="preorder">Paid Half (Pre-order)</option>
          </select>
          <select v-model="orderFilters.status" class="custom-select">
            <option value="">All Statuses</option>
            <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <caption class="sr-only">Recent Orders Detail Table</caption>
            <thead>
              <tr>
                <th>ID</th><th>Date</th><th>Customer</th><th>Items</th><th>Total (Payment)</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="o in filteredOrders" :key="o.id">
                <td>{{ o.id }}</td>
                <td>{{ new Date(o.date).toLocaleDateString() }}</td>
                <td>{{ o.customerInfo.fullName }}<br/><small>{{ o.customerInfo.whatsappPhone }}</small></td>
                <td>
                  <div style="display: flex; flex-direction: column; gap: 0.5rem; max-width: 250px;">
                    <div v-for="(item, idx) in o.items" :key="idx" style="display: flex; gap: 0.5rem; align-items: center;">
                      <img :src="item.product.images?.length ? item.product.images[0] : item.product.image" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;" alt=""/>
                      <div style="font-size: 0.8rem; line-height: 1.2;">
                        <strong>{{ item.product.name }}</strong><br/>
                        Qty: {{ item.quantity }}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  {{ o.total.toLocaleString() }} RWF <br/>
                  <small style="color: #666; font-weight: 600;">
                    {{ o.paymentType === 'preorder' ? `Paid Half (${o.depositPaid.toLocaleString()})` : 'Paid Full' }}
                  </small>
                </td>
                <td>
                  <select :value="o.status" @change="updateStatus(o.id, $event.target.value)" class="status-select">
                    <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
                  </select>
                </td>
                <td>
                  <button class="action-btn text-error" @click="deleteOrder(o.id)">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>



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
.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.admin-brand {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.admin-logo {
  height: 40px;
  width: auto;
  object-fit: contain;
}

.page-title {
  margin: 0;
}

.admin-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--color-border);
  overflow-x: auto;
}

.tab-btn {
  background: none;
  border: none;
  padding: 1rem 1.5rem;
  font-weight: 600;
  color: var(--color-text);
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
  white-space: nowrap;
}

.tab-btn:hover {
  color: var(--color-primary);
}

.tab-btn.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.stat-card h3 {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
}

.dashboard-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

@media (max-width: 768px) {
  .dashboard-split {
    grid-template-columns: 1fr;
  }
}

.panel {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--color-border);
}

.panel h2, .panel-header h2 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.simple-list {
  list-style: none;
  padding: 0;
}

.simple-list li {
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--color-border);
}

.simple-list li:last-child {
  border-bottom: none;
}

.form-card {
  background: #f9f9f9;
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  border: 1px solid var(--color-border);
}

.grid-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 768px) {
  .grid-form {
    grid-template-columns: 1fr;
  }
}

.input-group {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin-bottom: 1rem;
}

.input-group label {
    font-weight: 600;
}

.custom-select {
    padding: 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    font-size: 1rem;
    background-color: white;
    font-family: inherit;
}

.checkbox-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: white;
  min-height: 50px;
}

.image-previews {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
    flex-wrap: wrap;
}

.preview-item {
    position: relative;
    width: 80px;
    height: 80px;
}

.preview-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 4px;
    border: 1px solid var(--color-border);
}

.remove-btn {
    position: absolute;
    top: -5px;
    right: -5px;
    background: var(--color-error);
    color: white;
    border: none;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    font-size: 10px;
    cursor: pointer;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  cursor: pointer;
}

.table-responsive {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.data-table th, .data-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}

.data-table th {
  background: #f9f9f9;
  font-weight: 600;
}

.thumb {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
}

.action-cells {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: none;
  border: none;
  font-weight: 600;
  cursor: pointer;
  padding: 0.25rem;
}

.text-primary { color: var(--color-primary); }
.text-error { color: var(--color-error); }

.stock-badge {
  display: inline-block;
  padding: 0.2rem 0.55rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
}
.stock-badge.in-stock { background: #d1fae5; color: #065f46; }
.stock-badge.pre-order { background: #ede9fe; color: #5b21b6; }
.stock-badge.out-of-stock { background: #fee2e2; color: #991b1b; }


.status-select {
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid var(--color-border);
}

.explorer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.explorer-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.explorer-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 15px rgba(0,0,0,0.1);
  border-color: var(--color-primary);
}

.explorer-card h4 {
  margin: 0 0 0.5rem 0;
  color: var(--color-text);
  font-size: 1.1rem;
}

.explorer-card p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}
.autosave-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  background: white;
  border: 1px solid var(--color-border);
  transition: all 0.3s ease;
}
.autosave-bar.saving { color: #2563eb; border-color: #bfdbfe; font-weight: 500; }
.autosave-bar.saved { color: #059669; border-color: #a7f3d0; font-weight: 500; }
.autosave-bar.error { color: #dc2626; border-color: #fecaca; font-weight: 500; }

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(37, 99, 235, 0.2);
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.order-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background: #ef4444;
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  min-width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
  line-height: 1;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}
</style>
