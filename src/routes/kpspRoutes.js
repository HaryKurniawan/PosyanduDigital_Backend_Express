const express = require('express');
const router = express.Router();
const {
  getUserChildren,
  getKPSPCategories,
  getKPSPCategoryByCode,
  submitKPSPScreening,
  getChildScreeningHistory,
  getScreeningDetail,
  getAllScreenings,
  getKPSPStatistics,
  createKPSPCategory,
  createKPSPQuestion,
  updateKPSPCategory,
  deleteKPSPCategory,
  updateKPSPQuestion,
  deleteKPSPQuestion
} = require('../controllers/kpspController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// ============================================
// USER ROUTES
// ============================================

// Get user's children for KPSP
router.get('/my-children', protect, getUserChildren);

// Get all KPSP categories with questions
router.get('/categories', protect, getKPSPCategories);

// Get KPSP category by code
router.get('/categories/:code', protect, getKPSPCategoryByCode);

// Submit KPSP screening
router.post('/screenings', protect, submitKPSPScreening);

// Get screening history for a child
router.get('/screenings/child/:childId', protect, getChildScreeningHistory);

// Get single screening detail
router.get('/screenings/:screeningId', protect, getScreeningDetail);

// ============================================
// ADMIN ROUTES
// ============================================

// Get all screenings (with filters)
router.get('/admin/screenings', protect, adminOnly, getAllScreenings);

// Get KPSP statistics
router.get('/admin/statistics', protect, adminOnly, getKPSPStatistics);

// Create KPSP category
router.post('/admin/categories', protect, adminOnly, createKPSPCategory);

// Create KPSP question
router.post('/admin/questions', protect, adminOnly, createKPSPQuestion);

// Update KPSP category
router.put('/admin/categories/:id', protect, adminOnly, updateKPSPCategory);

// Delete KPSP category
router.delete('/admin/categories/:id', protect, adminOnly, deleteKPSPCategory);

// Update KPSP question
router.put('/admin/questions/:id', protect, adminOnly, updateKPSPQuestion);

// Delete KPSP question
router.delete('/admin/questions/:id', protect, adminOnly, deleteKPSPQuestion);

module.exports = router;