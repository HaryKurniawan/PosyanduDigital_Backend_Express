// routes/posyanduRoutes.js
// ⚠️ URUTAN ROUTES SANGAT PENTING DI EXPRESS!
// Letakkan routes yang LEBIH SPESIFIK dulu (dengan path statis), 
// baru routes dengan parameter dinamis

const express = require('express');
const router = express.Router();
const {
  createImmunizationTemplate,
  getAllImmunizationTemplates,
  updateImmunizationTemplate,
  deleteImmunizationTemplate,
  getChildImmunizations,
  recordChildImmunization,
  updateChildImmunization,
  deleteChildImmunization,
  getChildImmunizationRoadmap,
  getAllChildrenImmunizationStatus
} = require('../controllers/immunizationController');
const { protect, admin } = require('../middleware/authMiddleware');

// ============================================
// IMMUNIZATION TEMPLATE ROUTES (ADMIN ONLY)
// ============================================
// ✅ URUTAN BENAR: Spesifik → Umum

// 1. POST - Create (spesifik: base path + POST)
router.post('/immunization/template', protect, admin, createImmunizationTemplate);

// 2. GET dengan static path - Get all (LETAKKAN SEBELUM parametric routes!)
router.get('/immunization/templates', protect, getAllImmunizationTemplates);

// 3. PUT dengan parameter (parametric route)
router.put('/immunization/template/:id', protect, admin, updateImmunizationTemplate);

// 4. DELETE dengan parameter (parametric route)
router.delete('/immunization/template/:id', protect, admin, deleteImmunizationTemplate);

// ============================================
// CHILD IMMUNIZATION ROUTES
// ============================================

// Get all children immunization status (SPESIFIK - static path)
router.get('/immunization/status/all', protect, admin, getAllChildrenImmunizationStatus);

// Get child's immunization records (parametric)
router.get('/child/:childId/immunizations', protect, getChildImmunizations);

// Get child's immunization roadmap (parametric)
router.get('/child/:childId/immunization-roadmap', protect, getChildImmunizationRoadmap);

// Record/Add immunization for child (parametric POST)
router.post('/child/:childId/immunization', protect, admin, recordChildImmunization);

// Update immunization record (parametric)
router.put('/immunization/:immunizationId', protect, admin, updateChildImmunization);

// Delete immunization record (parametric)
router.delete('/immunization/:immunizationId', protect, admin, deleteChildImmunization);

module.exports = router;