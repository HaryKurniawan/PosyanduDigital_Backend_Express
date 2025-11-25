const prisma = require('../../../config/prisma');

// Update KPSP category (Admin)
const updateKPSPCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, minAgeMonths, maxAgeMonths, description, isActive } = req.body;

    const category = await prisma.kPSPAgeCategory.update({
      where: { id },
      data: {
        code,
        name,
        minAgeMonths,
        maxAgeMonths,
        description,
        isActive
      }
    });

    res.json({
      message: 'KPSP category updated successfully',
      data: category
    });
  } catch (error) {
    console.error('Error in updateKPSPCategory:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = updateKPSPCategory;
