const express = require('express');
const authController = require('./../controllers/authController');
const cartController = require('./../controllers/cartController');

const router = express.Router();

router
    .route('/')
    .get(authController.protect, cartController.getUserCart)
    .patch(authController.protect, cartController.updateUserCart)



module.exports = router