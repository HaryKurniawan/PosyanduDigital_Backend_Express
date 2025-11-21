const prisma = require('../config/prisma');

// ============ ADMIN FUNCTIONS ============

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

// ✅ UPDATED - Create child examination WITH VACCINATION RECORDING
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
      notes,
      vaccineIds // ✅ Array of vaccine IDs
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

    // Create examination record
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

    // ✅ NEW - Record vaccinations if provided
    let recordedVaccines = [];
    if (vaccineIds && Array.isArray(vaccineIds) && vaccineIds.length > 0) {
      for (const vaccineId of vaccineIds) {
        try {
          // Check if vaccine already recorded today
          const existing = await prisma.childImmunization.findFirst({
            where: {
              childId,
              vaccineId,
              vaccinationDate: {
                gte: new Date(new Date().setHours(0, 0, 0, 0)),
                lt: new Date(new Date().setHours(23, 59, 59, 999))
              }
            }
          });

          if (!existing) {
            const vaccineRecord = await prisma.childImmunization.create({
              data: {
                childId,
                vaccineId,
                scheduleId,
                vaccinationDate: new Date(),
                status: 'COMPLETED',
                administeredBy: req.user?.name || 'Admin Posyandu',
                notes: `Diberikan saat pemeriksaan di ${examination.schedule.location}`
              },
              include: {
                vaccine: true
              }
            });
            recordedVaccines.push(vaccineRecord);
          }
        } catch (vaccineError) {
          console.error(`Error recording vaccine ${vaccineId}:`, vaccineError);
          // Continue with other vaccines even if one fails
        }
      }
    }

    res.json({ 
      message: 'Examination saved successfully', 
      data: {
        examination,
        recordedVaccines,
        vaccineCount: recordedVaccines.length
      }
    });
  } catch (error) {
    console.error('Error in createExamination:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

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

// ✅ NEW - Get examination detail with vaccines
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

// ============ USER FUNCTIONS ============

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

const cancelRegistration = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const userId = req.user.id;

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

// ✅ UPDATED - Get examination history with vaccines
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

    // ✅ Get vaccines for each examination
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
  getExaminationDetail, // ✅ NEW
  getUpcomingSchedules,
  registerForPosyandu,
  cancelRegistration,
  getMyRegistrations,
  getMyChildrenExaminations,
  getLatestExaminations
};