<script setup>
import { onMounted, onUnmounted, computed, ref } from 'vue'
import { useProductStore } from '@/stores/useProductStore'
import { RouterLink } from 'vue-router'
import AccessibleButton from '@/components/AccessibleButton.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const productStore = useProductStore()

const currentSlide = ref(0)
let slideInterval = null
const isLoading = ref(true)

onMounted(async () => {
  try {
    const promises = []
    if (productStore.products.length === 0) promises.push(productStore.fetchProducts())
    if (!productStore.heroContent.title) promises.push(productStore.fetchHero())
    if (Object.keys(productStore.categories).length === 0) promises.push(productStore.fetchCategories())
    promises.push(productStore.fetchNewArrivals())

    await Promise.all(promises)
  } catch (err) {
    console.error('Failed to load home data', err)
  } finally {
    isLoading.value = false
    startSlider()
  }
})

onUnmounted(() => {
  clearInterval(slideInterval)
})

const slides = computed(() => {
  if (productStore.newArrivals && productStore.newArrivals.length > 0) {
    return productStore.newArrivals.map(arr => ({
      title: 'New Arrival',
      subtitle: arr.name,
      image: arr.image,
      isVideo: false,
      ctaText: 'Shop Arrival',
      ctaLink: '/shop'
    }))
  }
  // Fallback to hero
  const hero = productStore.heroContent;
  if (hero.images && hero.images.length > 0) {
    return hero.images.map((img) => ({
      ...hero,
      image: img,
      isVideo: false
    }));
  }
  return [hero];
})

const startSlider = () => {
  slideInterval = setInterval(() => {
    if (slides.value.length > 1) {
      currentSlide.value = (currentSlide.value + 1) % slides.value.length
    }
  }, 5000) // Slide every 5 seconds
}

const setSlide = (index) => {
  currentSlide.value = index
  clearInterval(slideInterval)
  startSlider() // Reset timer
}

const inStockProducts = computed(() => {
  return productStore.products.filter(p => p.inStore && p.stock > 0)
})

const newArrivalsList = computed(() => inStockProducts.value.slice(0, 4))

const dynamicCategories = computed(() => {
  const cats = []
  for (const catName in productStore.categories) {
    // Attempt to find a hero image for this category based on available products
    const firstProduct = productStore.products.find(p => p.category === catName && (p.image || p.images?.length))
    const imgUrl = firstProduct 
      ? (firstProduct.images?.length ? firstProduct.images[0] : firstProduct.image) 
      : 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e07?w=500&q=80' // Fallback image
      
    cats.push({ name: catName, image: imgUrl })
  }
  return cats
})
</script>

<template>
  <div class="home-page">
    <!-- Loading State -->
    <LoadingSpinner v-if="isLoading" message="Loading store content..." />

    <div v-else>
      <!-- Hero Slider Section -->
    <section class="hero-slider" aria-label="Hero content slider">
      <div 
        v-for="(slide, index) in slides" 
        :key="index"
        v-show="currentSlide === index"
        class="slide fade-animation"
      >
        <!-- Background Media -->
        <div class="media-layer">
          <video v-if="slide.isVideo" :src="slide.image" autoplay loop muted playsinline></video>
          <img v-else :src="slide.image" alt="Background image" />
          <div class="overlay"></div>
        </div>
        
        <!-- Content -->
        <div class="container hero-content">
          <h1 id="hero-title">{{ slide.title }}</h1>
          <p class="hero-subtitle">{{ slide.subtitle }}</p>
          <RouterLink :to="slide.ctaLink || '/shop'" class="cta-button" tabindex="-1">
            <AccessibleButton :label="slide.ctaText || 'Shop Now'" />
          </RouterLink>
        </div>
      </div>

      <!-- Slide controls -->
      <div class="slider-controls" v-if="slides.length > 1">
        <button 
          v-for="(_, index) in slides" 
          :key="index"
          @click="setSlide(index)"
          :class="['dot', { active: currentSlide === index }]"
          :aria-label="`Go to slide ${index + 1}`"
        ></button>
      </div>
    </section>

    <div class="container section-spacing">
      <!-- New Arrivals List (Standard Products) -->
      <section aria-labelledby="new-arrivals-title">
        <h2 id="new-arrivals-title" class="section-title">Latest Products</h2>
        <div class="product-grid">
          <article class="product-card" v-for="product in newArrivalsList" :key="product.id">
            <RouterLink 
              :to="`/product/${product.id}`"
              class="product-link"
              :aria-label="`View details for ${product.name}`"
            >
              <div class="img-wrapper">
                 <img :src="product.images?.length ? product.images[0] : product.image" :alt="product.name" loading="lazy" />
              </div>
              <div class="product-info">
                <h3>{{ product.name }}</h3>
                <p class="price">{{ product.price.toLocaleString() }} RWF</p>
              </div>
            </RouterLink>
          </article>
        </div>
      </section>

      <!-- Shop by Category -->
      <section aria-labelledby="categories-title" class="section-spacing">
        <h2 id="categories-title" class="section-title">Shop by Category</h2>
        <div class="category-grid">
          <article class="category-card-wrapper" v-for="cat in dynamicCategories" :key="cat.name">
            <RouterLink 
              :to="`/shop?category=${cat.name}`"
              class="category-card"
              :aria-label="`Shop ${cat.name}`"
            >
              <img :src="cat.image" :alt="`${cat.name} category`" loading="lazy" />
              <div class="category-overlay">
                <span class="category-name">{{ cat.name }}</span>
              </div>
            </RouterLink>
          </article>
        </div>
      </section>
    </div>
    </div> <!-- Close Loading v-else condition -->
  </div>
</template>

<style scoped>
.hero-slider {
  position: relative;
  width: 100%;
  height: 60vh;
  min-height: 400px;
  overflow: hidden;
  background: var(--color-primary);
}

.slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.fade-animation {
  animation: fadeIn 1s ease-in-out forwards;
}

@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

.media-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.media-layer img, .media-layer video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to right, rgba(80, 65, 67, 0.9), rgba(80, 65, 67, 0.4));
}

.hero-content {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 600px;
}

.hero-content h1 {
  font-size: 3.5rem;
  color: white;
  margin-bottom: 1rem;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: white;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.cta-button {
  text-decoration: none;
  align-self: flex-start;
}

.slider-controls {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
  display: flex;
  gap: 10px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255,255,255,0.5);
  border: none;
  cursor: pointer;
  transition: background 0.3s;
}

.dot.active {
  background: white;
}

.section-spacing {
  margin-top: 4rem;
  margin-bottom: 4rem;
}

.section-title {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 2rem;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
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
  display: block;
}

.product-card:hover, .product-card:focus-within {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px rgba(0,0,0,0.1);
}

.img-wrapper {
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: #f0f0f0;
}

.img-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.5s ease;
}

.product-card:hover .img-wrapper img, .product-card:focus-within .img-wrapper img {
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

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.category-card {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 1;
  display: block;
}

.category-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.category-overlay {
  position: absolute;
  inset: 0;
  background: rgba(80, 65, 67, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease;
}

.category-name {
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 1px;
}

.category-card:hover img, .category-card:focus-visible img {
  transform: scale(1.05);
}

.category-card:hover .category-overlay, .category-card:focus-visible .category-overlay {
  background: rgba(80, 65, 67, 0.6);
}
</style>
