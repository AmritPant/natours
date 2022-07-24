const crypto = require('crypto');
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

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    const cookieOptions = {
        maxAge:
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 100,
        httpOnly: true,
    };

    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    res.cookie('jwt', token, cookieOptions);
    user.password = undefined;
    user.active = undefined;

    res.status(statusCode).json({
        status: 'success',
        token: token,
        data: {
            user,
        },
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt,
    });
    createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    //  1) Check If Email and Password Exist;
    if (!email || !password)
        return next(new AppError('Please Provide Email and Password', 400));

    //  2)  Check if the user exist password is correct
    console.log(email);
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password)))
        return next(new AppError('Incorrect email or password', 401));

    //  3) If everythingis ok, send token to clinet
    createSendToken(user, 200, res);
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

    if (!token || token.length < 10)
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

exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) GET the user based on the token
    const hasedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        passwordResetToken: hasedToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    // 2) if the token has not expired and there is a user, set the new password
    if (!user) return next(new AppError('Token is invalid or expired', 400));

    // 3) Update changedPasswordAt proptery for the user
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 4) Log the user in
    createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    //  1) Get the user from the collection
    const user = await User.findById(req.user._id).select('+password');
    if (!user) return next(new AppError('The User no longer exists! '));

    //  2)  Check is posted password is correct
    const status = await user.correctPassword(
        req.body.oldPassword,
        user.password
    );

    if (!status) {
        return next(
            new AppError(
                'Incorrect Password! Please Enter the correct Password',
                404
            )
        );
    }

    //  3) Update the Password
    user.password = req.body.newPassword;
    user.passwordConfirm = req.body.newPasswordConfirm;
    user.passwordChangedAt = Date.now();
    await user.save();

    //  4) Log user In, send JWT
    createSendToken(user, 200, res);
});
