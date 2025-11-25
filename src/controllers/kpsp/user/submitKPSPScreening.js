const prisma = require('../../../config/prisma');

// Submit KPSP screening
const submitKPSPScreening = async (req, res) => {
  try {
    const { childId, categoryId, answers, ageAtScreening, notes } = req.body;

    // Verify child belongs to user
    const child = await prisma.childData.findFirst({
      where: {
        id: childId,
        userId: req.user.id
      }
    });

    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }

    // Calculate results
    const totalYes = answers.filter(a => a.answer === true).length;
    const totalNo = answers.filter(a => a.answer === false).length;
    const percentage = (totalYes / answers.length) * 100;

    // Determine result based on percentage
    let result;
    if (percentage >= 80) {
      result = 'SESUAI';
    } else if (percentage >= 50) {
      result = 'MERAGUKAN';
    } else {
      result = 'PENYIMPANGAN';
    }

    // Get recommended action
    let recommendedAction;
    if (result === 'SESUAI') {
      recommendedAction = 'Perkembangan anak sesuai. Lanjutkan pemantauan rutin dan berikan stimulasi sesuai usia.';
    } else if (result === 'MERAGUKAN') {
      recommendedAction = 'Anak perlu stimulasi tambahan. Ulangi skrining setelah 2 minggu dengan stimulasi intensif. Konsultasikan dengan petugas kesehatan.';
    } else {
      recommendedAction = 'Kemungkinan ada penyimpangan perkembangan. Segera rujuk ke dokter spesialis anak atau ahli tumbuh kembang untuk evaluasi lebih lanjut.';
    }

    // Create screening record with answers
    const screening = await prisma.kPSPScreening.create({
      data: {
        childId,
        categoryId,
        ageAtScreening,
        totalYes,
        totalNo,
        result,
        notes,
        recommendedAction,
        answers: {
          create: answers.map(answer => ({
            questionId: answer.questionId,
            answer: answer.answer
          }))
        }
      },
      include: {
        child: {
          select: {
            fullName: true,
            birthDate: true
          }
        },
        category: {
          select: {
            name: true,
            code: true
          }
        },
        answers: {
          include: {
            question: true
          }
        }
      }
    });

    res.json({
      message: 'KPSP screening submitted successfully',
      data: screening
    });
  } catch (error) {
    console.error('Error in submitKPSPScreening:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = submitKPSPScreening;