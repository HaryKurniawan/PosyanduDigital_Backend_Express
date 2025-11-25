const prisma = require('../../../config/prisma');

// Create child examination WITH VACCINATION RECORDING
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
      vaccineIds // Array of vaccine IDs
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

    // Record vaccinations if provided
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

module.exports = createExamination;
