const Tour = require('../models/tourModel');

// Getting infomation about tours
exports.getAllTours = async (req, res) => {
    try {
        // 1A) Filtering
        const queryObj = { ...req.query };
        const excludedFields = ['page', 'sort', 'limit', 'feilds'];
        excludedFields.forEach(el => delete queryObj[el]);

        // 1B) Advance Filtering
        let queryStr = JSON.stringify(req.query);
        queryStr = JSON.parse(
            queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)
        );

        let query = Tour.find(queryStr);

        // 2) Sorting
        if (req.query.sort) {
            query = query.sort(req.query.sort);
        } else {
            query = query.sort('-createdAt');
        }

        // 3) Feild Limiting
        if (req.query.fields) {
            query = query.select(req.query.fields);
        } else {
            query = query.select('-__V');
        }

        // 4) Pagination
        const page = +req.query.page || 1;
        const limit = +req.query.limit || 10;

        query = query.skip(page - 1 * limit).limit(limit);

        //  Executing the query
        const tours = await query;

        // SEND RESPONSE
        res.status(200).json({
            status: 'success',
            results: tours.length,
            data: {
                tours,
            },
        });
    } catch (err) {
        res.status(404).json({ status: 'failed', message: err });
    }
};

// Getting Single Tour
exports.getOneTour = async (req, res) => {
    try {
        const { id } = req.params;
        const tour = await Tour.findById(id);
        res.status(200).json({
            status: 'success',
            data: { tour },
        });
    } catch (err) {
        res.status(404).json({ status: 'failed', messsage: err });
    }
};

// Creating new Tours
exports.createTour = async (req, res) => {
    try {
        const newTour = await Tour.create(req.body);
        res.status(200).json({
            status: 'success',
            data: {
                tour: newTour,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: 'failed',
            message: 'Invalid data sent!',
        });
    }
};

// Editing existing tours
exports.editTour = async (req, res) => {
    try {
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        res.status(200).json({
            status: 'success',
            tour,
        });
    } catch (err) {
        res.status(404).json({ status: 'failed', messsage: err });
    }
};

// Deleting existing tour
exports.deleteTour = async (req, res) => {
    try {
        await Tour.findByIdAndDelete(req.params.id);
        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (err) {
        res.status(404).json({ status: 'failed', messsage: err });
    }
};
