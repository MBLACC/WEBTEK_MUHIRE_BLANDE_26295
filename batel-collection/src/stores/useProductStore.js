import { defineStore } from 'pinia'
import { ref } from 'vue'
import { storageService } from '../services/storageService'

export const useProductStore = defineStore('products', () => {
  const products = ref([])
  const heroContent = ref({})
  const categories = ref({})
  const newArrivals = ref([])

  const fetchProducts = async () => {
    products.value = storageService.getAll('products')
  }
  
  const fetchHero = async () => {
    heroContent.value = storageService.get('hero') || {}
  }

  const fetchCategories = async () => {
    categories.value = storageService.get('categories') || {}
  }

  const fetchNewArrivals = async () => {
    newArrivals.value = storageService.getAll('new_arrivals')
  }

  const getProductById = (id) => products.value.find(p => p.id === Number(id))

  const addProduct = async (product) => {
    const newItem = storageService.add('products', product)
    products.value.push(newItem)
  }

  const updateProduct = async (id, product) => {
    const updated = storageService.update('products', id, product)
    if (updated) {
      const index = products.value.findIndex(p => p.id === Number(id))
      if (index !== -1) products.value[index] = updated
    }
  }

  const deleteProduct = async (id) => {
    storageService.delete('products', id)
    products.value = products.value.filter(p => p.id !== Number(id))
  }

  const updateHero = async (content) => {
    const updated = storageService.save('hero', content)
    heroContent.value = updated
  }

  const updateCategories = async (newCats) => {
    const updated = storageService.save('categories', newCats)
    categories.value = updated
  }

  const addNewArrival = async (item) => {
    const newItem = storageService.add('new_arrivals', item)
    newArrivals.value.push(newItem)
  }

  const deleteNewArrival = async (id) => {
    storageService.delete('new_arrivals', id)
    newArrivals.value = newArrivals.value.filter(p => Number(p.id) !== Number(id))
  }

  const updateNewArrival = async (id, item) => {
    const updated = storageService.update('new_arrivals', id, item)
    if (updated) {
      const index = newArrivals.value.findIndex(a => Number(a.id) === Number(id))
      if (index !== -1) newArrivals.value[index] = updated
    }
  }

  return { 
    products, heroContent, categories, newArrivals,
    fetchProducts, fetchHero, fetchCategories, fetchNewArrivals, 
    getProductById, addProduct, updateProduct, deleteProduct, updateHero,
    updateCategories, addNewArrival, deleteNewArrival, updateNewArrival
  }
})
