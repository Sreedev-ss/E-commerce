var express = require('express');
var router = express.Router();
const userController = require('../Controller/userController');
const auth = require('../Controller/auth');



router.get('/', userController.landingpage);

router.get('/getProductData',userController.getProductData)

router.get('/user_registration',auth.mustLogoutUser, userController.getSignup)

router.post('/user_registration', userController.postSignup)

router.get('/user_signin',auth.mustLogoutUser,userController.getLogin)

router.post('/user_signin',userController.postLogin)

router.get('/user_signout',userController.getLogout)

router.get('/otp_page', auth.mustLogoutUser,userController.getOtp)

router.put('/otpNumberFind',userController.checkNumber)

router.get('/otp_login', userController.getOtplogin)

router.get('/otp_verify', userController.getOtpverify)

router.get('/accounts', auth.verifyUser, userController.getAccounts)

router.put('/accounts/add_address', auth.verifyUserAPI , userController.addAddress)

router.put('/accounts/address/:id', auth.verifyUserAPI , userController.editAddress)

router.delete('/accounts/deleteAddress/:id', auth.verifyUserAPI , userController.deleteAddress)

router.put('/accounts/updateProfile',auth.verifyUserAPI,userController.updateProfile)

router.get('/shop', userController.getShop)

router.get('/product/:id', userController.getProduct)

router.get('/wishlist', auth.verifyUser , userController.getWishlist)

router.get('/cart', auth.verifyUser, userController.getCart)

router.get('/qtyFind/:id',auth.verifyUserAPI,userController.getcartProQty)

router.get('/addtoCart/:id', auth.verifyUserAPI, userController.addtoCart)

router.put('/changeProductQuantity',auth.verifyUserAPI, userController.changeProductQuantity)

router.delete('/deleteCartItems',auth.verifyUserAPI, userController.deleteCartItems)

router.get('/checkout',auth.verifyUser, userController.checkOut)

router.get('/checkoutAddress/:id',auth.verifyUser, userController.checkOutPost)

router.post('/place-order',auth.verifyUserAPI, userController.placeOrder)

router.post('/verify-payment',auth.verifyUserAPI, userController.verifyPayment)

router.post('/create-order', auth.verifyUserAPI, userController.paypalOrder)

router.post('/verify-payment-paypal',auth.verifyUserAPI, userController.verifyPaymentPaypal)

router.get('/orders', auth.verifyUser, userController.orderDetails)

router.put('/orders', auth.verifyUserAPI, userController.OrdersCancel)

router.get('/order-invoice', userController.getOrderInvoice)

router.get('/about',auth.verifyUser, userController.getAbout)

router.get('/orderSuccess',auth.verifyUser,userController.getSuccessPage)

router.post('/checkout/coupon_verify',auth.verifyUserAPI,userController.verifyCoupon)

router.post('/checkout/verify_coupon_checked',auth.verifyUserAPI,userController.checkCoupon)

router.post('/checkout/apply_coupon',auth.verifyUserAPI,userController.applyCoupon)

router.post('/order/return_product',auth.verifyUserAPI,userController.returnProduct)

router.get('/accounts/user_data',auth.verifyUserAPI,userController.getUserData)

module.exports = router;
