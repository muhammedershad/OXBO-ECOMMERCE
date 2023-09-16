const express = require('express');
const homeControllers = require('../controllers/homePage')
const userAuth = require('../middleware/userAuth')
const coupon = require('../controllers/coupon');

const router = express.Router();

router.get('/',homeControllers.HomePage);
router.get('/login',userAuth.logined,homeControllers.loginPage);
router.get('/signup',userAuth.logined,homeControllers.signupPage);
router.get('/otp',homeControllers.otpPage);
router.post('/signup',homeControllers.postSignup);
router.post('/verifyOTP',homeControllers.verifyOTP);
router.get('/check-email', homeControllers.checkEmailExists);
router.post('/login',homeControllers.postLogin);

router.get('/forgotPass', homeControllers.forgotPassPage);
router.post('/forgotPass',homeControllers.forgotPass);
router.get('/forgotPassOTP',homeControllers.forgotPassOTP);
router.post('/forgotPassVerifyOTP',homeControllers.forgotPassVerifyOTP);
router.get('/changePass',homeControllers.changePassPage);
router.post('/changePass',homeControllers.changePass);

router.get('/products',homeControllers.productPage);
router.get('/products2',homeControllers.productPage2);

router.get('/product',homeControllers.productDetail);
router.post('/addToCart',userAuth.auth,homeControllers.addToCart);
router.get('/account',userAuth.auth,homeControllers.accountPage);
router.get('/newAddress',userAuth.auth,homeControllers.newAddressPage);

router.get('/cart',userAuth.auth,homeControllers.cartPage);
router.get('/cart-remove-product',userAuth.auth,homeControllers.cartRemoveProduct);
router.get('/cart-update-product-quantity',userAuth.auth,homeControllers.cartUpdateProductQuantity);

router.post('/addToWishlist',userAuth.auth,homeControllers.addToWishlist)

router.get('/checkout',userAuth.auth,homeControllers.ckeckoutPage);

router.post('/addAddress',userAuth.auth,homeControllers.addAddress);
router.post('/editAddress',userAuth.auth,homeControllers.editAddress);
router.delete('/deleteAddress',userAuth.auth,homeControllers.deleteAddress);
router.post('/makeDefaultAddress',userAuth.auth,homeControllers.makeDefaultAddress);

router.post('/placeOrder',userAuth.auth,homeControllers.placeOrder);
router.get('/orderList',userAuth.auth,homeControllers.orderListPage);
router.post('/logout',userAuth.auth,homeControllers.logout);
router.get('/resendOTP',homeControllers.resendOTP);

router.get('/check-coupoon', userAuth.auth, coupon.verifyCoupon)

router.get('/orderDetails',userAuth.auth,homeControllers.OrderDetailsPage);
router.post('/cancelOrder',userAuth.auth,homeControllers.cancelOrder)



module.exports = router;