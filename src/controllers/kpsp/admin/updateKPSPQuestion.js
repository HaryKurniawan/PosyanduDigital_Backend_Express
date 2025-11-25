const prisma = require('../../../config/prisma');

// Update KPSP question (Admin)
const updateKPSPQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { questionText, developmentArea, instruction } = req.body;

    const question = await prisma.kPSPQuestion.update({
      where: { id },
      data: {
        questionText,
        developmentArea,
        instruction
      }
    });

    res.json({
      message: 'KPSP question updated successfully',
      data: question
    });
  } catch (error) {
    console.error('Error in updateKPSPQuestion:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = updateKPSPQuestion;
