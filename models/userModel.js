const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { randomBytes, createHash } = require('crypto');

// name ,email, photo,pasword, passwordConfirm ;
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name!'],
    },

    email: {
        type: String,
        required: [true, 'Please provide you email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email'],
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user',
    },
    password: {
        type: String,
        required: [true, 'Please Provide a valid email'],
        minLength: 8,
        select: 0,
    },
    passwordConfirm: {
        type: String,
        required: [true, ''],
        validate: {
            // This only works on .create() and .save()
            validator: function (val) {
                return val === this.password;
            },
            message: 'Password are not the same!',
        },
    },
    photo: String,
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
});

// Middlewares
userSchema.pre('save', async function (next) {
    // Only Run if Password was modified
    if (!this.isModified('password')) return next();

    // Hashing the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    // Delte the PasswordConfirm
    this.passwordConfirm = undefined;

    next();
});

// Instance Method
userSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changesPasswordAfter = function (tokenIssuedTime) {
    if (this.passwordChangedAt) {
        const changedTimeStamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );

        // FALSE means not changed
        return tokenIssuedTime < changedTimeStamp;
    }
};

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = randomBytes(32).toString('hex');
    this.passwordResetToken = createHash('sha256')
        .update(resetToken)
        .digest('hex');

    console.log({ resetToken }, this.passwordResetToken);

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
