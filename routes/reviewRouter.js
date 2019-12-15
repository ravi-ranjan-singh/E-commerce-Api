const express = require('express')
const reviewController = require('./../controllers/reviewController')
const authController = require('./../controllers/authController');


const router = express.Router()

router
    .route('/')
    .get(reviewController.getAllReview)
    .post(authController.protect, reviewController.singleReviewChecker, reviewController.reviewAProduct);

router
    .route('/:id')
    .get(reviewController.getReview)
    .patch(authController.protect, reviewController.updateReview)
    .delete(authController.protect, reviewController.deleteReview);

module.exports = router