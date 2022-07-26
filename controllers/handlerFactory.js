const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = Model =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndDelete(req.params.id);

        if (!doc) {
            return next(new AppError('No document Found with that  Id', 404));
        }

        res.status(204).json({
            status: 'success',
            data: null,
        });
    });

exports.updateOne = Model =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!doc) {
            return next(new AppError('No doc Found with that  Id', 404));
        }

        res.status(200).json({
            status: 'success',
            data: {
                data: doc,
            },
        });
    });
exports.createOne = Model =>
    catchAsync(async (req, res, next) => {
        const data = await Model.create(req.body);
        res.status(200).json({
            status: 'success',
            data: {
                tour: data,
            },
        });
    });
exports.getOne = (Model, popOptions) =>
    catchAsync(async (req, res, next) => {
        let query = Model.findById(req.params.id);

        if (popOptions) query = query.populate(popOptions);

        const doc = await query;
        if (!doc) {
            return next(new AppError('No doc Found with that Id', 404));
        }

        res.status(200).json({
            status: 'success',
            data: { doc },
        });
    });
exports.getAll = Model =>
    catchAsync(async (req, res, next) => {
        const filter = req.params.tourId ? { tour: req.params.tourId } : {};

        //  Executing the query
        const features = new APIFeatures(Model.find(filter), req.query)
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
