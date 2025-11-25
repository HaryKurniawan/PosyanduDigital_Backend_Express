const prisma = require('../../../config/prisma');

// Create KPSP question (Admin)
const createKPSPQuestion = async (req, res) => {
  try {
    const {
      categoryId,
      questionNumber,
      questionText,
      developmentArea,
      instruction
    } = req.body;

    const question = await prisma.kPSPQuestion.create({
      data: {
        categoryId,
        questionNumber,
        questionText,
        developmentArea,
        instruction
      }
    });

    res.json({
      message: 'KPSP question created successfully',
      data: question
    });
  } catch (error) {
    console.error('Error in createKPSPQuestion:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = createKPSPQuestion;
