const prisma = require('../../../config/prisma');

// Get examination history with vaccines
const getMyChildrenExaminations = async (req, res) => {
  try {
    const examinations = await prisma.childExamination.findMany({
      where: {
        child: {
          userId: req.user.id
        }
      },
      include: {
        child: {
          select: {
            id: true,
            fullName: true,
            nik: true,
            birthDate: true
          }
        },
        schedule: {
          select: {
            location: true,
            scheduleDate: true
          }
        }
      },
      orderBy: {
        examinationDate: 'desc'
      }
    });

    // Get vaccines for each examination
    const examinationsWithVaccines = await Promise.all(
      examinations.map(async (exam) => {
        const vaccines = await prisma.childImmunization.findMany({
          where: {
            childId: exam.childId,
            scheduleId: exam.scheduleId,
            vaccinationDate: {
              gte: new Date(new Date(exam.examinationDate).setHours(0, 0, 0, 0)),
              lt: new Date(new Date(exam.examinationDate).setHours(23, 59, 59, 999))
            }
          },
          include: {
            vaccine: true
          }
        });

        return {
          ...exam,
          vaccinesGiven: vaccines
        };
      })
    );

    res.json(examinationsWithVaccines);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = getMyChildrenExaminations;

