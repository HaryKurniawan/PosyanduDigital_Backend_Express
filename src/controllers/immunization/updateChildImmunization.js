const prisma = require('../../config/prisma');

// Update immunization record
const updateChildImmunization = async (req, res) => {
  try {
    const { immunizationId } = req.params;
    const {
      vaccinationDate,
      notes,
      administeredBy,
      status
    } = req.body;

    const immunization = await prisma.childImmunization.findUnique({
      where: { id: immunizationId },
      include: {
        child: true
      }
    });

    if (!immunization) {
      return res.status(404).json({ message: 'Immunization record not found' });
    }

    const updated = await prisma.childImmunization.update({
      where: { id: immunizationId },
      data: {
        vaccinationDate: vaccinationDate ? new Date(vaccinationDate) : undefined,
        notes: notes !== undefined ? notes : undefined,
        administeredBy: administeredBy !== undefined ? administeredBy : undefined,
        status: status || undefined
      },
      include: {
        vaccine: true,
        child: {
          select: {
            fullName: true,
            nik: true
          }
        }
      }
    });

    res.json({ 
      message: 'Immunization updated successfully', 
      data: updated 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = updateChildImmunization;
