const prisma = require('../../config/prisma');

// Get all family data for current user
const getFamilyData = async (req, res) => {
  try {
    const familyData = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        motherData: true,
        spouseData: true,
        childrenData: {
          orderBy: {
            childOrder: 'asc'
          }
        }
      }
    });

    res.json(familyData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = getFamilyData;