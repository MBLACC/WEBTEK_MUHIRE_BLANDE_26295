import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true }));

const DB_DIR = path.join(__dirname, 'database-store');
console.log(`Database directory: ${DB_DIR}`);

// Seeding Data
const defaultProducts = [
  { id: 1, name: 'Elegant Summer Dress', category: 'Clothes', subcategory: 'Dress', price: 25000, description: 'Perfect dress for summer.', size: ['S', 'M', 'L'], color: ['Red', 'Blue'], stock: 10, image: 'https://images.unsplash.com/photo-1572804013309-82a89b4f65dd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', inStore: true },
  { id: 2, name: 'Classic Leather Pumps', category: 'Shoes', subcategory: 'Heels', price: 45000, description: 'Comfortable and classic.', size: [36, 37, 38, 39], color: ['Black', 'Nude'], stock: 5, image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', inStore: false },
  { id: 3, name: 'Gold Loop Earrings', category: 'Accessories', subcategory: 'Earrings', price: 15000, description: 'Elegant 18k gold plated.', size: ['One Size'], color: ['Gold'], stock: 20, image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', inStore: true },
  { id: 4, name: 'Leather Tote Bag', category: 'Bags', subcategory: 'Tote', price: 60000, description: 'Spacious everyday bag.', size: ['One Size'], color: ['Brown', 'Black'], stock: 8, image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', inStore: true },
];

const defaultUsers = [
  { id: 1, username: 'batelcollection@gmail.com', password: 'Roxan@123', isAdmin: true, email: 'batelcollection@gmail.com', firstName: 'Admin', lastName: 'User' },
  { id: 2, username: 'client', password: '123', isAdmin: false, email: 'client@example.com', firstName: 'Client', lastName: 'User' }
];

const defaultCategories = {
  "Clothes": ["Dress", "Shirt", "Pants", "Jacket", "Suit"],
  "Shoes": ["Heels", "Sneakers", "Flats", "Boots"],
  "Accessories": ["Earrings", "Necklace", "Bracelet", "Ring", "Watch"],
  "Bags": ["Tote", "Backpack", "Clutch", "Crossbody"]
};

const initDB = () => {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR);
  }
  
  const filesToSeed = [
    { name: 'products.json', data: defaultProducts },
    { name: 'users.json', data: defaultUsers },
    { name: 'orders.json', data: [] },
    { name: 'categories.json', data: defaultCategories },
    { name: 'newArrivals.json', data: [] },
    { name: 'hero.json', data: { title: 'Welcome to BatelCollection', subtitle: 'Premium Fashion in Kigali', ctaText: 'Shop Now', ctaLink: '/shop', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=80', images: [], isVideo: false } }
  ];

  filesToSeed.forEach(file => {
    const filePath = path.join(DB_DIR, file.name);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(file.data, null, 2));
    }
  });
};

initDB();

const readDB = (filename) => {
  const filePath = path.join(DB_DIR, filename);
  if (!fs.existsSync(filePath)) {
    if (filename === 'newArrivals.json') return [];
    if (filename === 'hero.json') return { title: '', subtitle: '', ctaText: '', ctaLink: '', image: '', images: [], isVideo: false };
    console.warn(`[readDB] Warning: File not found: ${filename}`);
    throw new Error(`File not found: ${filename}`);
  }
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`[readDB] Error reading/parsing ${filename}:`, err);
    throw err;
  }
};

const writeDB = (filename, data) => {
  const filePath = path.join(DB_DIR, filename);
  try {
    const content = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, content);
    console.log(`[writeDB] Successfully updated ${filename} (${content.length} bytes)`);
  } catch (err) {
    console.error(`[writeDB] Error writing to ${filename}:`, err);
    throw err;
  }
};

// Generic REST endpoints
app.get('/api/:collection', (req, res) => {
  try {
    const data = readDB(`${req.params.collection}.json`);
    res.json(data);
  } catch (err) {
    res.status(404).json({ error: 'Not found' });
  }
});

