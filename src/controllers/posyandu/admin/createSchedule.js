const prisma = require('../../../config/prisma');

const createSchedule = async (req, res) => {
  try {
    const { scheduleDate, location, description } = req.body;

    const schedule = await prisma.posyanduSchedule.create({
      data: {
        scheduleDate: new Date(scheduleDate),
        location,
        description
      }
    });

    res.json({ message: 'Schedule created successfully', data: schedule });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = createSchedule;