<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/stores/useProductStore'
import { useCartStore } from '@/stores/useCartStore'
import AccessibleButton from '@/components/AccessibleButton.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const cartStore = useCartStore()

const product = ref(null)
const selectedSize = ref('')
const selectedColor = ref('')
const quantity = ref(1)
const activeImageIndex = ref(0)

const loadProduct = async () => {
  if (productStore.products.length === 0) {
    await productStore.fetchProducts()
  }
  product.value = productStore.getProductById(route.params.id)
  
  if (product.value) {
    selectedSize.value = product.value.size?.length ? product.value.size[0] : ''
    selectedColor.value = product.value.color?.length ? product.value.color[0] : ''
    quantity.value = 1
    activeImageIndex.value = 0
  }
}

onMounted(loadProduct)

watch(() => route.params.id, (newId) => {
  if (newId) loadProduct()
})

const isOutOfStock = computed(() => !product.value || product.value.stock <= 0)

const notification = ref({ show: false, message: '', type: 'success' })
const showNotification = (msg, type = 'success') => {
  notification.value = { show: true, message: msg, type }
  setTimeout(() => notification.value.show = false, 3000)
}

const addToCart = (isPreorder = false) => {
  if (!product.value) return
  const s = selectedSize.value || (product.value.size?.length ? null : 'N/A')
  const c = selectedColor.value || (product.value.color?.length ? null : 'N/A')

  cartStore.addToCart(product.value, s, c, quantity.value)
  if (isPreorder || isOutOfStock.value) {
    showNotification('Added to cart as Pre-order (50% deposit required at checkout)')
  } else {
    showNotification('Product added to cart successfully!')
  }
}

// Related Products
const suggestedProducts = computed(() => {
  if (!product.value) return []
  return productStore.products
    .filter(p => p.category === product.value.category && p.id !== product.value.id)
    .sort(() => 0.5 - Math.random()) // Randomize
    .slice(0, 4) // Show 4 items max
})
</script>

<template>
  <div v-if="notification.show" class="notification-toast" :class="notification.type" role="alert">
    {{ notification.message }}
  </div>
  <div v-if="product" class="container section-spacing product-detail">
    <div class="product-gallery">
      <div class="main-image">
        <img :src="product.images?.length ? product.images[activeImageIndex] : product.image" :alt="product.name" />
      </div>
      <div class="thumbnail-list" v-if="product.images && product.images.length > 1">
         <button 
           v-for="(img, idx) in product.images" 
           :key="idx" 
           class="thumb-btn"
           :class="{ active: activeImageIndex === idx }"
           @click="activeImageIndex = idx"
           :aria-label="`View image ${idx + 1}`"
         >
           <img :src="img" alt="Thumbnail" />
         </button>
      </div>
    </div>
    
    <div class="product-info">
      <nav aria-label="Breadcrumb" class="breadcrumb">
        <RouterLink to="/shop">Shop</RouterLink> > 
        <RouterLink :to="`/shop?category=${product.category}`">{{ product.category }}</RouterLink> > 
        <span aria-current="page">{{ product.name }}</span>
      </nav>

      <h1 class="title">{{ product.name }}</h1>
      <p class="price">{{ product.price.toLocaleString() }} RWF</p>
      
      <div v-if="!product.inStore" class="preorder-badge">Available for Pre-order (50% Deposit)</div>
      
      <p class="description">{{ product.description }}</p>

      <div class="options">
        <!-- Size Selector -->
        <fieldset v-if="product.size && product.size.length" class="option-group">
          <legend>Size</legend>
          <div class="option-list">
            <label v-for="size in product.size" :key="size" class="option-label">
              <input type="radio" :value="size" v-model="selectedSize" class="sr-only" />
              <div class="option-box" :class="{ 'is-selected': selectedSize === size }" aria-hidden="true">{{ size }}</div>
            </label>
          </div>
        </fieldset>

        <!-- Color Selector -->
        <fieldset v-if="product.color && product.color.length" class="option-group">
          <legend>Color</legend>
          <div class="option-list">
            <label v-for="color in product.color" :key="color" class="option-label">
              <input type="radio" :value="color" v-model="selectedColor" class="sr-only" />
              <div class="option-box" :class="{ 'is-selected': selectedColor === color }" aria-hidden="true">{{ color }}</div>
            </label>
          </div>
        </fieldset>
      </div>

      <div class="actions">
        <p class="stock-status" :class="{ out: isOutOfStock }">
          {{ isOutOfStock ? 'Out of Stock — Available for Pre-order' : `${product.stock} in stock` }}
        </p>

        <div class="quantity-add">
          <div class="quantity-control">
            <button @click="quantity > 1 ? quantity-- : null" aria-label="Decrease quantity" class="qty-btn">-</button>
            <span class="qty" aria-live="polite">{{ quantity }}</span>
            <button @click="(!product.inStore || quantity < product.stock) ? quantity++ : null" aria-label="Increase quantity" class="qty-btn" :disabled="product.inStore && quantity >= product.stock">+</button>
          </div>
          <AccessibleButton 
            v-if="!isOutOfStock"
            class="add-btn" 
            label="Add to Cart" 
            @click="addToCart(false)" 
            :disabled="(product.size?.length && !selectedSize) || (product.color?.length && !selectedColor)"
          />
          <AccessibleButton 
            v-else
            class="add-btn" 
            label="Pre-order (50% Deposit)" 
            @click="addToCart(true)" 
            :disabled="(product.size?.length && !selectedSize) || (product.color?.length && !selectedColor)"
            style="background-color: #7c3aed;"
          />
        </div>
      </div>
    </div>
  </div>
  <div v-if="product && suggestedProducts.length" class="container section-spacing related-section">
    <h2 class="section-title">You Might Also Like</h2>
    <div class="product-grid">
      <article v-for="sProduct in suggestedProducts" :key="sProduct.id" class="product-card">
        <RouterLink 
          :to="`/product/${sProduct.id}`"
          class="product-link"
          :aria-label="`View details for ${sProduct.name}`"
        >
          <div class="img-wrapper">
            <img :src="sProduct.image" :alt="sProduct.name" loading="lazy" />
          </div>
          <div class="s-product-info">
            <h3>{{ sProduct.name }}</h3>
            <p class="s-price">{{ sProduct.price.toLocaleString() }} RWF</p>
            <span v-if="!sProduct.inStore" class="s-badge">Pre-order</span>
          </div>
        </RouterLink>
      </article>
    </div>
  </div>
  
  <div v-if="!product" class="container section-spacing">
    <LoadingSpinner message="Loading product details..." />
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

