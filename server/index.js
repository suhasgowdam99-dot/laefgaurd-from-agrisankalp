const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'agrisankalp_secret_key_2024';

app.use(cors());
app.use(express.json());

// Mock In-Memory DB
const users = [];
const detections = [];

// --- AUTH MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.user = user;
    next();
  });
};

// --- AUTH ROUTES ---
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, name } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = { id: Date.now().toString(), email, password: hashedPassword, name };
  users.push(user);
  res.status(201).json({ message: 'User created' });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: { name: user.name, email: user.email } });
});

// --- AI DETECTION ROUTE ---
app.post('/api/detect', (req, res) => {
  // Simulate AI Processing
  const diseases = [
    { name: 'Powdery Mildew', confidence: '87%', advice: 'Apply potassium bicarbonate sprays and improve air circulation.' },
    { name: 'Late Blight', confidence: '92%', advice: 'Remove infected plants and apply copper-based fungicides.' },
    { name: 'Healthy Leaf', confidence: '99%', advice: 'Continue regular monitoring and optimal watering.' }
  ];
  
  const result = diseases[Math.floor(Math.random() * diseases.length)];
  const detection = { id: Date.now().toString(), ...result, timestamp: new Date() };
  detections.push(detection);
  
  // Artificial delay to simulate processing
  setTimeout(() => res.json(detection), 1500);
});

app.get('/api/sensors', (req, res) => {
  res.json({
    humidity: '68%',
    temp: '24°C',
    soilMoisture: '42%'
  });
});

app.listen(PORT, () => {
  console.log(`LeafGuard Backend running on http://localhost:${PORT}`);
});
