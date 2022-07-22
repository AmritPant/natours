const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');

// Test Router
const router = express.Router();

// router.param('id', tourController.checkID);

router
    .route('/top-5-cheap')
    .get(tourController.aliasTopTour, tourController.getAllTours);

router.route('/stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
    .route('/')
    .get(authController.protect, tourController.getAllTours)
    .post(tourController.createTour);
router
    .route('/:id')
    .get(tourController.getOneTour)
    .patch(tourController.editTour)
    .delete(
        authController.protect,
        authController.restrictTo.bind(['admin', 'lead-guide']),
        tourController.deleteTour
    );

module.exports = router;
