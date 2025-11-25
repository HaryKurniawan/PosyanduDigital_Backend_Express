const prisma = require('../../../config/prisma');

// Get KPSP age categories with questions
const getKPSPCategories = async (req, res) => {
  try {
    const categories = await prisma.kPSPAgeCategory.findMany({
      where: { isActive: true },
      include: {
        questions: {
          orderBy: {
            questionNumber: 'asc'
          }
        }
      },
      orderBy: {
        minAgeMonths: 'asc'
      }
    });

    res.json(categories);
  } catch (error) {
    console.error('Error in getKPSPCategories:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = getKPSPCategories;