const express = require('express')

const productController = require('../controllers/productController')
const authController = require('./../controllers/authController');

const router = express.Router();

router.get('/bestDeals', productController.aliasBestDeals, productController.getAllProducts)

router
    .route('/')
    .get(productController.getAllProducts)
    .post(authController.protect, authController.restrictTo('admin'), productController.addAProduct);

router
    .route('/:id')
    .get(productController.getProduct)
    .patch(authController.protect, authController.restrictTo('admin'), productController.updateProduct)
    .delete(authController.protect, authController.restrictTo('admin'), productController.deleteProduct);

router.get('/:id/ratings', productController.getProductRating)

router.get('/reviews/:id', productController.getProductReviews)

module.exports = router;