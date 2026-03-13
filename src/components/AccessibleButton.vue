<script setup>
defineProps({
  label: { type: String, required: true },
  disabled: { type: Boolean, default: false },
  ariaLabel: { type: String, default: null },
  type: { type: String, default: 'button' },
  variant: { type: String, default: 'primary' } // primary, secondary, danger
});
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :aria-label="ariaLabel || label"
    :aria-disabled="disabled"
    :class="['acc-btn', `variant-${variant}`]"
  >
    <slot>{{ label }}</slot>
  </button>
</template>

<style scoped>
.acc-btn {
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  border: none;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.acc-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.variant-primary {
  background-color: var(--color-primary);
  color: white;
}

.variant-primary:hover:not(:disabled) {
  background-color: var(--color-primary-light);
}

.variant-secondary {
  background-color: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.variant-secondary:hover:not(:disabled) {
  background-color: var(--color-bg);
  /* color: var(--color-primary-light); */
  border-color: var(--color-primary-light);
}

.variant-danger {
  background-color: var(--color-error);
  color: white;
}

.variant-danger:hover:not(:disabled) {
  opacity: 0.9;
}
</style>
