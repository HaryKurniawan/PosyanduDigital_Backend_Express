const express = require('express');
const router = express.Router();
const {
  createSchedule,
  getAllSchedules,
  getScheduleDetail,
  searchChildByNIK,
  getAllChildren,
  createExamination,
  getExaminationsBySchedule,
  getUpcomingSchedules,
  registerForPosyandu,
  cancelRegistration,
  getMyRegistrations,
  getMyChildrenExaminations,
  getLatestExaminations
} = require('../controllers/posyanduController');
const { protect, admin } = require('../middleware/authMiddleware');

// ============================================
// ADMIN ROUTES
// ============================================
router.post('/schedule', protect, admin, createSchedule);
router.get('/schedules', protect, admin, getAllSchedules);
router.get('/schedule/:scheduleId', protect, admin, getScheduleDetail);
router.get('/search-child/:nik', protect, admin, searchChildByNIK);
router.post('/examination', protect, admin, createExamination);
router.get('/schedule/:scheduleId/examinations', protect, admin, getExaminationsBySchedule);

// ============================================
// USER ROUTES
// ============================================
router.get('/upcoming-schedules', protect, getUpcomingSchedules);
router.post('/register', protect, registerForPosyandu);
router.delete('/registration/:registrationId', protect, cancelRegistration);
router.get('/my-registrations', protect, getMyRegistrations);
router.get('/my-examinations', protect, getMyChildrenExaminations);
router.get('/latest-examinations', protect, getLatestExaminations);

module.exports = router;