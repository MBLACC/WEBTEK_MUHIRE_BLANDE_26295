<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Type, Check } from 'lucide-vue-next'

const isOpen = ref(false)
const currentSize = ref('16px')

const sizeOptions = [
  { id: '14px', label: 'A-', name: 'Small' },
  { id: '16px', label: 'A', name: 'Standard' },
  { id: '18px', label: 'A+', name: 'Large' },
  { id: '20px', label: 'A++', name: 'Extra Large' }
]

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const setFontSize = (size) => {
  currentSize.value = size
  document.documentElement.style.setProperty('--base-font-size', size)
  localStorage.setItem('preferred-font-size', size)
  isOpen.value = false
}

const handleClickOutside = (event) => {
  if (isOpen.value && !event.target.closest('.font-size-toggle')) {
    isOpen.value = false
  }
}

onMounted(() => {
  const savedSize = localStorage.getItem('preferred-font-size')
  if (savedSize) {
    currentSize.value = savedSize
    document.documentElement.style.setProperty('--base-font-size', savedSize)
  }
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="font-size-toggle">
    <button 
      class="toggle-btn" 
      @click.stop="toggleMenu" 
      aria-haspopup="true" 
      :aria-expanded="isOpen"
      aria-label="Adjust Font Size"
    >
      <Type :size="20" aria-hidden="true" />
      <span class="sr-only">Font Size</span>
    </button>

    <Transition name="fade-slide">
      <div v-if="isOpen" class="dropdown-menu" role="menu" aria-label="Font Size Options">
        <div class="dropdown-header">Text Size</div>
        <button
          v-for="option in sizeOptions"
          :key="option.id"
          class="menu-item"
          role="menuitem"
          :class="{ active: currentSize === option.id }"
          @click="setFontSize(option.id)"
        >
          <span class="item-icon">
            <Check v-if="currentSize === option.id" :size="16" />
          </span>
          <span class="item-label-group">
            <span class="font-symbol" :style="{ fontSize: option.id }">{{ option.label }}</span>
            <span class="font-name">{{ option.name }}</span>
          </span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.font-size-toggle {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.toggle-btn {
  background: transparent;
  border: none;
  color: var(--color-text);
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s, color 0.2s;
  cursor: pointer;
}

.toggle-btn:hover,
.toggle-btn:focus-visible {
  background-color: var(--color-border);
  color: var(--color-primary);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: -10px;
  margin-top: 0.5rem;
  background: white;
  min-width: 200px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--color-border);
  padding: 0.5rem;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.dropdown-header {
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #666;
  font-weight: 600;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 0.25rem;
}

.menu-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: var(--color-text);
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
}

.menu-item:hover,
.menu-item:focus-visible {
  background-color: #f8fafc;
  color: var(--color-primary);
}

.menu-item.active {
  background-color: #f1f5f9;
  color: var(--color-primary);
  font-weight: 600;
}

.item-icon {
  width: 24px;
  display: flex;
  align-items: center;
  color: var(--color-primary);
}

.item-label-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.font-symbol {
  font-weight: 700;
  min-width: 30px;
}

.font-name {
  font-size: 0.875rem;
  color: #666;
}

.menu-item.active .font-name {
  color: var(--color-primary);
}

/* Animations */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
