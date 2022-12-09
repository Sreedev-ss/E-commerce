const express = require('express');
const { response } = require('../app');
const router = express.Router();
const adminController = require('../Controller/adminController')
const userController = require('../Controller/userController');
const productHelpers = require('../helpers/productHelpers')
const auth = require('../Controller/auth');

router.get('/',adminController.getAdminPanel2)

router.get('/logout',adminController.getAdmin2logout)

router.get('/login',auth.mustLogoutAdmin2,adminController.adminLogin)

router.post('/login',adminController.postAdminlogin2)

router.get('/orderData',adminController.getOrderdataMontly)

router.get('/orderDataAdmin',adminController.getOrderdata)

router.get('/orderDataAdminDaily',adminController.getDailydata)

router.get('/orderDataAdminMonthly',adminController.getOrderdataMontly)

router.get('/generateExcel',adminController.getExceldata)

router.get('/orderDataAdminYearly',adminController.getOrderdataYearly)

router.get('/productManagement',auth.verifyAdmin2,adminController.getProductManagement)

router.get('/productManagement/add_products',auth.verifyAdmin2,adminController.addproducts)

router.post('/productManagement/add_products',adminController.postAddProducts)

router.get('/productManagement/edit-products/:id', adminController.editproduct)

router.post('/productManagement/edit-products/:id', adminController.posteditProducts)

router.get('/productManagement/delete-products/:id',adminController.deleteProduct)

router.get('/categoryManagement',auth.verifyAdmin2,adminController.getcategoryManagement)

router.get('/categoryManagement/add_category',auth.verifyAdmin2,adminController.getaddCategory)

router.post('/categoryManagement/add_category',adminController.postaddcategory)

router.get('/categoryManagement/edit_category/:id',auth.verifyAdmin2,adminController.editCategory)

router.post('/categoryManagement/edit_category/:id',adminController.posteditCategory)

router.get('/categoryManagement/delete_category/:id',auth.verifyAdmin2,adminController.deleteCategory)

router.get('/userManagement',auth.verifyAdmin2,adminController.getuserManagement)

router.get('/userManagement/block_user/:id', auth.verifyAdmin2,adminController.BlockUser)

router.get('/userManagement/unblock_user/:id', auth.verifyAdmin2,adminController.UnblockUser)

router.get('/orderMangement',auth.verifyAdmin2,adminController.getOrderPag)

router.get('/orderManagement/order_details/:id',auth.verifyAdmin2,adminController.getOrderDetils)

router.post('/orderManagement/order_details/orderCancel', adminController.CancelOrder)

router.post('/orderManagement/order_details/updateOrders',adminController.updateOrderDetails)

router.get('/couponManagement',auth.verifyAdmin2,adminController.getcouponManagement)

router.get('/couponManagement/add_coupon',auth.verifyAdmin2,adminController.getaddCoupon)

router.post('/couponManagement/add_coupon',adminController.postaddCoupon)

router.get('/coupenManagement/generate_coupen',adminController.getCoupenCode)

router.get('/bannerManagement',auth.verifyAdmin2,adminController.getBanner)

router.get('/bannerManagement/add_banner',auth.verifyAdmin2,adminController.addBanner)

router.post('/bannerManagement/add_banner',adminController.postBanner)

router.get('/bannerManagement/advBanner',auth.verifyAdmin2,adminController.getadvBanner)

router.get('/bannerManagement/add-advBanner',auth.verifyAdmin2,adminController.getadvBannerPage)

router.post('/bannerManagement/add-advBanner',adminController.postadvBanner)

router.get('/bannerManagement/disable/:id',adminController.disableBanner)

router.get('/bannerManagement/enable/:id',adminController.enableBanner)

module.exports = router;