.product-detail {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
}

@media (max-width: 768px) {
  .product-detail {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}

.product-gallery {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.main-image img {
  width: 100%;
  aspect-ratio: 4/5;
  border-radius: 8px;
  object-fit: cover;
  background: var(--color-border);
}

.thumbnail-list {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.thumb-btn {
  background: none;
  border: 2px solid transparent;
  padding: 0;
  border-radius: 4px;
  cursor: pointer;
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  overflow: hidden;
  transition: border-color 0.2s;
}

.thumb-btn img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumb-btn.active {
  border-color: var(--color-primary);
}

.breadcrumb {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 1rem;
}

.breadcrumb a {
  color: #666;
}

.breadcrumb a:hover {
  text-decoration: underline;
  color: var(--color-primary);
}

.title {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.price {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 1rem;
}

.preorder-badge {
  display: inline-block;
  background: var(--color-bg);
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.description {
  font-size: 1.125rem;
  color: #555;
  margin-bottom: 2rem;
  line-height: 1.8;
}

.option-group {
  border: none;
  padding: 0;
  margin-bottom: 1.5rem;
}

.option-group legend {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.option-list {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.option-label {
  cursor: pointer;
}

.option-box {
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  transition: all 0.2s;
  min-width: 3rem;
  text-align: center;
}

input:focus-visible + .option-box {
  outline: 3px dashed var(--color-primary);
  outline-offset: 2px;
}

.option-box.is-selected {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.stock-status {
  font-weight: 600;
  color: var(--color-success);
  margin-bottom: 1rem;
}

.stock-status.out {
  color: var(--color-error);
}

.quantity-add {
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
  padding: 0.75rem 1rem;
  font-size: 1.25rem;
  line-height: 1;
  color: var(--color-text);
}

.qty-btn:hover {
  background: var(--color-border);
}

.qty {
  padding: 0 1rem;
  font-weight: 600;
  min-width: 2.5rem;
  text-align: center;
}

.add-btn {
  flex: 1;
}

.preorder-btn {
  background: #7c3aed !important;
}

.loading {
  text-align: center;
  font-size: 1.25rem;
  padding: 4rem 0;
}

/* Related Products Styles */
.related-section {
  padding-top: 2rem;
  border-top: 1px solid var(--color-border);
}

.section-title {
  font-size: 1.75rem;
  margin-bottom: 2rem;
  text-align: center;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
}

.product-card {
  border-radius: 8px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.product-link {
  color: var(--color-text);
  text-decoration: none;
  position: relative;
  display: block;
}

.product-card:hover, .product-card:focus-within {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px rgba(0,0,0,0.1);
}

.img-wrapper {
  aspect-ratio: 3/4;
  overflow: hidden;
}

.img-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.product-card:hover .img-wrapper img, .product-card:focus-within .img-wrapper img {
  transform: scale(1.05);
}

.s-product-info {
  padding: 1rem;
  text-align: center;
}

.s-product-info h3 {
  font-size: 1rem;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.s-price {
  font-weight: 700;
  color: var(--color-primary);
}

.s-badge {
  display: inline-block;
  background: var(--color-primary-light);
  color: white;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  border-radius: 4px;
  margin-top: 0.5rem;
}
</style>
