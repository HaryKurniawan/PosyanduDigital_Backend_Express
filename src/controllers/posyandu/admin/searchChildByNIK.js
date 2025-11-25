const prisma = require('../../../config/prisma');

const searchChildByNIK = async (req, res) => {
  try {
    const { nik } = req.params;

    const child = await prisma.childData.findUnique({
      where: { nik },
      include: {
        user: {
          include: {
            motherData: true,
            spouseData: true
          }
        }
      }
    });

    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }

    res.json(child);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = searchChildByNIK;

