const prisma = require('../../config/prisma');

const createImmunizationTemplate = async (req, res) => {
  try {
    const {
      ageRange,
      ageInMonths,
      vaccineList
    } = req.body;

    const template = await prisma.immunizationTemplate.create({
      data: {
        ageRange,
        ageInMonths,
        vaccines: {
          createMany: {
            data: vaccineList.map(vaccine => ({
              name: vaccine.nama,
              dose: vaccine.dosis,
              description: vaccine.keterangan,
              recommendedAge: vaccine.umur
            }))
          }
        }
      },
      include: {
        vaccines: true
      }
    });

    res.json({ 
      message: 'Immunization template created successfully', 
      data: template 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = createImmunizationTemplate;