<script setup>
import { computed, ref } from 'vue';
import { Eye, EyeOff } from 'lucide-vue-next';

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  modelValue: { type: [String, Number], default: '' },
  type: { type: String, default: 'text' },
  error: { type: String, default: '' },
  success: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  placeholder: { type: String, default: '' },
  description: { type: String, default: '' }
});

const emit = defineEmits(['update:modelValue']);
const isPasswordVisible = ref(false);

const inputType = computed(() => {
  if (props.type === 'password') {
    return isPasswordVisible.value ? 'text' : 'password';
  }
  return props.type;
});

const togglePassword = () => {
  isPasswordVisible.value = !isPasswordVisible.value;
};

const errorId = computed(() => `${props.id}-error`);
const descriptionId = computed(() => `${props.id}-description`);

const ariaDescribedBy = computed(() => {
  let describedBy = [];
  if (props.description) describedBy.push(descriptionId.value);
  if (props.error) describedBy.push(errorId.value);
  return describedBy.length > 0 ? describedBy.join(' ') : null;
});

const onInput = (e) => {
  emit('update:modelValue', e.target.value);
};
</script>

<template>
  <div class="input-group">
    <label :for="id" class="input-label">
      {{ label }}
      <span v-if="required" class="required" aria-hidden="true">*</span>
      <span v-if="required" class="sr-only">(required)</span>
    </label>
    
    <div v-if="description" :id="descriptionId" class="input-description">
      {{ description }}
    </div>

    <div class="input-wrapper">
      <input
        :id="id"
        :type="inputType"
        :value="modelValue"
        @input="onInput"
        :aria-invalid="!!error"
        :aria-required="required"
        :aria-describedby="ariaDescribedBy"
        :placeholder="placeholder"
        :class="{ 'has-error': !!error, 'has-success': success && !error }"
      />
      <button 
        v-if="type === 'password'" 
        type="button" 
        class="password-toggle" 
        @click="togglePassword"
        :aria-label="isPasswordVisible ? 'Hide password' : 'Show password'"
      >
        <EyeOff v-if="isPasswordVisible" :size="20" />
        <Eye v-else :size="20" />
      </button>
    </div>

    <div v-if="error" :id="errorId" class="input-error" role="alert">
      {{ error }}
    </div>
  </div>
</template>

<style scoped>
.input-group {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.input-label {
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.required {
  color: var(--color-error);
}

.input-description {
  font-size: 0.875rem;
  color: #666;
}

.has-error {
  border-color: var(--color-error);
}

.has-success {
  border-color: #16a34a;
  box-shadow: 0 0 0 1px #16a34a;
}

.input-error {
  color: var(--color-error);
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper input {
  width: 100%;
  padding-right: 2.5rem;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  color: #666;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.password-toggle:hover {
  color: var(--color-primary);
}
</style>
