<template>
  <div class="card task-form-card">
    <h3>{{ taskToEdit ? 'Edit Task' : 'Add New Task' }}</h3>
    <form @submit.prevent="submitTask">
      <div class="form-group">
        <label>Task Name</label>
        <input type="text" v-model="form.name" required minlength="3" placeholder="Enter task name" />
      </div>
      <div class="form-group">
        <label>Description (Optional)</label>
        <textarea v-model="form.description" rows="3" placeholder="Task details..."></textarea>
      </div>
      <div class="form-row">
        <div class="form-group half">
          <label>Due Date</label>
          <input type="date" v-model="form.dueDate" required />
        </div>
        <div class="form-group half">
          <label>Due Time</label>
          <input type="time" v-model="form.dueTime" required />
        </div>
      </div>
      <div class="form-group checkbox-group" v-if="taskToEdit">
        <label>
          <input type="checkbox" v-model="form.complete" />
          Mark as Complete
        </label>
      </div>
      <div class="actions">
        <button type="submit" class="btn">{{ taskToEdit ? 'Update Task' : 'Create Task' }}</button>
        <button type="button" class="btn outline" @click="$emit('cancelForm')" v-if="taskToEdit">Cancel</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  taskToEdit: Object
})
const emit = defineEmits(['submitForm', 'cancelForm'])

const defaultForm = () => ({
  name: '',
  description: '',
  dueDate: '',
  dueTime: '',
  complete: false
})

const form = ref(defaultForm())

watch(() => props.taskToEdit, (newVal) => {
  if (newVal) {
    form.value = { ...newVal }
  } else {
    form.value = defaultForm()
  }
}, { immediate: true })

const submitTask = () => {
  if (!form.value.name || !form.value.dueDate || !form.value.dueTime) return;
  emit('submitForm', { ...form.value })
  if (!props.taskToEdit) {
    form.value = defaultForm()
  }
}
</script>

<style scoped>
.task-form-card {
  margin-bottom: 20px;
}
.task-form-card h3 {
  margin-bottom: 15px;
}
.form-group {
  margin-bottom: 15px;
}
.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 5px;
}
.form-row {
  display: flex;
  gap: 15px;
}
.half {
  flex: 1;
}
.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.checkbox-group input {
  width: auto;
  margin: 0;
}
.actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}
</style>
