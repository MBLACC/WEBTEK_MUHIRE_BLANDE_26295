<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <footer class="footer">
    <div class="container footer-inner">
      <div class="footer-grid">
        <!-- About Section -->
        <div class="footer-column">
          <h3>BatelCollection</h3>
          <p>Your premium fashion destination. Empowering style with elegant, accessible design.</p>
        </div>

        <!-- Links Section -->
        <div class="footer-column">
          <h3>Quick Links</h3>
          <ul class="footer-links">
            <li><RouterLink to="/">Home</RouterLink></li>
            <li><RouterLink to="/shop">Shop</RouterLink></li>
            <li><RouterLink to="/about">About Us</RouterLink></li>
            <li><RouterLink to="/contact">Contact Us</RouterLink></li>
          </ul>
        </div>

        <!-- Address Section -->
        <div class="footer-column">
          <h3>Location</h3>
          <address class="footer-address">
            Kigali, Rwanda<br>
            KK 000, KGL<br>
            <a href="mailto:support@batelcollection.com">support@batelcollection.com</a>
          </address>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>&copy; {{ new Date().getFullYear() }} BatelCollection. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background-color: var(--color-primary);
  color: white;
  padding: 2rem 0 1rem 0;
  margin-top: auto;
}

.footer-inner {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.footer-column h3 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: white;
}

.footer-column p {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.footer-links a {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: color 0.2s;
}

.footer-links a:hover, .footer-links a:focus-visible {
  color: white;
  text-decoration: underline;
}

.footer-address {
  font-style: normal;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
}

.footer-address a {
  color: white;
  text-decoration: underline;
}

.footer-bottom {
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
}

.footer-bottom p {
  margin: 0;
}
</style>
