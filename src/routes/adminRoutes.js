const express = require('express');
const router = express.Router();
const {
  getAllChildren,
  getFamilyDataByChildId,
  getAllFamilies
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// All routes require authentication and admin role
router.get('/children', protect, admin, getAllChildren);
router.get('/child/:childId/family-data', protect, admin, getFamilyDataByChildId);
router.get('/families', protect, admin, getAllFamilies);

module.exports = router;