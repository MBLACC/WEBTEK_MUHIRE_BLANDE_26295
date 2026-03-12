<script setup>
</script>

<template>
  <div class="about-page container section-spacing">
    <div class="about-header">
      <h1 class="page-title">About BatelCollection</h1>
      <p class="subtitle">Premium fashion available to everyone.</p>
    </div>

    <div class="about-content">
      <div class="content-text">
        <h2>Our Story</h2>
        <p>Founded in Kigali, BatelCollection began with a simple mission: to provide high-quality, elegant clothing that makes our clients feel confident and stylish. We source the finest materials and curate collections that balance timeless aesthetics with modern trends.</p>
        
        <h2>Our Mission</h2>
        <p>We believe that accessibility should never compromise quality. Whether you are looking for classic everyday wear or the perfect outfit for a special occasion, BatelCollection is dedicated to offering fashion that is thoughtfully designed and expertly crafted.</p>

        <h2>Our Location</h2>
        <p>We are centrally located in the heart of the city:<br>
        <strong>Kigali, Rwanda</strong><br>
        <strong>KK 000, KGL</strong></p>
      </div>

      <div class="content-image">
         <img src="@/assets/Store_image/front_store.png" alt="BatelCollection Storefront" class="about-img"/>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-title {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

.subtitle {
  font-size: 1.25rem;
  color: var(--color-primary);
  font-weight: 500;
}

.about-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

@media (max-width: 768px) {
  .about-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}

.content-text h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  margin-top: 2rem;
  color: var(--color-primary);
}

.content-text h2:first-child {
  margin-top: 0;
}

.content-text p {
  line-height: 1.7;
  color: #4a4a4a;
  margin-bottom: 1rem;
}

.about-img {
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
</style>
