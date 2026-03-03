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
const tabs = ['Dashboard', 'Products', 'Categories', 'New Arrivals', 'Orders', 'Hero Content']

onMounted(async () => {
  await Promise.all([
    orderStore.fetchOrders(),
    productStore.fetchProducts(),
    productStore.fetchHero(),
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
  // If images array has items, make the first one the main `image` for compatibility, while preserving `images`.
  const payload = {
    ...productForm.value,
    size: [...productForm.value.size],
    color: [...productForm.value.color],
    price: Number(productForm.value.price),
    stock: Number(productForm.value.stock),
    image: productForm.value.images.length ? productForm.value.images[0] : productForm.value.image
  }
  
  if (editingProductId.value) await productStore.updateProduct(editingProductId.value, payload)
  else await productStore.addProduct(payload)
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
  const current = { ...productStore.categories }
  if(!current[newCatName.value]) {
    current[newCatName.value] = []
    await productStore.updateCategories(current)
    newCatName.value = ''
  } else {
    alert("Category already exists!")
  }
}

const addSubcategory = async () => {
  if (!selectedParentForSub.value || !newSubName.value) return
  const current = { ...productStore.categories }
  if (!current[selectedParentForSub.value].includes(newSubName.value)) {
    current[selectedParentForSub.value].push(newSubName.value)
    await productStore.updateCategories(current)
    newSubName.value = ''
  } else {
    alert("Subcategory already exists!")
  }
}

const deleteCategory = async (cat) => {
  if (confirm(`Delete the entire category "${cat}" and all its subcategories?`)) {
    const current = { ...productStore.categories }
    delete current[cat]
    await productStore.updateCategories(current)
  }
}

const deleteSubcategory = async (cat, sub) => {
  if (confirm(`Delete the subcategory "${sub}" from "${cat}"?`)) {
    const current = { ...productStore.categories }
    current[cat] = current[cat].filter(s => s !== sub)
    await productStore.updateCategories(current)
  }
}

// --- New Arrivals ---
const showArrivalForm = ref(false)
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

const saveArrival = async () => {
  await productStore.addNewArrival({ ...arrivalForm.value })
  showArrivalForm.value = false
  arrivalForm.value = { name: '', category: '', subcategory: '', image: '' }
}

const deleteArrival = async (id) => {
  await productStore.deleteNewArrival(id)
}

// --- Orders ---
const statuses = ['pending', 'confirmed', 'preparing', 'delivered']
const updateStatus = async (id, status) => {
  await orderStore.updateOrderStatus(id, status)
}

// --- Hero Content ---
const heroForm = ref({ title: '', subtitle: '', ctaText: '', ctaLink: '', image: '', isVideo: false })
const initHero = () => { heroForm.value = { ...productStore.heroContent } }
const handleHeroMedia = async (e) => {
  const file = e.target.files[0]
  if (file) {
    heroForm.value.image = await fileToBase64(file)
    heroForm.value.isVideo = file.type.startsWith('video/')
  }
}
const saveHero = async () => {
  await productStore.updateHero(heroForm.value)
  alert('Hero updated')
}
</script>

<template>
  <div class="admin-page container section-spacing">
    <div class="admin-header">
      <h1 class="page-title">Admin Dashboard</h1>
      <AccessibleButton label="Exit Admin" variant="secondary" @click="router.push('/')" />
    </div>

    <div class="admin-tabs" role="tablist">
      <button 
        v-for="tab in tabs" :key="tab"
        role="tab"
        :aria-selected="activeTab === tab"
        :class="['tab-btn', { active: activeTab === tab }]"
        @click="activeTab = tab; if(tab === 'Hero Content') initHero()"
      >
        {{ tab }}
      </button>
    </div>

    <div class="tab-content">
      <!-- DASHBOARD TAB -->
      <div v-if="activeTab === 'Dashboard'" class="dashboard-panel">
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
               <li v-for="product in soldOutProducts" :key="product.id">
                 {{ product.name }} <small>(ID: {{ product.id }})</small>
               </li>
               <li v-if="soldOutProducts.length === 0">All products in stock!</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- PRODUCTS TAB -->
      <div v-if="activeTab === 'Products'">
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
              <select multiple v-model="productForm.size" class="custom-select" style="min-height: 100px;">
                <option v-for="s in availableSizes" :key="s" :value="s">{{ s }}</option>
              </select>
              <small style="color: #666; font-size: 0.8rem;">Hold Ctrl (or Cmd on Mac) to select multiple</small>
            </div>

            <div class="input-group">
              <label>Colors</label>
              <div style="display: flex; gap: 0.5rem; align-items: stretch;">
                <input 
                  list="common-colors" 
                  v-model="colorSearch" 
                  class="custom-select" 
                  placeholder="Search or type a color..."
                  @keyup.enter="addColor"
                  style="flex: 1;"
                />
                <datalist id="common-colors">
                  <option v-for="c in commonColors" :key="c" :value="c" />
                </datalist>
                <button type="button" class="action-btn text-primary" @click="addColor" style="background: var(--color-bg); padding: 0 1rem; border-radius: 4px;">Add</button>
              </div>
              <div class="color-tags" v-if="productForm.color.length" style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.5rem;">
                <span v-for="(c, idx) in productForm.color" :key="idx" style="background: var(--color-border); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.875rem; display: flex; align-items: center; gap: 0.5rem;">
                  {{ c }}
                  <button type="button" @click="removeColor(idx)" aria-label="Remove color" title="Remove color" style="background: none; border: none; cursor: pointer; color: var(--color-error); font-weight: bold;">&times;</button>
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

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in productStore.products" :key="p.id">
                <td>{{ p.id }}</td>
                <td><img :src="p.images?.length ? p.images[0] : p.image" class="thumb" alt=""/></td>
                <td>{{ p.name }}</td>
                <td>{{ p.category }} - {{ p.subcategory }}</td>
                <td>{{ p.price.toLocaleString() }}</td>
                <td>{{ p.stock }}</td>
                <td class="action-cells">
                  <button class="action-btn text-primary" @click="editProduct(p)">Edit</button>
                  <button class="action-btn text-error" @click="deleteProduct(p.id)">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

       <!-- CATEGORIES TAB -->
      <div v-if="activeTab === 'Categories'">
        <div class="panel-header" style="justify-content: flex-start; gap: 1rem;">
          <AccessibleButton label="← Back" variant="secondary" @click="activeTab = 'Dashboard'" />
          <h2 style="margin: 0;">Manage Categories</h2>
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
      <div v-if="activeTab === 'New Arrivals'">
        <div class="panel-header">
          <div style="display: flex; gap: 1rem; align-items: center;">
            <AccessibleButton label="← Back" variant="secondary" @click="activeTab = 'Dashboard'" />
            <h2 style="margin: 0;">New Arrivals Marketing</h2>
          </div>
          <AccessibleButton v-if="!showArrivalForm" label="Add New Arrival" @click="showArrivalForm = true" />
        </div>

        <div v-if="showArrivalForm" class="form-card">
          <form @submit.prevent="saveArrival" class="grid-form">
            <AccessibleInput id="na-name" label="Product Name" v-model="arrivalForm.name" required />
            <AccessibleInput id="na-url" label="Image URL (Or Upload Below)" v-model="arrivalForm.image" />
            
            <div class="input-group">
               <label>Upload Image</label>
               <input type="file" accept="image/*" @change="handleArrivalImage" />
               <img v-if="arrivalForm.image && arrivalForm.image.startsWith('data:')" :src="arrivalForm.image" style="height: 60px; margin-top: 10px;" />
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
              <AccessibleButton label="Save" type="submit" />
              <AccessibleButton label="Cancel" variant="secondary" @click="showArrivalForm = false" type="button" />
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
                <button class="action-btn text-error" @click="deleteArrival(arr.id)">Delete</button>
            </li>
            <li v-if="productStore.newArrivals.length === 0">No direct new arrivals specified.</li>
        </ul>
      </div>

      <!-- ORDERS TAB -->
      <div v-if="activeTab === 'Orders'">
        <div class="panel-header" style="justify-content: flex-start; gap: 1rem;">
          <AccessibleButton label="← Back" variant="secondary" @click="activeTab = 'Dashboard'" />
          <h2 style="margin: 0;">Manage Orders</h2>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th><th>Date</th><th>Customer</th><th>Total</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="o in orderStore.orders" :key="o.id">
                <td>{{ o.id }}</td>
                <td>{{ new Date(o.date).toLocaleDateString() }}</td>
                <td>{{ o.customerInfo.fullName }}<br/><small>{{ o.customerInfo.whatsappPhone }}</small></td>
                <td>{{ o.total.toLocaleString() }}</td>
                <td>
                  <select :value="o.status" @change="updateStatus(o.id, $event.target.value)" class="status-select">
                    <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- HERO CONTENT TAB -->
      <div v-if="activeTab === 'Hero Content'" class="form-card">
        <div class="panel-header" style="justify-content: flex-start; gap: 1rem;">
          <AccessibleButton label="← Back" variant="secondary" @click="activeTab = 'Dashboard'" />
          <h2 style="margin: 0;">Edit Homepage Hero Content</h2>
        </div>
        <form @submit.prevent="saveHero" class="grid-form">
          <AccessibleInput id="h-title" label="Headline" v-model="heroForm.title" style="grid-column: 1 / -1;" required />
          <AccessibleInput id="h-sub" label="Tagline / Subtitle" v-model="heroForm.subtitle" style="grid-column: 1 / -1;" required />
          <AccessibleInput id="h-ctaText" label="Button Label" v-model="heroForm.ctaText" required />
          <AccessibleInput id="h-link" label="Button URL" v-model="heroForm.ctaLink" required />
          
          <div class="input-group" style="grid-column: 1 / -1;">
             <label>Background Media (URL or Local Upload)</label>
             <AccessibleInput id="h-img" label="Media URL" v-model="heroForm.image" />
             <input type="file" accept="image/*,video/*" @change="handleHeroMedia" style="margin-top: 0.5rem;" />
             
             <label class="checkbox-label" style="margin-top: 1rem;">
                 <input type="checkbox" v-model="heroForm.isVideo" /> Is this media a Video?
             </label>

             <div v-if="heroForm.image" style="margin-top: 1rem;">
                 <video v-if="heroForm.isVideo" :src="heroForm.image" controls style="max-height: 200px; display: block;"></video>
                 <img v-else :src="heroForm.image" alt="Hero Preview" style="max-height: 200px; display: block;" />
             </div>
          </div>
          
          <AccessibleButton label="Update Content" type="submit" style="grid-column: 1 / -1;" />
        </form>
      </div>

    </div>
  </div>
</template>

<style scoped>
.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
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

.status-select {
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid var(--color-border);
}
</style>