app.post('/api/:collection', (req, res) => {
  try {
    const collection = req.params.collection;
    console.log(`[DEBUG] POST /api/${collection} received`);
    const data = readDB(`${collection}.json`);
    const newItem = { id: Date.now(), ...req.body };

    // Special logic for orders to reduce stock
    if (collection === 'orders') {
      console.log(`[DEBUG] Processing order to reduce stock...`);
      const products = readDB('products.json');
      const orderItems = req.body.items || [];
      
      orderItems.forEach(item => {
        console.log(`[DEBUG] Reducing stock for product ID: ${item.product.id}, quantity: ${item.quantity}`);
        const productIndex = products.findIndex(p => p.id === Number(item.product.id));
        if (productIndex !== -1) {
          const product = products[productIndex];
          const oldStock = product.stock;
          product.stock = Math.max(0, product.stock - (item.quantity || 1));
          console.log(`[DEBUG] Stock reduced from ${oldStock} to ${product.stock}`);
          
          if (product.stock <= 0) {
             console.log(`[DEBUG] Product ${product.id} is now out of store.`);
             product.inStore = false;
          }
        } else {
          console.log(`[DEBUG] Product ID ${item.product.id} not found in database.`);
        }
      });
      writeDB('products.json', products);
    }

    data.push(newItem);
    writeDB(`${collection}.json`, data);
    res.status(201).json(newItem);
  } catch (err) {
    console.error(`[API] Error in POST /api/${req.params.collection}:`, err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Used for single objects like hero or categories
// IMPORTANT: This must be registered BEFORE the generic /api/:collection/:id route
// because Express matches routes in order and /api/:collection/:id would match first,
// treating 'single' as the collection and 'categories' as the id.
app.put('/api/single/:collection', (req, res) => {
  try {
    console.log(`[API] PUT /api/single/${req.params.collection} - Received payload size: ${JSON.stringify(req.body).length}`);
    writeDB(`${req.params.collection}.json`, req.body);
    res.json(req.body);
  } catch (err) {
    console.error(`[API] Error updating single collection ${req.params.collection}:`, err);
    res.status(500).json({ 
      error: 'Backend Write Error', 
      details: err.message,
      path: req.params.collection
    });
  }
});

app.put('/api/:collection/:id', (req, res) => {
  try {
    const data = readDB(`${req.params.collection}.json`);
    const index = data.findIndex(item => item.id == req.params.id);
    if (index !== -1) {
      data[index] = { ...data[index], ...req.body, id: Number(req.params.id) };
      writeDB(`${req.params.collection}.json`, data);
      res.json(data[index]);
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/:collection/:id', (req, res) => {
  try {
    const data = readDB(`${req.params.collection}.json`);
    const filtered = data.filter(item => item.id != req.params.id);
    writeDB(`${req.params.collection}.json`, filtered);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

const loginAttempts = {};

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const users = readDB('users.json');
  const normalizedInput = username ? username.toLowerCase() : '';

  const user = users.find(u => {
    const dbEmail = u.email ? u.email.toLowerCase() : '';
    const dbUser = u.username ? u.username.toLowerCase() : '';
    return (dbUser === normalizedInput || dbEmail === normalizedInput);
  });

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  if (user.isPermanentlyLocked) {
    return res.status(403).json({ error: 'Account is permanently locked.' });
  }

  const attemptInfo = loginAttempts[user.id] || { count: 0, lockUntil: null };

  if (attemptInfo.lockUntil && Date.now() < attemptInfo.lockUntil) {
     const remaining = Math.ceil((attemptInfo.lockUntil - Date.now()) / 60000);
     return res.status(403).json({ error: `Account locked. Try again in ${remaining} minute(s).` });
  }

  if (user.password === password) {
    delete loginAttempts[user.id]; // successful login resets counter
    const { password, ...safeUser } = user;
    return res.json({ token: 'fake-jwt-token-' + user.id, user: safeUser });
  } else {
    attemptInfo.count += 1;
    let errorMsg = 'Invalid credentials';
    let locked = false;

    if (attemptInfo.count === 3) {
      attemptInfo.lockUntil = Date.now() + 5 * 60 * 1000;
      errorMsg = 'Warning: Account is locked for 5 minutes due to 3 failed attempts.';
      locked = true;
    } else if (attemptInfo.count === 4) {
      attemptInfo.lockUntil = Date.now() + 10 * 60 * 1000;
      errorMsg = 'Warning: Account is locked for 10 minutes due to 4 failed attempts.';
      locked = true;
    } else if (attemptInfo.count >= 5) {
      user.isPermanentlyLocked = true;
      const index = users.findIndex(u => u.id === user.id);
      users[index] = user;
      writeDB('users.json', users);
      errorMsg = 'Account permanently locked due to 5 failed attempts.';
      locked = true;
    }

    loginAttempts[user.id] = attemptInfo;
    return res.status(locked ? 403 : 401).json({ error: errorMsg });
  }
});

app.post('/api/auth/signup', (req, res) => {
  const { username, email, password, firstName, lastName, whatsappPhone } = req.body;
  const users = readDB('users.json');
  if (users.find(u => u.username === username || u.email === email)) {
    return res.status(400).json({ error: 'Username or email already exists' });
  }
  const newUser = {
    id: Date.now(),
    username,
    email,
    password,
    firstName,
    lastName,
    whatsappPhone,
    isAdmin: false
  };
  users.push(newUser);
  writeDB('users.json', users);
  
  const { password: _p, ...safeUser } = newUser;
  res.status(201).json({ token: 'fake-jwt-token-' + newUser.id, user: safeUser });
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('Bad JSON Payload:', err.message);
    return res.status(400).send({ error: 'Bad JSON Payload', details: err.message });
  }
  if (err.type === 'entity.too.large') {
    console.error('Payload Too Large:', err.message);
    return res.status(413).send({ error: 'Payload Too Large', details: err.message });
  }
  console.error('Unhandled Error:', err);
  res.status(500).send({ error: 'Internal Server Error', details: err.message });
});

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
