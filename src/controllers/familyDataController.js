const prisma = require('../config/prisma');

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

// Get all family data for current user
const getFamilyData = async (req, res) => {
  try {
    const familyData = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        motherData: true,
        spouseData: true,
        childrenData: {
          orderBy: {
            childOrder: 'asc'
          }
        }
      }
    });

    res.json(familyData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

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

// Complete profile submission
const completeProfile = async (req, res) => {
  try {
    // Update user profile status
    await prisma.user.update({
      where: { id: req.user.id },
      data: { hasCompletedProfile: true }
    });

    res.json({ message: 'Profile completed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  checkProfileStatus,
  getFamilyData,
  saveMotherData,
  saveSpouseData,
  saveChildData,
  completeProfile
};
