const prisma = require('../../../config/prisma');

const getMyRegistrations = async (req, res) => {
  try {
    const userId = req.user.id;

    const registrations = await prisma.posyanduRegistration.findMany({
      where: {
        userId: userId
      },
      include: {
        child: true,
        schedule: true
      },
      orderBy: {
        registeredAt: 'desc'
      }
    });

    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = getMyRegistrations;

