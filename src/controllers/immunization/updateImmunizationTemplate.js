const prisma = require('../../config/prisma');

// Update immunization template
const updateImmunizationTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { ageRange, ageInMonths, vaccineList } = req.body;

    // Verify template exists
    const template = await prisma.immunizationTemplate.findUnique({
      where: { id },
      include: { vaccines: true }
    });

    if (!template) {
      return res.status(404).json({ message: 'Template tidak ditemukan' });
    }

    // Delete existing vaccines
    await prisma.immunizationVaccine.deleteMany({
      where: { templateId: id }
    });

    // Update template and create new vaccines
    const updated = await prisma.immunizationTemplate.update({
      where: { id },
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
      message: 'Template imunisasi berhasil diubah',
      data: updated
    });
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = updateImmunizationTemplate;