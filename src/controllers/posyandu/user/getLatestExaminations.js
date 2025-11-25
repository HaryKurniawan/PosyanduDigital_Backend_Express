const prisma = require('../../../config/prisma');

const getLatestExaminations = async (req, res) => {
  try {
    const children = await prisma.childData.findMany({
      where: { userId: req.user.id },
      include: {
        examinations: {
          orderBy: {
            examinationDate: 'desc'
          },
          take: 1,
          include: {
            schedule: true
          }
        }
      }
    });

    res.json(children);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = getLatestExaminations;
