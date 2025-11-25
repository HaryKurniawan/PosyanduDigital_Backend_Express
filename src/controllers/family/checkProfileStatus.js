const prisma = require('../../config/prisma');

// Check if user has completed profile
const checkProfileStatus = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        hasCompletedProfile: true
      }
    });

    res.json({ hasCompletedProfile: user.hasCompletedProfile });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = checkProfileStatus;