// const express = require('express');
// const { response } = require('../app');
// const router = express.Router();
// const adminController = require('../Controller/adminController')
// const userController = require('../Controller/userController');
// const productHelpers = require('../helpers/productHelpers')
// const auth = require('../Controller/auth');


// router.get('/', adminController.getAdminpanel);

// router.get('/orderData',adminController.getOrderdataMontly)

// router.get('/generateExcel',adminController.getExceldata)

// router.get('/orderDataAdminYearly',auth.verifyAdminAPI,adminController.getYealydata)

// router.get('/orderDataAdminDaily',auth.verifyAdminAPI,adminController.getDailydata)

// router.get('/getPieData',adminController.getPieData)

// router.get('/admin_login',auth.mustLogoutAdmin, adminController.getAdminlogin)

// router.post('/admin_login',adminController.postAdminlogin)

// router.get('/admin_logout',auth.verifyAdmin,adminController.getAdminlogout)

// router.get('/products',auth.verifyAdmin, adminController.getProduct)

// router.get('/products/add_products',auth.verifyAdmin, adminController.getAddproduct)

// router.post('/products/add_products',auth.verifyAdmin, adminController.postAddproduct)

// router.get('/products/edit_products/:id',auth.verifyAdmin, adminController.getEditproduct)

// router.post('/products/edit_products/:id',auth.verifyAdmin, adminController.postEditproduct)

// router.get('/products/delete_products/:id',auth.verifyAdmin, adminController.getDeleteproduct)

// router.get('/category_management',auth.verifyAdmin, adminController.getCategory)

// router.get('/category_management/add_category',auth.verifyAdmin, adminController.getAddcategory)

// router.post('/category_management/add_category',auth.verifyAdmin, adminController.postAddcategory)

// router.get('/category_management/edit_category/:id',auth.verifyAdmin, adminController.getEditcategory)

// router.post('/category_management/edit_category/:id',auth.verifyAdminAPI, adminController.postEditcategory)

// router.get('/category_management/delete_category/:id',auth.verifyAdmin, adminController.getDeletecategory)

// router.get('/user_management',auth.verifyAdmin, adminController.getUser)

// router.get('/user_management/add_users',auth.verifyAdmin, adminController.getAdduser)

// router.post('/user_management/add_users',auth.verifyAdmin, adminController.postAdduser)

// router.get('/user_management/edit_user/:id',auth.verifyAdmin, adminController.getEdituser)

// router.post('/user_management/edit_user/:id',auth.verifyAdmin, adminController.postEdituser)

// router.get('/user_management/block_user/:id',auth.verifyAdmin, adminController.getBlockuser)

// router.get('/user_management/unblock_user/:id',auth.verifyAdmin, adminController.getUnblockuser)

// router.get('/order_management',auth.verifyAdmin, adminController.orderManagement)

// router.post('/orderManagement', auth.verifyAdminAPI, userController.OrdersCancel)

// router.get('/order_management/order_details/:id',auth.verifyAdmin, adminController.orderDetails)

// router.post('/order_management/order_details/orderCancel',auth.verifyAdminAPI, adminController.OrdersCancel)

// router.post('/updateOrders',auth.verifyAdminAPI, adminController.updateOrder)

// router.get('/coupen_management',auth.verifyAdmin,adminController.getCoupen)

// router.get('/coupen_management/add_coupen',auth.verifyAdmin,adminController.addCoupen)

// router.get('/coupen_management/generate_coupen',auth.verifyAdminAPI,adminController.generateCoupen)

// router.post('/coupen_management/add_coupen',auth.verifyAdmin,adminController.coupenUpdate)


// module.exports = router;

