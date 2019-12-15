const Customer = require('./../models/customerModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const filterObj = (obj, ...allowedFields) => {
    let newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError(
                `This route is not for password update. Please use /updatePassword`,
                400
            )
        );
    }

    const filterBody = filterObj(req.body, 'email', 'first_name', 'last_name',
        'mobileNo', 'alternateMobileNo', 'address');
    const updatedCustomer = await Customer.findByIdAndUpdate(req.customer._id, filterBody, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        user: updatedCustomer
    });
});

exports.deleteMe = catchAsync(async (req, res, next) => {

    await Customer.findByIdAndDelete(req.customer._id)
    res.status(204).json({})
})