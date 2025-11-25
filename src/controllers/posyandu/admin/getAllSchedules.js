const prisma = require('../../../config/prisma');

const getAllSchedules = async (req, res) => {
  try {
    const schedules = await prisma.posyanduSchedule.findMany({
      orderBy: {
        scheduleDate: 'desc'
      },
      include: {
        _count: {
          select: { 
            examinations: true,
            registrations: true 
          }
        },
        registrations: {
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
          }
        },
        examinations: {
          include: {
            child: true
          }
        }
      }
    });

    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = getAllSchedules;