const prisma = require('../../config/prisma');

// Get all children immunization status (admin)
const getAllChildrenImmunizationStatus = async (req, res) => {
  try {
    const children = await prisma.childData.findMany({
      include: {
        immunizations: {
          where: { status: 'COMPLETED' },
          include: { vaccine: true }
        },
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

    const childrenStatus = children.map(child => {
      const completedCount = child.immunizations.length;
      
      return {
        id: child.id,
        fullName: child.fullName,
        nik: child.nik,
        birthDate: child.birthDate,
        parentName: child.user.name,
        completedImmunizations: completedCount,
        lastVaccination: child.immunizations.length > 0 
          ? new Date(Math.max(...child.immunizations.map(i => new Date(i.vaccinationDate))))
          : null
      };
    });

    res.json(childrenStatus);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = getAllChildrenImmunizationStatus;
