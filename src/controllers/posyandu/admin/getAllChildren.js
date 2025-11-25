const prisma = require('../../../config/prisma');

const getAllChildren = async (req, res) => {
  try {
    const children = await prisma.childData.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        fullName: 'asc'
      }
    });

    res.json(children);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = getAllChildren;