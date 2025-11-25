const prisma = require('../../../config/prisma');

// Get single screening detail
const getScreeningDetail = async (req, res) => {
  try {
    const { screeningId } = req.params;

    const screening = await prisma.kPSPScreening.findUnique({
      where: { id: screeningId },
      include: {
        child: {
          select: {
            fullName: true,
            birthDate: true,
            userId: true
          }
        },
        category: {
          select: {
            name: true,
            code: true
          }
        },
        answers: {
          include: {
            question: true
          },
          orderBy: {
            question: {
              questionNumber: 'asc'
            }
          }
        }
      }
    });

    if (!screening) {
      return res.status(404).json({ message: 'Screening not found' });
    }

    // Verify user owns this screening
    if (screening.child.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(screening);
  } catch (error) {
    console.error('Error in getScreeningDetail:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = getScreeningDetail;