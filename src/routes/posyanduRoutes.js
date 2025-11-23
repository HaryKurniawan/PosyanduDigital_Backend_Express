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
  getExaminationDetail,
  getUpcomingSchedules,
  registerForPosyandu,
  cancelRegistration,
  getMyRegistrations,
  getMyChildrenExaminations,
  getLatestExaminations
} = require('../controllers/posyanduController');

const immunizationController = require('../controllers/immunizationController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// ============================================
// ADMIN ROUTES
// ============================================
router.post('/schedule', protect, adminOnly, createSchedule);
router.get('/schedules', protect, adminOnly, getAllSchedules);
router.get('/schedule/:scheduleId', protect, adminOnly, getScheduleDetail);
router.get('/search-child/:nik', protect, adminOnly, searchChildByNIK);
router.post('/examination', protect, adminOnly, createExamination);
router.get('/schedule/:scheduleId/examinations', protect, adminOnly, getExaminationsBySchedule);
router.get('/examination/:examinationId', protect, adminOnly, getExaminationDetail);

// ============================================
// IMMUNIZATION ROUTES
// ============================================
router.get('/immunization/templates', immunizationController.getAllImmunizationTemplates);
router.post('/immunization/template', protect, adminOnly, immunizationController.createImmunizationTemplate);

router.get('/child/:childId/immunizations', protect, immunizationController.getChildImmunizations);
router.post('/child/immunization', protect, adminOnly, immunizationController.recordChildImmunization);
router.put('/immunization/:immunizationId', protect, adminOnly, immunizationController.updateChildImmunization);
router.delete('/immunization/:immunizationId', protect, adminOnly, immunizationController.deleteChildImmunization);

router.get('/child/:childId/immunization-roadmap', protect, immunizationController.getChildImmunizationRoadmap);
router.get('/immunization/status/all', protect, adminOnly, immunizationController.getAllChildrenImmunizationStatus);

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