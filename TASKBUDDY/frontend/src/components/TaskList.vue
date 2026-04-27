<template>
  <div class="task-list">
    <div v-if="tasks.length === 0" class="empty-state">
      <p>No tasks found. Add a new task above!</p>
    </div>
    <div v-else class="grid">
      <div v-for="task in tasks" :key="task.id" :class="['card', 'task-card', { completed: task.complete }]">
        <div class="task-content">
          <h4>{{ task.name }}</h4>
          <p class="description">{{ task.description }}</p>
          <div class="meta">
            <span class="due-date">Due: {{ task.dueDate }} at {{ task.dueTime }}</span>
            <span class="status">{{ task.complete ? 'Completed' : 'Pending' }}</span>
          </div>
        </div>
        <div class="task-actions">
          <button class="btn outline small" @click="$emit('toggleComplete', task)">
            {{ task.complete ? 'Undo' : 'Complete' }}
          </button>
          <button class="btn outline small" @click="$emit('editTask', task)">Edit</button>
          <button class="btn error small" @click="$emit('deleteTask', task.id)">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  tasks: {
    type: Array,
    required: true
  }
})
defineEmits(['editTask', 'deleteTask', 'toggleComplete'])
</script>

<style scoped>
.task-list {
  margin-top: 20px;
}
.empty-state {
  text-align: center;
  padding: 40px;
  color: var(--text-color);
  opacity: 0.7;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}
.task-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-left: 5px solid var(--primary-color);
  transition: opacity 0.3s ease;
}
.task-card.completed {
  opacity: 0.6;
  border-left-color: var(--success-color);
}
.task-card h4 {
  margin-bottom: 5px;
}
.description {
  font-size: 0.9em;
  margin-bottom: 15px;
  min-height: 40px;
}
.meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.8em;
  margin-bottom: 15px;
  font-weight: bold;
}
.status {
  text-transform: uppercase;
}
.task-actions {
  display: flex;
  gap: 10px;
}
.btn.small {
  padding: 5px 10px;
  font-size: 0.8em;
}
.btn.error {
  background-color: var(--error-color);
  color: #fff;
}
.btn.error:hover {
  background-color: #cc0000;
}
</style>
