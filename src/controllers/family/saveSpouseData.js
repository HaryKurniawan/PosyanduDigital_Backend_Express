const prisma = require('../../config/prisma');

// Save spouse data
const saveSpouseData = async (req, res) => {
  try {
    const { fullName, nik, occupation, phoneNumber } = req.body;

    const spouseData = await prisma.spouseData.upsert({
      where: { userId: req.user.id },
      update: {
        fullName,
        nik,
        occupation,
        phoneNumber
      },
      create: {
        userId: req.user.id,
        fullName,
        nik,
        occupation,
        phoneNumber
      }
    });

    res.json({ message: 'Spouse data saved successfully', data: spouseData });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = saveSpouseData;
