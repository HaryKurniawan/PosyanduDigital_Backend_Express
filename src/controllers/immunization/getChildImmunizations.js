const prisma = require('../../config/prisma');

// Get child immunization records
const getChildImmunizations = async (req, res) => {
  try {
    const { childId } = req.params;
    const userId = req.user.id;

    // Verify ownership
    const child = await prisma.childData.findUnique({
      where: { id: childId },
      include: {
        user: {
          select: { id: true }
        }
      }
    });

    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }

    // Allow if user is the parent or admin
    if (child.user.id !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const immunizations = await prisma.childImmunization.findMany({
      where: { childId },
      include: {
        vaccine: true,
        schedule: {
          select: {
            id: true,
            scheduleDate: true,
            location: true
          }
        }
      },
      orderBy: {
        vaccinationDate: 'desc'
      }
    });

    res.json(immunizations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = getChildImmunizations;
