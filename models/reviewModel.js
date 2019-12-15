const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
    customerID: {
        type: String,
        required: true,
        trim: true
    },
    customerName: {
        type: String,
        required: true,
        trim: true
    },
    productID: {
        type: String,
        trim: true,
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 40
    },
    description: {
        type: String,
        trim: true
    },
    ratings: {
        type: Number,
        required: true
    },
    postedOn: {
        type: Date,
        default: Date.now()
    }
})

const Review = mongoose.model('reviews', reviewSchema)

module.exports = Review