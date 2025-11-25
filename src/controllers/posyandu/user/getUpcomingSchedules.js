const prisma = require('../../../config/prisma');

const getUpcomingSchedules = async (req, res) => {
  try {
    const today = new Date();
    
    const schedules = await prisma.posyanduSchedule.findMany({
      where: {
        scheduleDate: {
          gte: today
        },
        isActive: true
      },
      orderBy: {
        scheduleDate: 'asc'
      },
      include: {
        _count: {
          select: { 
            registrations: {
              where: {
                status: {
                  not: 'CANCELLED'
                }
              }
            }
          }
        }
      }
    });

    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = getUpcomingSchedules;