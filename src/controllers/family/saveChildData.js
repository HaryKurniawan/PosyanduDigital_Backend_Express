const prisma = require('../../config/prisma');

// Save child data
const saveChildData = async (req, res) => {
  try {
    const { children } = req.body;

    // Delete existing children
    await prisma.childData.deleteMany({
      where: { userId: req.user.id }
    });

    // Create new children data
    const childrenData = await prisma.childData.createMany({
      data: children.map(child => ({
        userId: req.user.id,
        fullName: child.fullName,
        nik: child.nik,
        birthCertificate: child.birthCertificate,
        childOrder: child.childOrder,
        bloodType: child.bloodType,
        birthPlace: child.birthPlace,
        birthDate: new Date(child.birthDate)
      }))
    });

    res.json({ message: 'Children data saved successfully', data: childrenData });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = saveChildData;