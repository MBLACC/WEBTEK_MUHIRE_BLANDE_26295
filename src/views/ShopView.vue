<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/stores/useProductStore'
import { useCartStore } from '@/stores/useCartStore'
import { RouterLink } from 'vue-router'
import AccessibleInput from '@/components/AccessibleInput.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const productStore = useProductStore()
const cartStore = useCartStore()
const route = useRoute()
const router = useRouter()

const searchQuery = ref('')
const selectedCategory = ref(route.query.category || 'All')
const selectedSubcategory = ref(route.query.subcategory || 'All')
const inStoreOnly = ref(route.query.inStore === 'true')
const isLoading = ref(true)

const categories = computed(() => ['All', ...Object.keys(productStore.categories)])

const subcategoriesMap = computed(() => {
  const map = { All: [] }
  for (const cat in productStore.categories) {
    map[cat] = productStore.categories[cat] || []
  }
  return map
})

onMounted(async () => {
  try {
    const promises = []
    if (productStore.products.length === 0) promises.push(productStore.fetchProducts())
    if (Object.keys(productStore.categories).length === 0) promises.push(productStore.fetchCategories())
    
    await Promise.all(promises)
  } catch (err) {
    console.error('Failed to load shop data', err)
  } finally {
    isLoading.value = false
  }
})

const filteredProducts = computed(() => {
  return productStore.products.filter(p => {
    // Removed stock <= 0 check — out-of-stock items show as pre-order (issue 5 & 6)
    if (inStoreOnly.value && !p.inStore) return false
    if (selectedCategory.value !== 'All' && p.category !== selectedCategory.value) return false
    if (selectedSubcategory.value !== 'All' && p.subcategory !== selectedSubcategory.value) return false
    if (searchQuery.value && !p.name.toLowerCase().includes(searchQuery.value.toLowerCase())) return false
    return true
  })
})

const updateRoute = () => {
  const query = {}
  if (selectedCategory.value !== 'All') query.category = selectedCategory.value
  if (selectedSubcategory.value !== 'All') query.subcategory = selectedSubcategory.value
  if (inStoreOnly.value) query.inStore = 'true'
  router.push({ query })
}

const selectCategory = (cat) => {
  selectedCategory.value = cat
  selectedSubcategory.value = 'All'
  updateRoute()
}

const selectSubcategory = (subcat) => {
  selectedSubcategory.value = subcat
  updateRoute()
}

const toggleInStore = () => {
  inStoreOnly.value = !inStoreOnly.value
  updateRoute()
}
</script>

<template>
  <div class="shop-page container section-spacing">
    <h1 class="page-title">Shop</h1>

    <div class="shop-layout">
      <!-- Sidebar Filters -->
      <aside class="filters" aria-label="Shop Filters">
        <div class="search-wrap">
          <AccessibleInput id="search" label="Search Products" v-model="searchQuery" placeholder="Search..." type="search" />
        </div>

        <div class="filter-group">
          <h2 id="cat-title">Categories</h2>
          <div role="tablist" aria-labelledby="cat-title" class="category-tabs">
            <button
              v-for="cat in categories"
              :key="cat"
              role="tab"
              :aria-selected="selectedCategory === cat"
              :class="['filter-btn', { active: selectedCategory === cat }]"
              @click="selectCategory(cat)"
            >
              {{ cat }}
            </button>
          </div>
        </div>

        <div class="filter-group" v-if="selectedCategory !== 'All' && subcategoriesMap[selectedCategory] && subcategoriesMap[selectedCategory].length > 0">
          <h2 id="subcat-title">Subcategories</h2>
          <div role="tablist" aria-labelledby="subcat-title" class="category-tabs">
            <button
              role="tab"
              :aria-selected="selectedSubcategory === 'All'"
              :class="['filter-btn', { active: selectedSubcategory === 'All' }]"
              @click="selectSubcategory('All')"
            >
              All {{ selectedCategory }}
            </button>
            <button
              v-for="subcat in subcategoriesMap[selectedCategory]"
              :key="subcat"
              role="tab"
              :aria-selected="selectedSubcategory === subcat"
              :class="['filter-btn', { active: selectedSubcategory === subcat }]"
              @click="selectSubcategory(subcat)"
            >
              {{ subcat }}
            </button>
          </div>
        </div>

        <div class="filter-group in-store-toggle">
          <label class="toggle-container">
            <input type="checkbox" :checked="inStoreOnly" @change="toggleInStore" class="sr-only" />
            <div class="toggle-switch" :class="{ 'is-checked': inStoreOnly }" aria-hidden="true"></div>
            <span>In-Store items only</span>
          </label>
        </div>
      </aside>

      <!-- Product Grid -->
      <main class="products-area" aria-label="Products">
        <p class="results-count" role="status" aria-live="polite">
          Showing {{ filteredProducts.length }} results
        </p>

        <LoadingSpinner v-if="isLoading" message="Fetching products..." />

        <div v-else-if="filteredProducts.length === 0" class="empty-state">
          No products matched your filters.
        </div>

        <div v-else class="product-grid">
          <article 
            v-for="product in filteredProducts" 
            :key="product.id" 
            class="product-card"
          >
            <RouterLink :to="`/product/${product.id}`" class="product-card-link" :aria-label="`View details for ${product.name}`">
              <div class="img-wrapper">
                <img :src="product.images?.length ? product.images[0] : product.image" :alt="product.name" loading="lazy" />
                <span v-if="product.stock <= 0" class="preorder-overlay-badge">Pre-order</span>
              </div>
              <div class="product-info">
                <h3>{{ product.name }}</h3>
                <p class="price">{{ product.price.toLocaleString() }} RWF</p>
                <span v-if="!product.inStore && product.stock > 0" class="badge">Pre-order</span>
                <span v-if="product.stock <= 0" class="preorder-badge">Available for Pre-order</span>
              </div>
            </RouterLink>
            <div class="card-actions">
              <RouterLink :to="`/product/${product.id}`" class="view-btn">View Details</RouterLink>
            </div>
          </article>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.page-title {
  margin-bottom: 2rem;
  text-align: center;
}

