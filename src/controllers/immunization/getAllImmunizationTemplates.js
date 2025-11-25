const prisma = require('../../config/prisma');

// Get all immunization templates
const getAllImmunizationTemplates = async (req, res) => {
  try {
    const templates = await prisma.immunizationTemplate.findMany({
      include: {
        vaccines: {
          orderBy: {
            dose: 'asc'
          }
        }
      },
      orderBy: {
        ageInMonths: 'asc'
      }
    });

    res.json(templates);
  } catch (error) {
    console.error('❌ Error fetching immunization templates:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = getAllImmunizationTemplates;
