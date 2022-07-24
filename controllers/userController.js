const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};

    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });

    return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find({});

    // SEND RESPONSE
    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users,
        },
    });
});

exports.updateMe = catchAsync(async (req, res, next) => {
    //Update a use
    if (req.body.password || req.body.passwordConfirm) {
        next(
            new AppError(
                'This route is not for for updating password, Please use /updatePassword Route',
                400
            )
        );
    }

    //  Filter out unwanted feild name
    const filteredObj = filterObj(req.body, 'name', 'email');

    const user = await User.findByIdAndUpdate(req.user.id, filteredObj, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({ status: 'success', data: { user } });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({ status: 'sucess', data: null });
});

exports.createUser = (req, res) =>
    res.status(500).json({
        status: 'error',
        message: 'this route is not yet defined',
    });
exports.getUser = (req, res) =>
    res.status(500).json({
        status: 'error',
        message: 'this route is not yet defined',
    });
exports.updateUser = (req, res) =>
    res.status(500).json({
        status: 'error',
        message: 'this route is not yet defined',
    });
exports.deleteUser = (req, res) =>
    res.status(500).json({
        status: 'error',
        message: 'this route is not yet defined',
    });
