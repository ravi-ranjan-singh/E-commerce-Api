const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    model: {
        type: String,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
    },
    discount: {
        type: Number,
    },
    images: ['String'],
    brand: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    supplierID: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    subCategory: {
        type: String,
        required: true,
        trim: true
    },
    stockCount: {
        type: Number,
        required: true,
    },
    color: [String],
    availableFrom: {
        type: Date,
        default: Date.now()
    },
    reviewsID: {
        type: [String],
        trim: true
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

productSchema.virtual('discountPercentage').get(function () {
    perc = (this.discount / this.price) * 100
    return perc
})

const Product = mongoose.model('products', productSchema)

module.exports = Product