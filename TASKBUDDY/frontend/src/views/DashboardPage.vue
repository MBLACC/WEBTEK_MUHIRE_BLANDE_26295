<template>
  <MainLayout>
    <div class="dashboard container">
      <!-- Stats Row -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-title">TODAY'S TASKS</div>
          <div class="stat-row">
            <span class="stat-value">{{ stats.today }}</span>
            <span class="stat-desc">Due Today</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-title">UPCOMING</div>
          <div class="stat-row">
            <span class="stat-value">{{ stats.upcoming }}</span>
            <span class="stat-desc">Scheduled</span>
          </div>
        </div>
        <div class="stat-card overdue">
          <div class="stat-title">OVERDUE</div>
          <div class="stat-row">
            <span class="stat-value overdue-text">{{ stats.overdue }}</span>
            <span class="stat-desc overdue-text">Needs Attention</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-title">COMPLETION</div>
          <div class="stat-row">
            <span class="stat-value">{{ stats.completion }}%</span>
          </div>
        </div>
      </div>

      <div class="dashboard-header flex-between">
        <div>
          <h2>Dashboard</h2>
          <p class="subtitle">Here's a list of your tasks for this week.</p>
        </div>
        <button class="btn add-btn" v-if="!showTaskForm && !taskToEdit" @click="showTaskForm = true">+ Create Task</button>
      </div>

      <div class="tasks-section">
        <div class="controls">
          <input type="text" v-model="searchQuery" placeholder="Search tasks by id/date/name..." @input="fetchTasks" class="search-bar" />
        </div>
        
        <TaskForm 
          v-if="showTaskForm || taskToEdit" 
          :taskToEdit="taskToEdit" 
          @submitForm="saveTask" 
          @cancelForm="cancelEdit" 
        />
        
        <TaskList :tasks="tasks" @editTask="startEdit" @deleteTask="deleteTask" @toggleComplete="toggleTaskComplete" />
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '../components/MainLayout.vue'
import TaskList from '../components/TaskList.vue'
import TaskForm from '../components/TaskForm.vue'

const router = useRouter()
const user = ref(JSON.parse(localStorage.getItem('user')))
const tasks = ref([])
const searchQuery = ref('')
const showTaskForm = ref(false)
const taskToEdit = ref(null)

onMounted(() => {
  if (!user.value) {
    router.push('/login')
  } else {
    fetchTasks()
  }
})

const fetchTasks = async () => {
  let url = `http://localhost:8080/api/tasks/user/${user.value.id}`
  if (searchQuery.value) {
    url += `?query=${encodeURIComponent(searchQuery.value)}`
  }
  try {
    const res = await fetch(url)
    if (res.ok) {
      tasks.value = await res.json()
    }
  } catch (err) {
    console.error("Failed to fetch tasks", err)
  }
}

const stats = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  let todayCount = 0
  let upcomingCount = 0
  let overdueCount = 0
  let completedCount = 0

  tasks.value.forEach(t => {
    if (t.complete) {
      completedCount++
    } else {
      if (t.dueDate === today) todayCount++
      else if (t.dueDate > today) upcomingCount++
      else if (t.dueDate && t.dueDate < today) overdueCount++
    }
  })

  const completion = tasks.value.length === 0 ? 0 : Math.round((completedCount / tasks.value.length) * 100)

  return { today: todayCount, upcoming: upcomingCount, overdue: overdueCount, completion }
})

const saveTask = async (taskData) => {
  const isEditing = !!taskData.id
  taskData.userId = user.value.id
  
  const url = isEditing 
    ? `http://localhost:8080/api/tasks/update/${taskData.id}` 
    : `http://localhost:8080/api/tasks/add`

  try {
    const res = await fetch(url, {
      method: isEditing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    })
    
    if (res.ok) {
      taskToEdit.value = null
      showTaskForm.value = false
      fetchTasks()
    } else {
      console.error("Failed to save task")
    }
  } catch (err) {
    console.error("Network error saving task", err)
  }
}

const startEdit = (task) => {
  taskToEdit.value = task
  showTaskForm.value = false
}

const cancelEdit = () => {
  taskToEdit.value = null
  showTaskForm.value = false
}

const toggleTaskComplete = async (task) => {
  const updatedTask = { ...task, complete: !task.complete }
  try {
    const res = await fetch(`http://localhost:8080/api/tasks/update/${updatedTask.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedTask)
    })
    if (res.ok) {
      fetchTasks()
    } else {
      console.error("Failed to update task status")
    }
  } catch (err) {
    console.error("Network error toggling task completion", err)
  }
}

const deleteTask = async (taskId) => {
  if (!confirm("Are you sure you want to delete this task?")) return;
  try {
    const res = await fetch(`http://localhost:8080/api/tasks/delete/${taskId}`, {
      method: 'DELETE'
    })
    if (res.ok) {
      fetchTasks()
    }
  } catch (err) {
    console.error("Failed to delete task", err)
  }
}
</script>

<style scoped>
.dashboard {
  padding: 20px 40px;
  width: 100%;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background-color: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.stat-title {
  font-size: 12px;
  font-weight: 700;
  color: #888;
  margin-bottom: 15px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.stat-value {
  font-size: 32px;
  font-weight: 800;
  line-height: 1;
}

.stat-desc {
  font-size: 12px;
  color: #888;
}

.overdue-text {
  color: var(--error-color);
}

.dashboard-header {
  margin-bottom: 30px;
}

.dashboard-header h2 {
  font-size: 28px;
  margin-bottom: 5px;
}

.subtitle {
  color: #888;
  font-size: 14px;
}

.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.add-btn {
  background-color: var(--primary-color);
  color: var(--primary-text);
  border-radius: 6px;
}

.controls {
  margin-bottom: 20px;
}

.search-bar {
  max-width: 400px;
}
</style>
