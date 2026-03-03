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
app.use(express.json({ limit: '50mb', extended: true }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const DB_DIR = path.join(__dirname, 'database-store');

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
    { name: 'hero.json', data: { title: 'Welcome to BatelCollection', subtitle: 'Premium Fashion in Kigali', ctaText: 'Shop Now', ctaLink: '/shop', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=80', isVideo: false } }
  ];

  filesToSeed.forEach(file => {
    const filePath = path.join(DB_DIR, file.name);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(file.data, null, 2));
    }
  });
};

initDB();

const readDB = (filename) => JSON.parse(fs.readFileSync(path.join(DB_DIR, filename), 'utf8'));
const writeDB = (filename, data) => fs.writeFileSync(path.join(DB_DIR, filename), JSON.stringify(data, null, 2));

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
    const data = readDB(`${req.params.collection}.json`);
    const newItem = { id: Date.now(), ...req.body };
    data.push(newItem);
    writeDB(`${req.params.collection}.json`, data);
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
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

// Used for single objects like hero
app.put('/api/single/:collection', (req, res) => {
  try {
    writeDB(`${req.params.collection}.json`, req.body);
    res.json(req.body);
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

// Auth endpoint
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const users = readDB('users.json');
  const normalizedInput = username ? username.toLowerCase() : '';

  const user = users.find(u => {
    const dbEmail = u.email ? u.email.toLowerCase() : '';
    const dbUser = u.username ? u.username.toLowerCase() : '';
    return (dbUser === normalizedInput || dbEmail === normalizedInput) && u.password === password;
  });

  if (user) {
    const { password, ...safeUser } = user;
    res.json({ token: 'fake-jwt-token-' + user.id, user: safeUser });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
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

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
