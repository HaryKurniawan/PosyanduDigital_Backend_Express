const prisma = require('../../config/prisma');

const deleteChildImmunization = async (req, res) => {
  try {
    const { immunizationId } = req.params;

    const immunization = await prisma.childImmunization.findUnique({
      where: { id: immunizationId }
    });

    if (!immunization) {
      return res.status(404).json({ message: 'Immunization record not found' });
    }

    await prisma.childImmunization.delete({
      where: { id: immunizationId }
    });

    res.json({ message: 'Immunization record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = deleteChildImmunization;