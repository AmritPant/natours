const express = require('express');
const tourController = require('../controllers/tourController');

// Test Router
const router = express.Router();

// router.param('id', tourController.checkID);

router
    .route('/')
    .get(tourController.getAllTours)
    .post(tourController.createTour);
router
    .route('/:id')
    .get(tourController.getOneTour)
    .patch(tourController.editTour)
    .delete(tourController.deleteTour);

module.exports = router;
