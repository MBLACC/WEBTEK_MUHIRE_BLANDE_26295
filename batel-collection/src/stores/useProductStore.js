import { defineStore } from 'pinia'
import axios from 'axios'
import { ref } from 'vue'

const API_URL = 'http://localhost:3001/api'

export const useProductStore = defineStore('products', () => {
  const products = ref([])
  const heroContent = ref({})
  const categories = ref({})
  const newArrivals = ref([])

  const fetchProducts = async () => {
    const res = await axios.get(`${API_URL}/products`)
    products.value = res.data
  }
  
  const fetchHero = async () => {
    const res = await axios.get(`${API_URL}/hero`)
    heroContent.value = res.data
  }

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/categories`)
      categories.value = res.data
    } catch (e) {
      console.error(e)
    }
  }

  const fetchNewArrivals = async () => {
    try {
      const res = await axios.get(`${API_URL}/newArrivals`)
      newArrivals.value = res.data
    } catch(e) { console.error(e) }
  }

  const getProductById = (id) => products.value.find(p => p.id === Number(id))

  const addProduct = async (product) => {
    const res = await axios.post(`${API_URL}/products`, product)
    products.value.push(res.data)
  }

  const updateProduct = async (id, product) => {
    const res = await axios.put(`${API_URL}/products/${id}`, product)
    const index = products.value.findIndex(p => p.id === Number(id))
    if (index !== -1) products.value[index] = res.data
  }

  const deleteProduct = async (id) => {
    await axios.delete(`${API_URL}/products/${id}`)
    products.value = products.value.filter(p => p.id !== Number(id))
  }
  const updateHero = async (content) => {
    const res = await axios.put(`${API_URL}/single/hero`, content)
    heroContent.value = res.data
  }

  const updateCategories = async (newCats) => {
    const res = await axios.put(`${API_URL}/single/categories`, newCats)
    categories.value = res.data
  }

  const addNewArrival = async (item) => {
    const res = await axios.post(`${API_URL}/newArrivals`, item)
    newArrivals.value.push(res.data)
  }
  const deleteNewArrival = async (id) => {
    await axios.delete(`${API_URL}/newArrivals/${id}`)
    newArrivals.value = newArrivals.value.filter(p => p.id !== Number(id))
  }

  const updateNewArrival = async (id, item) => {
    const res = await axios.put(`${API_URL}/newArrivals/${id}`, item)
    const index = newArrivals.value.findIndex(a => a.id === Number(id))
    if (index !== -1) newArrivals.value[index] = res.data
  }

  return { 
    products, heroContent, categories, newArrivals,
    fetchProducts, fetchHero, fetchCategories, fetchNewArrivals, 
    getProductById, addProduct, updateProduct, deleteProduct, updateHero,
    updateCategories, addNewArrival, deleteNewArrival, updateNewArrival
  }
})
