const prisma = require('../../../config/prisma');

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

module.exports = getAllScreenings;