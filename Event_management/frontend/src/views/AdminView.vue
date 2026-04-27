<script setup>
import { ref, onMounted } from 'vue'
import { useEventStore } from '../stores/eventStore'

const store = useEventStore()
const newEvent = ref({
  eventName: '',
  title: '',
  location: '',
  date: '',
  availableSeats: 0
})

onMounted(() => {
  store.fetchEvents()
  store.fetchStudents()
})

const addEvent = async () => {
  try {
    const payload = {
      eventName: newEvent.value.eventName,
      title: newEvent.value.title,
      location: newEvent.value.location,
      date: newEvent.value.date,
      availableSeats: parseInt(newEvent.value.availableSeats)
    }
    
    console.log('Sending payload:', payload)
    
    await store.addEvent(payload)
    alert('Event added successfully!')
    newEvent.value = { eventName: '', title: '', location: '', date: '', availableSeats: 0 }
  } catch (err) {
    console.error('Full Error Object:', err)
    let errorMsg = err.message
    if (err.response && err.response.data) {
      errorMsg = JSON.stringify(err.response.data)
    }
    alert('Failed to add event: ' + errorMsg)
  }
}

const getRegCount = (eventId) => {
  return store.getEventRegistrations(eventId).length
}

const getRegStudents = (eventId) => {
  return store.getEventRegistrations(eventId)
}
</script>

<template>
  <div class="admin-view">
    <h2 class="title-large">Admin Console</h2>

    <div class="grid" style="grid-template-columns: 1fr 2fr;">
      <!-- Add Event Section -->
      <section class="card">
        <h3 class="title-medium">Create New Event</h3>
        <form @submit.prevent="addEvent">
          <div style="margin-bottom: 1.2rem;">
            <label style="display: block; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.4rem;">Event Name</label>
            <input v-model="newEvent.eventName" type="text" placeholder="e.g. Tech Talk 2026" required />
          </div>
          <div style="margin-bottom: 1.2rem;">
            <label style="display: block; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.4rem;">Title/Description</label>
            <input v-model="newEvent.title" type="text" placeholder="e.g. AI & Future" required />
          </div>
          <div style="margin-bottom: 1.2rem;">
            <label style="display: block; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.4rem;">Location</label>
            <input v-model="newEvent.location" type="text" placeholder="e.g. Main Hall" required />
          </div>
          <div style="margin-bottom: 1.2rem;">
            <label style="display: block; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.4rem;">Date</label>
            <input v-model="newEvent.date" type="date" required />
          </div>
          <div style="margin-bottom: 1.5rem;">
            <label style="display: block; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.4rem;">Capacity</label>
            <input v-model="newEvent.availableSeats" type="number" placeholder="e.g. 50" required />
          </div>
          <button type="submit" style="width: 100%;">Publish Event</button>
        </form>
      </section>

      <!-- Manage Events Section -->
      <section>
        <h3 class="title-medium">Active Events & Registrations</h3>
        <div class="grid" style="grid-template-columns: 1fr;">
          <div v-for="event in store.events" :key="event.id" class="card" style="margin-bottom: 1.5rem;">
            <div class="flex-between" style="margin-bottom: 1.5rem;">
              <div>
                <h4 style="font-weight: 800; text-transform: uppercase;">{{ event.eventName }}</h4>
                <p style="font-size: 0.8rem; color: #666;">{{ event.title }}</p>
              </div>
              <div style="text-align: right;">
                <p style="font-size: 1.5rem; font-weight: 900;">{{ getRegCount(event.id) }}</p>
                <p style="font-size: 0.6rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;">Registrations</p>
              </div>
            </div>

            <div v-if="getRegCount(event.id) > 0" style="background: #fafafa; padding: 1rem;">
              <p style="font-size: 0.7rem; font-weight: 800; text-transform: uppercase; margin-bottom: 0.5rem; border-bottom: 1px solid #ddd;">Registered Students</p>
              <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem;">
                <thead>
                  <tr style="text-align: left; color: #888;">
                    <th style="padding: 0.5rem 0;">NAME</th>
                    <th style="padding: 0.5rem 0;">ID</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="student in getRegStudents(event.id)" :key="student.id">
                    <td style="padding: 0.3rem 0; font-weight: 600;">{{ student.name }}</td>
                    <td style="padding: 0.3rem 0;">{{ student.studentId }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p v-else style="font-size: 0.8rem; color: #999; font-style: italic;">No students registered yet.</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
