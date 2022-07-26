const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const reviewRouter = express.Router({ mergeParams: true });

reviewRouter.use(authController.protect);
reviewRouter
    .route('/')
    .get(authController.protect, reviewController.getAllReview)
    .post(
        authController.restrictTo.bind('user'),
        reviewController.setTourAndUserId,
        reviewController.createReview
    );

reviewRouter
    .route('/:id')
    .delete(
        authController.restrictTo.bind(['user', 'admin']),
        reviewController.deleteReview
    )
    .patch(
        authController.restrictTo.bind(['user', 'admin']),
        reviewController.updateReview
    )
    .get(reviewController.getReview);

module.exports = reviewRouter;
