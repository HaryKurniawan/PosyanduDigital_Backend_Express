const prisma = require('../../../config/prisma');

// Get KPSP statistics (Admin)
const getKPSPStatistics = async (req, res) => {
  try {
    const totalScreenings = await prisma.kPSPScreening.count();

    const resultStats = await prisma.kPSPScreening.groupBy({
      by: ['result'],
      _count: {
        result: true
      }
    });

    const categoryStats = await prisma.kPSPScreening.groupBy({
      by: ['categoryId'],
      _count: {
        categoryId: true
      }
    });

    // Get category names
    const categories = await prisma.kPSPAgeCategory.findMany({
      where: {
        id: {
          in: categoryStats.map(s => s.categoryId)
        }
      },
      select: {
        id: true,
        name: true,
        code: true
      }
    });

    const categoryStatsWithNames = categoryStats.map(stat => ({
      ...stat,
      category: categories.find(c => c.id === stat.categoryId)
    }));

    res.json({
      totalScreenings,
      resultStats,
      categoryStats: categoryStatsWithNames
    });
  } catch (error) {
    console.error('Error in getKPSPStatistics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = getKPSPStatistics;