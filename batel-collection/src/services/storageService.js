const STORAGE_KEYS = {
  PRODUCTS: 'batel_products',
  USERS: 'batel_users',
  ORDERS: 'batel_orders',
  CATEGORIES: 'batel_categories',
  NEW_ARRIVALS: 'batel_new_arrivals',
  HERO: 'batel_hero'
};

const DEFAULT_DATA = {
  PRODUCTS: [
    { id: 1, name: 'Elegant Summer Dress', category: 'Clothes', subcategory: 'Dress', price: 25000, description: 'Perfect dress for summer.', size: ['S', 'M', 'L'], color: ['Red', 'Blue'], stock: 10, image: 'https://images.unsplash.com/photo-1572804013309-82a89b4f65dd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', inStore: true },
    { id: 2, name: 'Classic Leather Pumps', category: 'Shoes', subcategory: 'Heels', price: 45000, description: 'Comfortable and classic.', size: [36, 37, 38, 39], color: ['Black', 'Nude'], stock: 5, image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', inStore: false },
    { id: 3, name: 'Gold Loop Earrings', category: 'Accessories', subcategory: 'Earrings', price: 15000, description: 'Elegant 18k gold plated.', size: ['One Size'], color: ['Gold'], stock: 20, image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', inStore: true },
    { id: 4, name: 'Leather Tote Bag', category: 'Bags', subcategory: 'Tote', price: 60000, description: 'Spacious everyday bag.', size: ['One Size'], color: ['Brown', 'Black'], stock: 8, image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', inStore: true },
  ],
  USERS: [
    { id: 1, username: 'batelcollection@gmail.com', password: 'Roxan@123', isAdmin: true, email: 'batelcollection@gmail.com', firstName: 'Admin', lastName: 'User' },
    { id: 2, username: 'client', password: '123', isAdmin: false, email: 'client@example.com', firstName: 'Client', lastName: 'User' }
  ],
  CATEGORIES: {
    "Clothes": ["Dress", "Shirt", "Pants", "Jacket", "Suit"],
    "Shoes": ["Heels", "Sneakers", "Flats", "Boots"],
    "Accessories": ["Earrings", "Necklace", "Bracelet", "Ring", "Watch"],
    "Bags": ["Tote", "Backpack", "Clutch", "Crossbody"]
  },
  HERO: { 
    title: 'Welcome to BatelCollection', 
    subtitle: 'Premium Fashion in Kigali', 
    ctaText: 'Shop Now', 
    ctaLink: '/shop', 
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=80', 
    images: [], 
    isVideo: false 
  }
};

const initStorage = () => {
  Object.keys(STORAGE_KEYS).forEach(key => {
    if (!localStorage.getItem(STORAGE_KEYS[key])) {
      const defaultValue = DEFAULT_DATA[key] || [];
      localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(defaultValue));
    }
  });
};

initStorage();

export const storageService = {
  get(key) {
    const data = localStorage.getItem(STORAGE_KEYS[key.toUpperCase()] || key);
    return data ? JSON.parse(data) : null;
  },

  save(key, data) {
    localStorage.setItem(STORAGE_KEYS[key.toUpperCase()] || key, JSON.stringify(data));
    return data;
  },

  getAll(key) {
    return this.get(key) || [];
  },

  getById(key, id) {
    const items = this.getAll(key);
    return items.find(item => item.id === Number(id));
  },

  add(key, item) {
    const items = this.getAll(key);
    const newItem = { ...item, id: Date.now() };
    items.push(newItem);
    this.save(key, items);
    return newItem;
  },

  update(key, id, updatedData) {
    const items = this.getAll(key);
    const index = items.findIndex(item => item.id === Number(id));
    if (index !== -1) {
      items[index] = { ...items[index], ...updatedData, id: Number(id) };
      this.save(key, items);
      return items[index];
    }
    return null;
  },

  delete(key, id) {
    const items = this.getAll(key);
    const filtered = items.filter(item => item.id !== Number(id));
    this.save(key, filtered);
    return true;
  }
};
