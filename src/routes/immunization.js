// Add these routes to your posyandu routes file

const express = require('express');
const router = express.Router();
const {
  createImmunizationTemplate,
  getAllImmunizationTemplates,
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

// Create immunization template
router.post('/immunization/template', protect, admin, createImmunizationTemplate);

// Get all immunization templates
router.get('/immunization/templates', protect, getAllImmunizationTemplates);

// ============================================
// CHILD IMMUNIZATION ROUTES
// ============================================

// Get child's immunization records
router.get('/child/:childId/immunizations', protect, getChildImmunizations);

// Get child's immunization roadmap (dengan progress)
router.get('/child/:childId/immunization-roadmap', protect, getChildImmunizationRoadmap);

// Record/Add immunization for child (admin input)
router.post('/child/:childId/immunization', protect, admin, recordChildImmunization);

// Update immunization record
router.put('/immunization/:immunizationId', protect, admin, updateChildImmunization);

// Delete immunization record
router.delete('/immunization/:immunizationId', protect, admin, deleteChildImmunization);

// ============================================
// ADMIN IMMUNIZATION STATUS ROUTES
// ============================================

// Get all children immunization status
router.get('/immunization/status/all', protect, admin, getAllChildrenImmunizationStatus);

module.exports = router;