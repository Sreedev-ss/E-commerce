const express = require('express');
const { response } = require('../app');
const router = express.Router();
const adminController = require('../Controller/adminController')
const userController = require('../Controller/userController');
const productHelpers = require('../helpers/productHelpers')
const auth = require('../Controller/auth');

router.get('/',adminController.getAdminPanel2)

router.get('/orderDataAdmin',adminController.getOrderdata)

router.get('/orderDataAdminDaily',adminController.getDailydata)

router.get('/orderDataAdminMonthly',adminController.getOrderdataMontly)

router.get('/generateExcel',adminController.getExceldata)

router.get('/orderDataAdminYearly',adminController.getOrderdataYearly)

router.get('/orderDataAdminYearly',adminController.getYealydata)

router.get('/productManagement',adminController.getProductManagement)

router.get('/productManagement/add_products',adminController.addproducts)

router.post('/productManagement/add_products',adminController.postAddProducts)

router.get('/productManagement/edit-products/:id', adminController.editproduct)

router.post('/productManagement/edit-products/:id', adminController.posteditProducts)

router.get('/productManagement/delete-products/:id',adminController.deleteProduct)

router.get('/categoryManagement',adminController.getcategoryManagement)

router.get('/userManagement',adminController.getuserManagement)

router.get('/userManagement/block_user/:id', adminController.BlockUser)

router.get('/userManagement/unblock_user/:id', adminController.UnblockUser)

router.get('/orderMangement',adminController.getOrderPag)

router.get('/orderManagement/order_details/:id',adminController.getOrderDetils)

router.post('/orderManagement/order_details/orderCancel', adminController.CancelOrder)

router.post('/orderManagement/order_details/updateOrders',adminController.updateOrderDetails)

router.get('/couponManagement',adminController.getcouponManagement)

router.get('/couponManagement/add_coupon',adminController.getaddCoupon)

router.post('/couponManagement/add_coupon',adminController.postaddCoupon)

router.get('/coupenManagement/generate_coupen',adminController.getCoupenCode)

router.get('/bannerManagement',adminController.getBanner)

router.get('/bannerManagement/add_banner',adminController.addBanner)

router.post('/bannerManagement/add_banner',adminController.postBanner)

router.get('/bannerManagement/disable/:id',adminController.disableBanner)

router.get('/bannerManagement/enable/:id',adminController.enableBanner)

module.exports = router;