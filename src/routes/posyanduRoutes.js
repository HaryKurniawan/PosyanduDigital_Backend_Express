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
// ADMIN ROUTES (non-immunization)
// ============================================
router.post('/schedule', protect, adminOnly, createSchedule);
router.get('/schedules', protect, adminOnly, getAllSchedules);
router.get('/schedule/:scheduleId', protect, adminOnly, getScheduleDetail);
router.get('/search-child/:nik', protect, adminOnly, searchChildByNIK);
router.post('/examination', protect, adminOnly, createExamination);
router.get('/schedule/:scheduleId/examinations', protect, adminOnly, getExaminationsBySchedule);
router.get('/examination/:examinationId', protect, adminOnly, getExaminationDetail);

// ============================================
// IMMUNIZATION ROUTES (URUTAN SANGAT PENTING!)
// ============================================
// ⚠️ RULE: Static paths HARUS sebelum parametric paths!

// 1️⃣ STATIC PATHS dulu (paling spesifik)
router.get('/immunization/templates', immunizationController.getAllImmunizationTemplates);
router.post('/immunization/template', protect, adminOnly, immunizationController.createImmunizationTemplate);
router.get('/immunization/status/all', protect, adminOnly, immunizationController.getAllChildrenImmunizationStatus);

// 2️⃣ PARAMETRIC PATHS dengan /template/:id (sebelum /immunization/:id)
router.put('/immunization/template/:id', protect, adminOnly, immunizationController.updateImmunizationTemplate);
router.delete('/immunization/template/:id', protect, adminOnly, immunizationController.deleteImmunizationTemplate);

// 3️⃣ PARAMETRIC PATHS dengan /child/:childId (lebih spesifik dari /immunization/:id)
router.get('/child/:childId/immunizations', protect, immunizationController.getChildImmunizations);
router.post('/child/:childId/immunization', protect, adminOnly, immunizationController.recordChildImmunization);
router.get('/child/:childId/immunization-roadmap', protect, immunizationController.getChildImmunizationRoadmap);

// 4️⃣ PARAMETRIC PATHS paling umum (paling akhir!)
router.put('/immunization/:immunizationId', protect, adminOnly, immunizationController.updateChildImmunization);
router.delete('/immunization/:immunizationId', protect, adminOnly, immunizationController.deleteChildImmunization);

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