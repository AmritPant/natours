const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

const getAllUsers = catchAsync(async (req, res, next) => {
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

const createUser = (req, res) =>
    res.status(500).json({
        status: 'error',
        message: 'this route is not yet defined',
    });
const getUser = (req, res) =>
    res.status(500).json({
        status: 'error',
        message: 'this route is not yet defined',
    });
const updateUser = (req, res) =>
    res.status(500).json({
        status: 'error',
        message: 'this route is not yet defined',
    });
const deleteUser = (req, res) =>
    res.status(500).json({
        status: 'error',
        message: 'this route is not yet defined',
    });

module.exports = { deleteUser, updateUser, getUser, createUser, getAllUsers };
