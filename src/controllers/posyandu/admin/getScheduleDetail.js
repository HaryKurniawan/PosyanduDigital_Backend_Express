const prisma = require('../../../config/prisma');

const getScheduleDetail = async (req, res) => {
  try {
    const { scheduleId } = req.params;

    const schedule = await prisma.posyanduSchedule.findUnique({
      where: { id: scheduleId },
      include: {
        registrations: {
          include: {
            child: {
              include: {
                user: {
                  include: {
                    motherData: true,
                    spouseData: true
                  }
                }
              }
            }
          },
          orderBy: {
            registeredAt: 'desc'
          }
        },
        examinations: {
          include: {
            child: true
          },
          orderBy: {
            examinationDate: 'desc'
          }
        },
        _count: {
          select: {
            registrations: true,
            examinations: true
          }
        }
      }
    });

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = getScheduleDetail;