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

router.post('/otpNumberFind',auth.mustLogoutUser,userController.checkNumber)

router.get('/otp_login', userController.getOtplogin)

router.get('/otp_verify', userController.getOtpverify)

router.get('/accounts', auth.verifyUser , userController.getAccounts)

router.get('/shop', userController.getShop)

router.get('/product/:id', userController.getProduct)

router.get('/wishlist', auth.verifyUser , userController.getWishlist)

router.get('/cart', auth.verifyUser , userController.getCart)

router.get('/addtoCart/:id', auth.verifyUser , userController.addtoCart)

router.post('/changeProductQuantity',auth.verifyUser, userController.changeProductQuantity)

router.post('/deleteCartItems',auth.verifyUser, userController.deleteCartItems)

router.get('/checkout/',auth.verifyUser, userController.checkOut)

router.get('/checkoutAddress/:id',auth.verifyUser, userController.checkOutPost)

router.post('/place-order',auth.verifyUser, userController.placeOrder)

router.get('/orders', auth.verifyUser, userController.Orders)

router.post('/orders', auth.verifyUser, userController.OrdersCancel)

router.get('/about',auth.verifyUser, userController.getAbout)

router.get('/orderSuccess',auth.verifyUser,userController.getSuccessPage)

module.exports = router;
