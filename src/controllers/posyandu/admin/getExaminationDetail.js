const prisma = require('../../../config/prisma');

// Get examination detail with vaccines
const getExaminationDetail = async (req, res) => {
  try {
    const { examinationId } = req.params;

    const examination = await prisma.childExamination.findUnique({
      where: { id: examinationId },
      include: {
        child: {
          include: {
            user: {
              include: {
                motherData: true
              }
            }
          }
        },
        schedule: true
      }
    });

    if (!examination) {
      return res.status(404).json({ message: 'Examination not found' });
    }

    // Get vaccines given during this examination
    const vaccines = await prisma.childImmunization.findMany({
      where: {
        childId: examination.childId,
        scheduleId: examination.scheduleId,
        vaccinationDate: {
          gte: new Date(new Date(examination.examinationDate).setHours(0, 0, 0, 0)),
          lt: new Date(new Date(examination.examinationDate).setHours(23, 59, 59, 999))
        }
      },
      include: {
        vaccine: true
      }
    });

    res.json({
      ...examination,
      vaccinesGiven: vaccines
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = getExaminationDetail;
