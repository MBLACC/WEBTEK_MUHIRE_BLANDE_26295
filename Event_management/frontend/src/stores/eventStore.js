import { defineStore } from 'pinia'
import axios from 'axios'

const API_BASE = 'http://localhost:8080/api'

export const useEventStore = defineStore('event', {
  state: () => ({
    events: [],
    students: [],
    loading: false,
    error: null
  }),
  actions: {
    async fetchEvents() {
      this.loading = true
      try {
        const response = await axios.get(`${API_BASE}/events`)
        this.events = response.data
      } catch (err) {
        this.error = 'Failed to fetch events'
      } finally {
        this.loading = false
      }
    },
    async fetchStudents() {
      this.loading = true
      try {
        const response = await axios.get(`${API_BASE}/students`)
        this.students = response.data
      } catch (err) {
        this.error = 'Failed to fetch registrations'
      } finally {
        this.loading = false
      }
    },
    async addEvent(eventData) {
      try {
        const response = await axios.post(`${API_BASE}/events`, eventData)
        this.events.push(response.data)
        return response.data
      } catch (err) {
        this.error = 'Failed to add event'
        throw err
      }
    },
    async registerStudent(studentData) {
      try {
        const response = await axios.post(`${API_BASE}/students`, studentData)
        this.students.push(response.data)
        return response.data
      } catch (err) {
        this.error = 'Failed to register'
        throw err
      }
    }
  },
  getters: {
    getEventRegistrations: (state) => (eventId) => {
      return state.students.filter(s => s.eventId === eventId)
    },
    getStudentEvents: (state) => (studentId) => {
      const studentRegistrations = state.students.filter(s => s.studentId === studentId)
      return state.events.filter(e => studentRegistrations.some(r => r.eventId === e.id))
    }
  }
})
