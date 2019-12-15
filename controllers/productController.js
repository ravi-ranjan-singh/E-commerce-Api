const Product = require('../models/productModel')
const Review = require('../models/reviewModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const APIFeatures = require('./../utils/apiFeatures')

exports.aliasBestDeals = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-discount';
    req.query.fields = 'name,price,discount,images';
    next()
}

exports.getAllProducts = catchAsync(async (req, res, next) => {

    const feature = new APIFeatures(Product.find(), req.query).filter().sort().limitFields().paginate()

    const products = await feature.query
    res.status(200).json({
        status: 'success',
        results: products.length,
        data: products
    });
})

exports.addAProduct = catchAsync(async (req, res, next) => {
    const product = await Product.create(req.body)
    delete product.__v;
    res.status(201).json({
        status: 'success',
        product
    });
})

exports.getProduct = catchAsync(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return next(new AppError('No product find with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: product
    });
})

exports.updateProduct = catchAsync(async (req, res, next) => {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        runValidators: true,
        new: true
    })
    if (!product) {
        return next(new AppError('No product find with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: product
    });

})
exports.deleteProduct = catchAsync(async (req, res, next) => {
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) {
        return next(new AppError('No product find with that ID', 404));
    }
    res.status(204).json({
        status: 'success',
        data: null
    });
})

exports.getProductReviews = catchAsync(async (req, res, next) => {
    const reviews = await Review.find({ productID: req.params.id })
    res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: reviews
    });
})

exports.getProductRating = catchAsync(async (req, res, next) => {
    const rating = await Review.aggregate([
        {
            $match: { productID: req.params.id }
        },
        {
            $group: {
                _id: null,
                totalRatings: { $sum: 1 },
                avgRating: { $avg: '$ratings' },
                minRating: { $min: '$ratings' },
                maxRating: { $max: '$ratings' }
            }
        },
        {
            $project: {
                _id: 0
            }
        }
    ])



    res.status(200).json({
        status: 'success',
        data: rating
    });
})