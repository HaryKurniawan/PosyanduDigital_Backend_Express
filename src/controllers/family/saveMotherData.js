const prisma = require('../../config/prisma');

// Save mother data
const saveMotherData = async (req, res) => {
  try {
    const {
      fullName,
      phoneNumber,
      nik,
      birthPlace,
      birthDate,
      education,
      occupation,
      bloodType,
      jkn,
      facilityTK1
    } = req.body;

    const motherData = await prisma.motherData.upsert({
      where: { userId: req.user.id },
      update: {
        fullName,
        phoneNumber,
        nik,
        birthPlace,
        birthDate: new Date(birthDate),
        education,
        occupation,
        bloodType,
        jkn,
        facilityTK1
      },
      create: {
        userId: req.user.id,
        fullName,
        phoneNumber,
        nik,
        birthPlace,
        birthDate: new Date(birthDate),
        education,
        occupation,
        bloodType,
        jkn,
        facilityTK1
      }
    });

    res.json({ message: 'Mother data saved successfully', data: motherData });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = saveMotherData;