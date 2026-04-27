<script setup>
import { ref, onMounted, computed } from 'vue'
import { useEventStore } from '../stores/eventStore'

const store = useEventStore()
const studentName = ref('')
const studentId = ref('')
const selectedEventId = ref(null)
const searchStudentId = ref('')

onMounted(() => {
  store.fetchEvents()
  store.fetchStudents()
})

const register = async () => {
  if (!studentName.value || !studentId.value || !selectedEventId.value) {
    alert('Please fill all fields')
    return
  }
  
  try {
    const payload = {
      name: studentName.value,
      studentId: parseInt(studentId.value),
      eventId: parseInt(selectedEventId.value)
    }
    
    console.log('Sending registration payload:', payload)
    
    await store.registerStudent(payload)
    alert('Registration successful!')
    studentName.value = ''
    studentId.value = ''
    selectedEventId.value = null
  } catch (err) {
    console.error('Full Error Object:', err)
    let errorMsg = err.message
    if (err.response && err.response.data) {
      errorMsg = JSON.stringify(err.response.data)
    }
    alert('Failed to register: ' + errorMsg)
  }
}

const myEvents = computed(() => {
  if (!searchStudentId.value) return []
  return store.getStudentEvents(parseInt(searchStudentId.value))
})
</script>

<template>
  <div class="student-view">
    <h2 class="title-large">Student Portal</h2>

    <div class="grid">
      <!-- Registration Section -->
      <section class="card">
        <h3 class="title-medium">Register for an Event</h3>
        <form @submit.prevent="register">
          <div style="margin-bottom: 1.5rem;">
            <label style="display: block; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.5rem;">Full Name</label>
            <input v-model="studentName" type="text" placeholder="Enter your name" required />
          </div>
          <div style="margin-bottom: 1.5rem;">
            <label style="display: block; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.5rem;">Student ID</label>
            <input v-model="studentId" type="number" placeholder="Enter your ID" required />
          </div>
          <div style="margin-bottom: 1.5rem;">
            <label style="display: block; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.5rem;">Select Event</label>
            <select v-model="selectedEventId" required>
              <option :value="null" disabled>Choose an event</option>
              <option v-for="event in store.events" :key="event.id" :value="event.id">
                {{ event.eventName }} ({{ event.title }})
              </option>
            </select>
          </div>
          <button type="submit" style="width: 100%;">Confirm Registration</button>
        </form>
      </section>
    </div>


    <!-- Available Events Preview -->
    <section style="margin-top: 4rem;">
      <h3 class="title-medium">Upcoming Events</h3>
      <div class="grid">
        <div v-for="event in store.events" :key="event.id" class="card" style="padding: 1.5rem;">
          <span style="font-size: 0.65rem; font-weight: 800; text-transform: uppercase; border: 1px solid #000; padding: 2px 6px; margin-bottom: 1rem; display: inline-block;">
            {{ event.location }}
          </span>
          <h4 style="font-weight: 800; font-size: 1.2rem; margin-bottom: 0.5rem;">{{ event.eventName }}</h4>
          <p style="font-size: 0.85rem; color: #444; margin-bottom: 1rem;">{{ event.title }}</p>
          <div class="flex-between" style="border-top: 1px solid #eee; padding-top: 1rem; font-size: 0.75rem;">
            <span style="font-weight: 700;">{{ new Date(event.date).toLocaleDateString() }}</span>
            <span style="color: #666;">{{ event.availableSeats }} SEATS</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