.shop-layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 2rem;
}

@media (max-width: 768px) {
  .shop-layout {
    grid-template-columns: 1fr;
  }
}

.filter-group {
  margin-bottom: 2rem;
}

.filter-group h2 {
  font-size: 1.125rem;
  margin-bottom: 1rem;
}

.category-tabs {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-btn {
  background: none;
  border: none;
  text-align: left;
  padding: 0.5rem;
  border-radius: 4px;
  color: var(--color-text);
  font-weight: 500;
  transition: background 0.2s, color 0.2s;
  cursor: pointer;
}

.filter-btn:hover {
  background: var(--color-border);
}

.filter-btn.active {
  background: var(--color-primary);
  color: white;
}

.toggle-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-weight: 500;
}

.toggle-switch {
  width: 44px;
  height: 24px;
  background: var(--color-border);
  border-radius: 999px;
  position: relative;
  transition: background 0.3s;
}

.toggle-switch::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: transform 0.3s;
}

.toggle-switch.is-checked {
  background: var(--color-primary);
}

.toggle-switch.is-checked::after {
  transform: translateX(20px);
}

.results-count {
  margin-bottom: 1rem;
  color: #666;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
}

.product-card {
  color: var(--color-text);
  text-decoration: none;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  background: white;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  position: relative;
  display: flex;
  flex-direction: column;
}

.product-card-link {
  text-decoration: none;
  color: inherit;
  display: block;
  flex: 1;
}

.product-card:hover, .product-card:focus-within {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px rgba(0,0,0,0.1);
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: #f9f9f9;
  border-radius: 8px;
  color: #666;
}

.img-wrapper {
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: #f0f0f0;
  position: relative;
}

.preorder-overlay-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: var(--color-primary);
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  letter-spacing: 0.5px;
  z-index: 1;
}

.img-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.5s ease;
}

.product-card:hover .img-wrapper img,
.product-card:focus-within .img-wrapper img {
  transform: scale(1.05);
}

.product-info {
  padding: 1rem;
  text-align: center;
}

.product-info h3 {
  font-size: 1rem;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.price {
  font-weight: 700;
  color: var(--color-primary);
}

.badge {
  display: inline-block;
  background: var(--color-primary-light);
  color: white;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  border-radius: 4px;
  margin-top: 0.5rem;
}

.preorder-badge {
  display: inline-block;
  background: #7c3aed;
  color: white;
  padding: 0.25rem 0.6rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 4px;
  margin-top: 0.5rem;
}

.card-actions {
  padding: 0 1rem 1rem;
  display: flex;
  gap: 0.5rem;
}

.view-btn {
  flex: 1;
  text-align: center;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.6rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: opacity 0.2s;
}

.view-btn:hover {
  opacity: 0.85;
}
</style>
