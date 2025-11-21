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
  getExaminationDetail, // ✅ NEW
  getUpcomingSchedules,
  registerForPosyandu,
  cancelRegistration,
  getMyRegistrations,
  getMyChildrenExaminations,
  getLatestExaminations
} = require('../controllers/posyanduController');

const immunizationController = require('../controllers/immunizationController');
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
router.get('/examination/:examinationId', protect, admin, getExaminationDetail); // ✅ NEW

// ============================================
// IMMUNIZATION ROUTES
// ============================================
router.get('/immunization/templates', immunizationController.getAllImmunizationTemplates);
router.post('/immunization/template', protect, admin, immunizationController.createImmunizationTemplate);

router.get('/child/:childId/immunizations', protect, immunizationController.getChildImmunizations);
router.post('/child/immunization', protect, admin, immunizationController.recordChildImmunization);
router.put('/immunization/:immunizationId', protect, admin, immunizationController.updateChildImmunization);
router.delete('/immunization/:immunizationId', protect, admin, immunizationController.deleteChildImmunization);

router.get('/child/:childId/immunization-roadmap', protect, immunizationController.getChildImmunizationRoadmap);
router.get('/immunization/status/all', protect, admin, immunizationController.getAllChildrenImmunizationStatus);

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