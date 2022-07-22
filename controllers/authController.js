const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = id =>
    jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt,
    });

    const token = signToken(newUser._id);

    res.status(201).json({
        status: 'success',
        token: token,
        data: {
            user: newUser,
        },
    });
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    //  1) Check If Email and Password Exist;
    if (!email || !password)
        return next(new AppError('Please Provide Email and Password', 400));

    //  2)  Check if the user exist password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password)))
        return next(new AppError('Incorrect email or password', 401));

    //  3) If everythingis ok, send token to clinet
    const token = signToken(user._id);

    res.status(200).json({
        status: 'success',
        token,
    });
});

exports.protect = catchAsync(async (req, res, next) => {
    // 1) Getting token and check if it's there
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token)
        return next(
            new AppError(
                'You are not logged In! Please log in to get access',
                401
            )
        );

    // 2) Verfication token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3)  Check if user still exist
    const user = await User.findById(decoded.id);
    if (!user)
        next(
            new AppError(
                'The user belongs to this token does no longer exist',
                401
            )
        );

    // 4) Check if user changed password after the token was issued
    if (user.changesPasswordAfter(decoded.iat)) {
        next(
            new AppError(
                'User recently changed password! Please log in again',
                401
            )
        );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = user;
    next();
});

// exports.restrict
exports.restrictTo = function (req, res, next) {
    if (!this.includes(req.user.role)) {
        return next(
            new AppError(
                "You don't have permission to perform this action",
                403
            )
        );
    }
    next();
};

exports.forgetPassword = catchAsync(async (req, res, next) => {
    // 1)  Get use based on POSTED email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError('There is no user with email address', 404));
    }
    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Send Email to user's email
    const resetURL = `${req.protocol}://${req.get(
        'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forget your password? Submit a PATCH request with your new password and passwordConfirm to ${resetURL}. \n If you didn't forget your password, Please ignore this email!`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your Password reset token (valid for 10 min)',
            message: message,
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        console.log(err);

        await user.save({ validateBeforeSave: false });
        return next(
            new AppError(
                'There was an Eror sending the email. Try again later! ',
                500
            )
        );
    }

    res.status(200).json({
        status: 'sucess',
        messaeg: 'Token send to Email address',
    });
});

exports.resetPassword = (req, res, next) => {};