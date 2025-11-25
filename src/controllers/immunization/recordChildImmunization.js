const prisma = require('../../config/prisma');

// Add/Record immunization for child
const recordChildImmunization = async (req, res) => {
  try {
    const {
      childId,
      vaccineId,
      vaccinationDate,
      scheduleId,
      notes,
      administeredBy
    } = req.body;

    // Verify child exists
    const child = await prisma.childData.findUnique({
      where: { id: childId }
    });

    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }

    // Verify vaccine exists
    const vaccine = await prisma.immunizationVaccine.findUnique({
      where: { id: vaccineId }
    });

    if (!vaccine) {
      return res.status(404).json({ message: 'Vaccine not found' });
    }

    // Check if immunization already exists
    const existing = await prisma.childImmunization.findFirst({
      where: {
        childId,
        vaccineId,
        vaccinationDate: new Date(vaccinationDate)
      }
    });

    if (existing) {
      return res.status(400).json({ 
        message: 'This immunization record already exists for this date' 
      });
    }

    const immunization = await prisma.childImmunization.create({
      data: {
        childId,
        vaccineId,
        vaccinationDate: new Date(vaccinationDate),
        scheduleId: scheduleId || null,
        status: 'COMPLETED',
        notes,
        administeredBy
      },
      include: {
        vaccine: true,
        child: {
          select: {
            fullName: true,
            nik: true,
            birthDate: true
          }
        }
      }
    });

    res.json({ 
      message: 'Immunization recorded successfully', 
      data: immunization 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = recordChildImmunization;
