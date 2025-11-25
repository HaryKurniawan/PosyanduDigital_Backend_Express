const prisma = require('../../../config/prisma');

// Get screening history for a child
const getChildScreeningHistory = async (req, res) => {
  try {
    const { childId } = req.params;

    // Verify child belongs to user
    const child = await prisma.childData.findFirst({
      where: {
        id: childId,
        userId: req.user.id
      }
    });

    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }

    const screenings = await prisma.kPSPScreening.findMany({
      where: { childId },
      include: {
        category: {
          select: {
            name: true,
            code: true
          }
        },
        answers: {
          include: {
            question: true
          }
        }
      },
      orderBy: {
        screeningDate: 'desc'
      }
    });

    res.json(screenings);
  } catch (error) {
    console.error('Error in getChildScreeningHistory:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = getChildScreeningHistory;