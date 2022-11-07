var express = require('express');
var router = express.Router();
const userController = require('../Controller/userController');
const auth = require('../Controller/auth');



router.get('/', userController.landingpage);

router.get('/user_registration', userController.getSignup)

router.post('/user_registration', userController.postSignup)

router.get('/user_signin',userController.getLogin)

router.post('/user_signin',userController.postLogin)

router.get('/user_signout',userController.getLogout)

router.get('/otp_page', auth.mustLogoutUser,userController.getOtp)

router.get('/otp_login', userController.getOtplogin)

router.get('/otp_verify', userController.getOtpverify)

router.get('/accounts', auth.verifyUser , userController.getAccounts)

router.get('/shop', userController.getShop)

router.get('/product/:id', userController.getProduct)

router.get('/wishlist', auth.verifyUser , userController.getWishlist)

router.get('/cart', auth.verifyUser , userController.getCart)

router.get('/about', userController.getAbout)

module.exports = router;
