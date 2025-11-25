const prisma = require('../../../config/prisma');

const registerForPosyandu = async (req, res) => {
  try {
    const { scheduleId, childId } = req.body;
    const userId = req.user.id;

    if (!scheduleId || !childId) {
      return res.status(400).json({ message: 'Schedule ID and Child ID are required' });
    }

    const schedule = await prisma.posyanduSchedule.findUnique({
      where: { id: scheduleId }
    });

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    const child = await prisma.childData.findUnique({
      where: { id: childId }
    });

    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }

    if (child.userId !== userId) {
      return res.status(403).json({ message: 'You do not have permission to register this child' });
    }

    const existingRegistration = await prisma.posyanduRegistration.findUnique({
      where: {
        scheduleId_childId: {
          scheduleId: scheduleId,
          childId: childId
        }
      }
    });

    if (existingRegistration && existingRegistration.status !== 'CANCELLED') {
      return res.status(400).json({ 
        message: 'This child is already registered for this schedule',
        currentStatus: existingRegistration.status
      });
    }

    if (existingRegistration && existingRegistration.status === 'CANCELLED') {
      const updatedRegistration = await prisma.posyanduRegistration.update({
        where: { id: existingRegistration.id },
        data: { 
          status: 'REGISTERED',
          registeredAt: new Date()
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
              id: true,
              location: true,
              scheduleDate: true,
              description: true
            }
          }
        }
      });

      return res.json({ 
        message: 'Registration reactivated successfully', 
        data: updatedRegistration 
      });
    }

    const registration = await prisma.posyanduRegistration.create({
      data: {
        scheduleId,
        childId,
        userId,
        status: 'REGISTERED'
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
            id: true,
            location: true,
            scheduleDate: true,
            description: true
          }
        }
      }
    });

    res.json({ 
      message: 'Registration successful', 
      data: registration 
    });
  } catch (error) {
    console.error('Error in registerForPosyandu:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message
    });
  }
};

module.exports = registerForPosyandu;
