const express = require('express');
const authController = require('./../controllers/authController');
const customerController = require('./../controllers/customerController');
const router = express.Router();

router.post('/signup', authController.signUp);
router.post('/login', authController.login);

router.post('/forgetPassword', authController.forgetPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.patch('/updateMe', authController.protect, customerController.updateMe);

router.patch(
    '/updatePassword',
    authController.protect,
    authController.updatePassword
);

router.delete('/deleteMe', authController.protect, customerController.deleteMe)

module.exports = router;