const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const familyDataRoutes = require('./routes/familyDataRoutes');
const adminRoutes = require('./routes/adminRoutes');
const posyanduRoutes = require('./routes/posyanduRoutes');
const kpspRoutes = require('./routes/kpspRoutes'); // ✅ TAMBAHKAN INI
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
app.use('/api/admin', validateApiKey, adminRoutes); 
app.use('/api/posyandu', validateApiKey, posyanduRoutes);
app.use('/api/kpsp', validateApiKey, kpspRoutes); // ✅ TAMBAHKAN INI

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on('beforeExit', async () => {
  await prisma.$disconnect();
});