const prisma = require('../../../config/prisma');

// Delete KPSP category (Admin)
const deleteKPSPCategory = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.kPSPAgeCategory.delete({
      where: { id }
    });

    res.json({ message: 'KPSP category deleted successfully' });
  } catch (error) {
    console.error('Error in deleteKPSPCategory:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = deleteKPSPCategory;

