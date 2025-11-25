const prisma = require('../../config/prisma');

// Get all families with complete data (alternative endpoint)
const getAllFamilies = async (req, res) => {
  try {
    const families = await prisma.user.findMany({
      where: {
        role: 'USER',
        hasCompletedProfile: true
      },
      include: {
        motherData: true,
        spouseData: true,
        childrenData: {
          orderBy: {
            childOrder: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(families);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = getAllFamilies;
