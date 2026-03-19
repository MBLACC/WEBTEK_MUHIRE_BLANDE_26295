<script setup>
</script>

<template>
  <div class="error-page container section-spacing">
    <div class="error-header">
      <h1 class="page-title">Oops! Page Not Found</h1>
      <p class="subtitle">We couldn't find the page you were looking for, or an error occurred.</p>
    </div>

    <div class="error-content">
      <div class="content-text">
        <h2>Possible Causes:</h2>
        <ul>
          <li>The URL might be misspelled or incomplete.</li>
          <li>The page might have been moved or deleted.</li>
          <li>The server might be experiencing temporary issues.</li>
        </ul>
        <div class="action-buttons">
          <router-link to="/" class="btn btn-primary">Return to Home</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.error-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-height: 60vh;
  justify-content: center;
}

.error-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--color-primary, #333);
}

.subtitle {
  font-size: 1.25rem;
  color: var(--color-text, #666);
}

.error-content {
  max-width: 600px;
  background: var(--color-bg-secondary, #f9f9f9);
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.content-text h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--color-text, #333);
  text-align: left;
}

.content-text ul {
  text-align: left;
  list-style-type: disc;
  padding-left: 2rem;
  line-height: 1.6;
  color: var(--color-text-light, #555);
  margin-bottom: 2rem;
}

.content-text li {
  margin-bottom: 0.5rem;
}

.action-buttons {
  margin-top: 2rem;
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: var(--color-primary, #000);
  color: #fff;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}
</style>
