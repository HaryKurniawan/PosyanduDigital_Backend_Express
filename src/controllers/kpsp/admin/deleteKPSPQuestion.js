const prisma = require('../../../config/prisma');

// Delete KPSP question (Admin)
const deleteKPSPQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.kPSPQuestion.delete({
      where: { id }
    });

    res.json({ message: 'KPSP question deleted successfully' });
  } catch (error) {
    console.error('Error in deleteKPSPQuestion:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = deleteKPSPQuestion;