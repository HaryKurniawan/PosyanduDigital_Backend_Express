const prisma = require('../../../config/prisma');

const getExaminationsBySchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;

    const examinations = await prisma.childExamination.findMany({
      where: { scheduleId },
      include: {
        child: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(examinations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = getExaminationsBySchedule;