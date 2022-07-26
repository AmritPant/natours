const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');
// Test Router
const router = express.Router();

// router.param('id', tourController.checkID);
router.use('/:tourId/reviews', reviewRouter); // Mounting the Router

router
    .route('/top-5-cheap')
    .get(tourController.aliasTopTour, tourController.getAllTours);

router.route('/stats').get(tourController.getTourStats);

router
    .route('/monthly-plan/:year')
    .get(
        authController.protect,
        authController.restrictTo.bind(['admin', 'lead-guide', 'guide']),
        tourController.getMonthlyPlan
    );

router
    .route('/')
    .get(tourController.getAllTours)
    .post(
        authController.protect,
        authController.restrictTo.bind(['admin', 'lead-guide']),
        tourController.createTour
    );
router
    .route('/:id')
    .get(tourController.getOneTour)
    .patch(
        authController.protect,
        authController.restrictTo.bind(['admin', 'lead-guide']),
        tourController.editTour
    )
    .delete(
        authController.protect,
        authController.restrictTo.bind(['admin', 'lead-guide']),
        tourController.deleteTour
    );

module.exports = router;
