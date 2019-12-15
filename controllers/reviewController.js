const Review = require('../models/reviewModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const APIFeatures = require('./../utils/apiFeatures')

exports.singleReviewChecker = catchAsync(async (req, res, next) => {
    const review = await Review.findOne({ customerID: req.customer._id, productID: req.body.productID })
    if (review) {
        return next(new AppError('Review already exist for that product', 400))
    }
    next()
})


exports.getAllReview = catchAsync(async (req, res, next) => {

    const feature = new APIFeatures(Review.find(), req.query).filter().sort().limitFields().paginate()

    const reviews = await feature.query
    res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: reviews
    });
})


exports.reviewAProduct = catchAsync(async (req, res, next) => {
    const body = { ...req.body }
    body.customerID = req.customer._id
    body.customerName = ` ${req.customer.first_name} ${req.customer.last_name}`
    console.log(body)
    const review = await Review.create(body)
    delete review.__v;
    res.status(201).json({
        status: 'success',
        review
    });
})

exports.getReview = catchAsync(async (req, res, next) => {
    const review = await Review.findById(req.params.id);
    if (!review) {
        return next(new AppError('No review find with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: review
    });
})

exports.updateReview = catchAsync(async (req, res, next) => {
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
        runValidators: true,
        new: true
    })
    if (!review) {
        return next(new AppError('No review find with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: review
    });

})
exports.deleteReview = catchAsync(async (req, res, next) => {
    const review = await Review.findByIdAndDelete(req.params.id)
    if (!review) {
        return next(new AppError('No review find with that ID', 404));
    }
    res.status(204).json({
        status: 'success',
        data: null
    });
})