<template>
  <div class="loading-container" role="status" aria-live="polite" aria-busy="true">
    <div class="spinner"></div>
    <p class="loading-text">{{ message || 'Loading content, please wait...' }}</p>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    default: 'Loading...'
  }
})
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  min-height: 100px;
  gap: 1rem;
}

.loading-text {
  color: var(--color-primary);
  font-weight: 500;
  font-size: 0.95rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
