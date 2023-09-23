const express = require('express');
const adminDash = require('../controllers/adminHome');
const adminHome = require('../controllers/adminHome');
const auth = require('../middleware/adminAuth');
const coupon = require('../controllers/coupon');
const bannerController = require('../controllers/banner');

const router = express.Router();

router.get('/login',auth.logined,adminDash.loginPage);
router.get('/',adminDash.dashPage);

router.get('/users',auth.auth,adminDash.usersPage);
router.get('/category',auth.auth,adminDash.category);
router.get('/product',auth.auth,adminDash.productPage);
router.post('/login',auth.logined,adminDash.loginPost);
router.patch('/block/:id',auth.auth,adminHome.blockUser);
router.post('/logout',auth.auth,adminHome.logout);
router.post('/addCategory',auth.auth,adminDash.addCategory);
router.get('/check-category', auth.auth,adminDash.checkCategory);
router.post('/updatCategory/:id',auth.auth,adminDash.updateCategory);
router.patch('/list/:id',auth.auth,adminHome.listCategory);
router.patch('/listproduct/:id',auth.auth,adminHome.listProduct);
router.get('/productCategories',auth.auth,adminDash.productCategories);
router.get('/productSubcategories',auth.auth,adminDash.productSubcategories);
router.post('/addProduct',auth.auth,adminHome.addProduct);
router.post('/editProduct',auth.auth,adminHome.editProduct);
router.post('/addSubcategory/:categoryId',auth.auth,adminDash.addSubcategory);
router.patch('/listsubcategory/:categoryId/:subcategory',auth.auth,adminDash.listSubcategory);
router.get('/orderList',adminDash.orderListPage);
router.post('/deleteimg',auth.auth,adminDash.deleteimg);

router.post('/updateOrderStatus', auth.auth, adminDash.updateStatus)
      .get('/orderDetails',auth.auth,adminDash.orderDetailsPage)

router.get('/downloadSalesReport',adminHome.downloadSalesReport)

router.get('/coupon',auth.auth,coupon.couponPage)
      .post('/coupon',auth.auth,coupon.Addcoupon)
      .post('/coupon-edit',auth.auth,coupon.editCoupon)
      .patch('/coupon/:id',auth.auth,coupon.listCoupon);

router.get('/banner',auth.auth,bannerController.bannerPage)
router.post('/banner',auth.auth,bannerController.addBanner)
router.post('/banner-edit',auth.auth,bannerController.editBanner)
router.delete('/banner/:id',auth.auth,bannerController.deleteBanner)
router.patch('/banner/:id',auth.auth,bannerController.listBanner)

router.get('/dash-totalOrders',adminDash.totalOders)
router.get('/dash-totalRevenue',adminDash.totalRevenue)
router.get('/dash-profit',adminDash.profit)
router.get('/dash-orderPerMonth',adminDash.orderPerMonth)
      
      


module.exports = router;