const prisma = require('../../../config/prisma');

const cancelRegistration = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const userId = req.user.id;

    const registration = await prisma.posyanduRegistration.findFirst({
      where: {
        id: registrationId,
        userId: userId
      }
    });

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    if (registration.status !== 'REGISTERED') {
      return res.status(400).json({ message: 'Cannot cancel this registration' });
    }

    await prisma.posyanduRegistration.update({
      where: { id: registrationId },
      data: { status: 'CANCELLED' }
    });

    res.json({ message: 'Registration cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = cancelRegistration;