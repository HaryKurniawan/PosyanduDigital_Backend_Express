const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const familyDataRoutes = require('./routes/familyDataRoutes');
const adminRoutes = require('./routes/adminRoutes'); // NEW
const prisma = require('./config/prisma');
const { validateApiKey } = require('./middleware/apiKeyMiddleware');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public route (tanpa API key)
app.get('/', (req, res) => {
  res.json({ message: 'Posyandu API is running' });
});

// Protected routes dengan API key
app.use('/api/auth', validateApiKey, authRoutes);
app.use('/api/family', validateApiKey, familyDataRoutes);
app.use('/api/admin', validateApiKey, adminRoutes); // NEW

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on('beforeExit', async () => {
  await prisma.$disconnect();
});