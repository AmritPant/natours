const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};

    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });

    return newObj;
};

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

exports.getMe = (req, res, next) => {
    req.params.id = req.user._id;
    next();
};
exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User); // DO NOT UPDATE PASSWORD WITH THIS ONE
exports.deleteUser = factory.deleteOne(User);
