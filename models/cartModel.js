const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema({
    customerID: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    productsID: {
        type: [String],
        trim: true
    }
})

const Cart = mongoose.model('carts', cartSchema)

module.exports = Cart