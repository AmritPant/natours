const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const reviewRouter = express.Router({ mergeParams: true });

reviewRouter
    .route('/')
    .get(authController.protect, reviewController.getAllReview)
    .post(
        authController.protect,
        authController.restrictTo.bind('user'),
        reviewController.createReview
    );

module.exports = reviewRouter;
