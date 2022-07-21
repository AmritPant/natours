const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Aliases
exports.aliasTopTour = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = 'price -ratingsAverage';
    req.query.fields = 'name price ratingsAverage summary difficulty';

    next();
};

// Getting infomation about tours
exports.getAllTours = catchAsync(async (req, res, next) => {
    //  Executing the query
    const features = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .limit()
        .paginate();

    const tours = await features.query;

    // SEND RESPONSE
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours,
        },
    });
});

// Getting Single Tour
exports.getOneTour = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const tour = await Tour.findById(id);

    if (!tour) {
        return next(new AppError('No Tour Found with that Id', 404));
    }

    res.status(200).json({
        status: 'success',
        data: { tour },
    });
});

// Creating new Tours
exports.createTour = catchAsync(async (req, res, next) => {
    const newTour = await Tour.create(req.body);
    res.status(200).json({
        status: 'success',
        data: {
            tour: newTour,
        },
    });
});

// Editing existing tours
exports.editTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!tour) {
        return next(new AppError('No Tour Found with that  Id', 404));
    }

    res.status(200).json({
        status: 'success',
        tour,
    });
});

// Deleting existing tour
exports.deleteTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndDelete(req.params.id);

    if (!tour) {
        return next(new AppError('No Tour Found with that  Id', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null,
    });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } },
        },
        {
            $group: {
                _id: { $toUpper: '$difficulty' },
                numTours: { $sum: 1 },
                numRatings: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
            },
        },
        {
            $sort: { avgPrice: -1 },
        },
    ]);

    // Sending the Statistics
    res.status(200).json({ status: 'success', data: { stats } });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    //2021
    const year = +req.params.year;
    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates',
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`),
                },
            },
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numToursStarts: { $sum: 1 },
                tours: { $push: '$name' },
            },
        },
        {
            $addFields: { month: '$_id' },
        },
        {
            $project: { _id: 0 },
        },
        {
            $sort: { numToursStarts: -1 },
        },
        {
            $limit: 12,
        },
    ]);

    res.status(200).json({ status: 'success', data: { plan } });
});
