const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Customer = require('../models/customerModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const Cart = require('./../models/cartModel')

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};


const createSendToken = (customer, statusCode, res) => {
    const token = signToken(customer._id);
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true
    }
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    res.cookie('jwt', token, cookieOptions)
    customer.password = undefined
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            customer
        }
    });
}

exports.signUp = catchAsync(async (req, res, next) => {
    const newCustomer = await Customer.create(req.body);
    await Cart.create({ customerID: newCustomer._id })
    createSendToken(newCustomer, 200, res)
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new AppError('Please provide email or password', 400));
    }

    const customer = await Customer.findOne({ email }).select('+password');

    if (!customer || !(await customer.correctPassword(password, customer.password))) {
        return next(new AppError('email or password is incorrect', 401));
    }
    createSendToken(customer, 201, res)
});

exports.protect = catchAsync(async (req, res, next) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(
            new AppError(`You are not logged in.Please log in to access`, 401)
        );
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    customer = await Customer.findById(decoded.id);
    if (!customer) {
        return next(
            new AppError('The customer belonging to the token no longer exist', 401)
        );
    }

    if (customer.changedPasswordAfter(decoded.iat)) {
        return next(
            new AppError(
                `customer has recently changed their password.Please log in again`,
                401
            )
        );
    }

    req.customer = customer;
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.customer.role)) {
            return next(
                new AppError(`You do not have permission to perform this action`, 403)
            );
        }
        next();
    };
};

exports.forgetPassword = catchAsync(async (req, res, next) => {
    const customer = await Customer.findOne({ email: req.body.email });

    if (!customer) {
        return next(new AppError('There is no customer with that email address', 404));
    }

    const resetToken = customer.createPasswordResetToken();
    await customer.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get(
        'host'
    )}/api/customers/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your password and passwordConfirm to:${resetURL}.\nIf you didn't forget your password,please ignore this email!`;

    try {
        await sendEmail({
            email: customer.email,
            subject: `Your password reset Token (valid for only 10 min)`,
            message
        });

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email'
        });
    } catch (error) {
        console.log(error.message);

        customer.passwordResetToken = undefined;
        customer.passwordResetExpires = undefined;
        await customer.save({ validateBeforeSave: false });
        return next(
            new AppError(
                `There was an error sending the email. Please try again later`,
                500
            )
        );
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');
    const customer = await Customer.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });

    if (!customer) {
        return next(new AppError('Token is invalid or already expired', 400));
    }
    customer.password = req.body.password;
    customer.passwordConfirm = req.body.passwordConfirm;
    customer.passwordResetToken = undefined;
    customer.passwordResetExpires = undefined;
    await customer.save();

    createSendToken(customer, 200, res)
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    const { password, newPassword, newPasswordConfirm } = req.body;
    if (!password) {
        return next(new AppError('Please provide current password', 400));
    }

    const customer = await Customer.findById(req.customer._id).select('+password');

    if (!(await customer.correctPassword(password, customer.password))) {
        return next(new AppError('Current password provided is incorrect', 401));
    }
    customer.password = newPassword;
    customer.passwordConfirm = newPasswordConfirm;
    await customer.save();
    createSendToken(customer, 200, res)
});
