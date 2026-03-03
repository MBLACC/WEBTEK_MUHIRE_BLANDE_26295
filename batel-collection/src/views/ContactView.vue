<script setup>
</script>

<template>
  <div class="contact-page container section-spacing">
    <div class="contact-header">
      <h1 class="page-title">Contact Us</h1>
      <p class="subtitle">We'd love to hear from you. Get in touch with our team.</p>
    </div>

    <div class="contact-grid">
      <div class="contact-info">
        <h3>Store Location</h3>
        <p>
          BatelCollection Headquarters<br>
          Kigali, Rwanda<br>
          Bldg 000, KGL
        </p>

        <h3>Email</h3>
        <p><a href="mailto:support@batelcollection.com">support@batelcollection.com</a></p>

        <h3>Phone</h3>
        <p>+250 123 456 789</p>

        <h3>Business Hours</h3>
        <p>
          Monday - Friday: 9:00 AM - 6:00 PM<br>
          Saturday: 10:00 AM - 4:00 PM<br>
          Sunday: Closed
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contact-header {
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

.contact-grid {
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.contact-info {
  background: white;
  padding: 3rem;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  max-width: 500px;
  width: 100%;
}

.contact-info h3 {
  font-size: 1.25rem;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
  margin-top: 1.5rem;
}

.contact-info h3:first-child {
  margin-top: 0;
}

.contact-info p {
  color: #4a4a4a;
  line-height: 1.6;
}

.contact-info a {
  color: var(--color-primary);
}
</style>
