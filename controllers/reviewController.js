const catchAsync = require('../utils/catchAsync');
const Review = require('../models/reviewModel');

// GETTING  ALL THE TOUR
exports.getAllReview = catchAsync(async (req, res, next) => {
    const reviews = await Review.find({});

    res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: { reviews },
    });
});

// CREATING NEW TOUR
exports.createReview = catchAsync(async (req, res, next) => {
    // Allowing Nested Routes
    if (!req.body.tour) req.body.tour = req.params.tourId;
    req.body.user = req.user._id;

    const review = await Review.create(req.body);
    res.status(201).json({ status: 'sucess', data: review });
});
