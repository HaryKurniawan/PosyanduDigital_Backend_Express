const prisma = require('../../config/prisma');

// Get complete family data by child ID
const getFamilyDataByChildId = async (req, res) => {
  try {
    const { childId } = req.params;

    // Get child data
    const childData = await prisma.childData.findUnique({
      where: { id: childId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!childData) {
      return res.status(404).json({ message: 'Child data not found' });
    }

    // Get mother data
    const motherData = await prisma.motherData.findUnique({
      where: { userId: childData.userId }
    });

    // Get spouse data
    const spouseData = await prisma.spouseData.findUnique({
      where: { userId: childData.userId }
    });

    // Get all siblings
    const siblings = await prisma.childData.findMany({
      where: { 
        userId: childData.userId,
        id: { not: childId }
      },
      orderBy: {
        childOrder: 'asc'
      }
    });

    res.json({
      childData,
      motherData,
      spouseData,
      siblings
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = getFamilyDataByChildId;