const prisma = require('../../../config/prisma');

// Create KPSP age category (Admin)
const createKPSPCategory = async (req, res) => {
  try {
    const { code, name, minAgeMonths, maxAgeMonths, description } = req.body;

    const category = await prisma.kPSPAgeCategory.create({
      data: {
        code,
        name,
        minAgeMonths,
        maxAgeMonths,
        description
      }
    });

    res.json({
      message: 'KPSP category created successfully',
      data: category
    });
  } catch (error) {
    console.error('Error in createKPSPCategory:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = createKPSPCategory;