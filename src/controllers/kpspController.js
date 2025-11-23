const prisma = require('../config/prisma');

// ============================================
// USER KPSP CONTROLLERS
// ============================================

// Get children for KPSP screening (for logged in user)
const getUserChildren = async (req, res) => {
  try {
    const children = await prisma.childData.findMany({
      where: { userId: req.user.id },
      select: {
        id: true,
        fullName: true,
        birthDate: true,
        nik: true
      },
      orderBy: {
        childOrder: 'asc'
      }
    });

    // Calculate age in months for each child
    const childrenWithAge = children.map(child => {
      const birthDate = new Date(child.birthDate);
      const today = new Date();
      const ageInMonths = Math.floor(
        (today - birthDate) / (1000 * 60 * 60 * 24 * 30.44)
      );

      // Determine age range
      let ageRange = null;
      if (ageInMonths >= 0 && ageInMonths < 6) ageRange = '0-6';
      else if (ageInMonths >= 6 && ageInMonths < 12) ageRange = '6-12';
      else if (ageInMonths >= 12 && ageInMonths < 18) ageRange = '12-18';
      else if (ageInMonths >= 18 && ageInMonths <= 24) ageRange = '18-24';

      return {
        ...child,
        ageInMonths,
        ageRange
      };
    });

    res.json(childrenWithAge);
  } catch (error) {
    console.error('Error in getUserChildren:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get KPSP age categories with questions
const getKPSPCategories = async (req, res) => {
  try {
    const categories = await prisma.kPSPAgeCategory.findMany({
      where: { isActive: true },
      include: {
        questions: {
          orderBy: {
            questionNumber: 'asc'
          }
        }
      },
      orderBy: {
        minAgeMonths: 'asc'
      }
    });

    res.json(categories);
  } catch (error) {
    console.error('Error in getKPSPCategories:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get KPSP category by code
const getKPSPCategoryByCode = async (req, res) => {
  try {
    const { code } = req.params;

    const category = await prisma.kPSPAgeCategory.findUnique({
      where: { code },
      include: {
        questions: {
          orderBy: {
            questionNumber: 'asc'
          }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ message: 'KPSP category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error('Error in getKPSPCategoryByCode:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

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

// Get screening history for a child
const getChildScreeningHistory = async (req, res) => {
  try {
    const { childId } = req.params;

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

    const screenings = await prisma.kPSPScreening.findMany({
      where: { childId },
      include: {
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
      },
      orderBy: {
        screeningDate: 'desc'
      }
    });

    res.json(screenings);
  } catch (error) {
    console.error('Error in getChildScreeningHistory:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single screening detail
const getScreeningDetail = async (req, res) => {
  try {
    const { screeningId } = req.params;

    const screening = await prisma.kPSPScreening.findUnique({
      where: { id: screeningId },
      include: {
        child: {
          select: {
            fullName: true,
            birthDate: true,
            userId: true
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
          },
          orderBy: {
            question: {
              questionNumber: 'asc'
            }
          }
        }
      }
    });

    if (!screening) {
      return res.status(404).json({ message: 'Screening not found' });
    }

    // Verify user owns this screening
    if (screening.child.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(screening);
  } catch (error) {
    console.error('Error in getScreeningDetail:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============================================
// ADMIN KPSP CONTROLLERS
// ============================================

// Get all KPSP screenings (Admin)
const getAllScreenings = async (req, res) => {
  try {
    const { result, categoryId, startDate, endDate } = req.query;

    const where = {};

    if (result) {
      where.result = result;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (startDate && endDate) {
      where.screeningDate = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const screenings = await prisma.kPSPScreening.findMany({
      where,
      include: {
        child: {
          select: {
            fullName: true,
            birthDate: true,
            nik: true,
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        category: {
          select: {
            name: true,
            code: true
          }
        }
      },
      orderBy: {
        screeningDate: 'desc'
      }
    });

    res.json(screenings);
  } catch (error) {
    console.error('Error in getAllScreenings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get KPSP statistics (Admin)
const getKPSPStatistics = async (req, res) => {
  try {
    const totalScreenings = await prisma.kPSPScreening.count();

    const resultStats = await prisma.kPSPScreening.groupBy({
      by: ['result'],
      _count: {
        result: true
      }
    });

    const categoryStats = await prisma.kPSPScreening.groupBy({
      by: ['categoryId'],
      _count: {
        categoryId: true
      }
    });

    // Get category names
    const categories = await prisma.kPSPAgeCategory.findMany({
      where: {
        id: {
          in: categoryStats.map(s => s.categoryId)
        }
      },
      select: {
        id: true,
        name: true,
        code: true
      }
    });

    const categoryStatsWithNames = categoryStats.map(stat => ({
      ...stat,
      category: categories.find(c => c.id === stat.categoryId)
    }));

    res.json({
      totalScreenings,
      resultStats,
      categoryStats: categoryStatsWithNames
    });
  } catch (error) {
    console.error('Error in getKPSPStatistics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create KPSP age category (Admin)
const createKPSPCategory = async (req, res) => {
  try {
    const { code, name, minAgeMonths, maxAgeMonths, description } = req.body;

    const category = await prisma.kPSPAgeCategory.create({
      data: {
        code,
        name,
        minAgeMonths,
        maxAgeMonths,
        description
      }
    });

    res.json({
      message: 'KPSP category created successfully',
      data: category
    });
  } catch (error) {
    console.error('Error in createKPSPCategory:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

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

// Update KPSP category (Admin)
const updateKPSPCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, minAgeMonths, maxAgeMonths, description, isActive } = req.body;

    const category = await prisma.kPSPAgeCategory.update({
      where: { id },
      data: {
        code,
        name,
        minAgeMonths,
        maxAgeMonths,
        description,
        isActive
      }
    });

    res.json({
      message: 'KPSP category updated successfully',
      data: category
    });
  } catch (error) {
    console.error('Error in updateKPSPCategory:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

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

module.exports = {
  // User endpoints
  getUserChildren,
  getKPSPCategories,
  getKPSPCategoryByCode,
  submitKPSPScreening,
  getChildScreeningHistory,
  getScreeningDetail,
  // Admin endpoints
  getAllScreenings,
  getKPSPStatistics,
  createKPSPCategory,
  createKPSPQuestion,
  updateKPSPCategory,
  deleteKPSPCategory,
  updateKPSPQuestion,
  deleteKPSPQuestion
};