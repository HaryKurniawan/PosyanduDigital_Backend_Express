const prisma = require('../config/prisma');

// ============ ADMIN FUNCTIONS ============

// Create new posyandu schedule
const createSchedule = async (req, res) => {
  try {
    const { scheduleDate, location, description } = req.body;

    const schedule = await prisma.posyanduSchedule.create({
      data: {
        scheduleDate: new Date(scheduleDate),
        location,
        description
      }
    });

    res.json({ message: 'Schedule created successfully', data: schedule });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all schedules (for admin)
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

// Get schedule detail with registrations and examinations
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

// Search child by NIK
const searchChildByNIK = async (req, res) => {
  try {
    const { nik } = req.params;

    const child = await prisma.childData.findUnique({
      where: { nik },
      include: {
        user: {
          include: {
            motherData: true,
            spouseData: true
          }
        }
      }
    });

    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }

    res.json(child);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all children (for admin)
const getAllChildren = async (req, res) => {
  try {
    const children = await prisma.childData.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        fullName: 'asc'
      }
    });

    res.json(children);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create child examination
const createExamination = async (req, res) => {
  try {
    const {
      childId,
      scheduleId,
      weight,
      height,
      headCircumference,
      armCircumference,
      immunization,
      notes
    } = req.body;

    // Check if registration exists and update status to ATTENDED
    const registration = await prisma.posyanduRegistration.findFirst({
      where: {
        childId,
        scheduleId,
        status: 'REGISTERED'
      }
    });

    if (registration) {
      await prisma.posyanduRegistration.update({
        where: { id: registration.id },
        data: { status: 'ATTENDED' }
      });
    }

    const examination = await prisma.childExamination.create({
      data: {
        childId,
        scheduleId,
        examinationDate: new Date(),
        weight: parseFloat(weight),
        height: parseFloat(height),
        headCircumference: parseFloat(headCircumference),
        armCircumference: parseFloat(armCircumference),
        immunization: immunization || '-',
        notes
      },
      include: {
        child: true,
        schedule: true
      }
    });

    res.json({ message: 'Examination saved successfully', data: examination });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get examinations by schedule
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

// ============ USER FUNCTIONS ============

// Get upcoming schedules (for user registration)
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

// Register for posyandu
const registerForPosyandu = async (req, res) => {
  try {
    const { scheduleId, childId } = req.body;
    const userId = req.user.id;

    // Validasi input
    if (!scheduleId || !childId) {
      return res.status(400).json({ message: 'Schedule ID and Child ID are required' });
    }

    // Check if schedule exists
    const schedule = await prisma.posyanduSchedule.findUnique({
      where: { id: scheduleId }
    });

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    // Check if child exists and belongs to user
    const child = await prisma.childData.findUnique({
      where: { id: childId }
    });

    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }

    if (child.userId !== userId) {
      return res.status(403).json({ message: 'You do not have permission to register this child' });
    }

    // PERBAIKAN: Check existing registration dengan unique constraint
    const existingRegistration = await prisma.posyanduRegistration.findUnique({
      where: {
        scheduleId_childId: {
          scheduleId: scheduleId,
          childId: childId
        }
      }
    });

    // Jika sudah ada dan bukan CANCELLED, tolak
    if (existingRegistration && existingRegistration.status !== 'CANCELLED') {
      return res.status(400).json({ 
        message: 'This child is already registered for this schedule',
        currentStatus: existingRegistration.status
      });
    }

    // Jika sudah ada tapi CANCELLED, update status jadi REGISTERED lagi
    if (existingRegistration && existingRegistration.status === 'CANCELLED') {
      const updatedRegistration = await prisma.posyanduRegistration.update({
        where: { id: existingRegistration.id },
        data: { 
          status: 'REGISTERED',
          registeredAt: new Date() // Update waktu registrasi
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

    // Create new registration jika belum ada sama sekali
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
// Cancel registration
const cancelRegistration = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const userId = req.user.id;

    // Check if registration belongs to user
    const registration = await prisma.posyanduRegistration.findFirst({
      where: {
        id: registrationId,
        userId: userId
      }
    });

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    if (registration.status !== 'REGISTERED') {
      return res.status(400).json({ message: 'Cannot cancel this registration' });
    }

    await prisma.posyanduRegistration.update({
      where: { id: registrationId },
      data: { status: 'CANCELLED' }
    });

    res.json({ message: 'Registration cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get my registrations
const getMyRegistrations = async (req, res) => {
  try {
    const userId = req.user.id;

    const registrations = await prisma.posyanduRegistration.findMany({
      where: {
        userId: userId
      },
      include: {
        child: true,
        schedule: true
      },
      orderBy: {
        registeredAt: 'desc'
      }
    });

    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get examination history for user's children
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

    res.json(examinations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get latest examination for each child
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

module.exports = {
  createSchedule,
  getAllSchedules,
  getScheduleDetail,
  searchChildByNIK,
  getAllChildren,
  createExamination,
  getExaminationsBySchedule,
  getUpcomingSchedules,
  registerForPosyandu,
  cancelRegistration,
  getMyRegistrations,
  getMyChildrenExaminations,
  getLatestExaminations
};