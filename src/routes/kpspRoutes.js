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


// USER ROUTES

router.get('/my-children', protect, getUserChildren);
router.get('/categories', protect, getKPSPCategories);
router.get('/categories/:code', protect, getKPSPCategoryByCode);
router.post('/screenings', protect, submitKPSPScreening);
router.get('/screenings/child/:childId', protect, getChildScreeningHistory);
router.get('/screenings/:screeningId', protect, getScreeningDetail);

// ADMIN ROUTES

router.get('/admin/screenings', protect, adminOnly, getAllScreenings);
router.get('/admin/statistics', protect, adminOnly, getKPSPStatistics);
router.post('/admin/categories', protect, adminOnly, createKPSPCategory);
router.post('/admin/questions', protect, adminOnly, createKPSPQuestion);
router.put('/admin/categories/:id', protect, adminOnly, updateKPSPCategory);
router.delete('/admin/categories/:id', protect, adminOnly, deleteKPSPCategory);
router.put('/admin/questions/:id', protect, adminOnly, updateKPSPQuestion);
router.delete('/admin/questions/:id', protect, adminOnly, deleteKPSPQuestion);

module.exports = router;