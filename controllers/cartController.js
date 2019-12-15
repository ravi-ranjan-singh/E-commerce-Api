const Cart = require('../models/cartModel')
const Products = require('./../models/productModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')

exports.getUserCart = catchAsync(async (req, res, next) => {
    const cartInfo = await Cart.findOne({ customerID: req.customer._id }).select('-customerID -__v')
    const { productsID } = cartInfo
    let products = []
    for (let i = 0; i < productsID.length; i++) {
        const product = await Products.findById(productsID[i]).select('name price')
        products.push(product)
    }
    products = Array.from(new Set(products.map(JSON.stringify))).map(JSON.parse)
    for (let i = 0; i < products.length; i++) {
        const count = productsID.filter(el => el == products[i]._id).length
        products[i].count = count
    }
    let totalPrice = 0;
    let totalItems = 0
    products.forEach(el => {
        totalPrice = totalPrice + (el.price * el.count);
        totalItems = totalItems + el.count
    })
    res.status(200).json({
        status: 'success',
        data: {
            cartId: cartInfo._id,
            products,
            totalPrice,
            totalItems
        }
    });
})

exports.updateUserCart = catchAsync(async (req, res, next) => {
    console.log(req.customer._id)
    const cart = await Cart.findOne({ customerID: req.customer._id })
    console.log(cart)
    const updatedCart = await Cart.findByIdAndUpdate(cart._id, req.body, {
        new: true
    })
    console.log(updatedCart)
    res.status(200).json({
        status: 'success',
        data: updatedCart
    });
})