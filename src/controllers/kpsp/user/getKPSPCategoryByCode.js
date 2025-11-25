const prisma = require('../../../config/prisma');

// Get KPSP category by code
const getKPSPCategoryByCode = async (req, res) => {
  try {
    const { code } = req.params;

    const category = await prisma.kPSPAgeCategory.findUnique({
      where: { code },
      include: {
        questions: {
          orderBy: {
            questionNumber: 'asc'
          }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ message: 'KPSP category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error('Error in getKPSPCategoryByCode:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = getKPSPCategoryByCode;