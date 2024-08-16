const express = require('express');
const user_route = express();
const path = require('path');
const session = require('express-session');
const userAuth = require('../middlewares/userAuth');
const userHelper = require('../middlewares/userHelper');
const userController = require('../controller/userController');
const cartController = require('../controller/cartController');
const shopController = require('../controller/shopController');
const wishlistController = require('../controller/wishlistController');
const userProfileController = require('../controller/userProfileController');
const orderController = require('../controller/orderController');
const paymentController = require('../controller/paymentController');
const couponController = require('../controller/couponController');
const config = require('../config/config');


// Serve static files from the 'public/user' directory
user_route.use('/user', express.static(path.join(__dirname, '../public/user')));

// Configure session management
user_route.use(session({ secret: config.sessionSecret, resave: false, saveUninitialized: false }));

// Set view engine and views directory
user_route.set('view engine', 'ejs');
user_route.set('views', './views/user');

// Middleware to set user data in response locals
user_route.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.logedIn = req.session.user ? true : false;
    next();
});

// Log HTTP method and path for debugging
user_route.use((req, res, next) => {
    console.log('method', req.method, 'path', req.path);
    next();
});

// Home route
user_route.get('/', userAuth.isLogin, userHelper.countOfCartAndWishlist, userController.loadHome);

// User Signup
user_route.get('/signup', userAuth.isLogout, userHelper.countOfCartAndWishlist, userController.loadRegister);
user_route.post('/signup', userHelper.countOfCartAndWishlist, userController.insertUser);

// User Logout
user_route.get('/logout', userAuth.isLogin, userController.userLogout);

// User Login
user_route.get('/login', userAuth.isLogout, userHelper.countOfCartAndWishlist, userController.loadLogin);
user_route.post('/login', userAuth.isLogout, userHelper.countOfCartAndWishlist, userController.verifyLogin);

// OTP Verification
user_route.get('/otp', userAuth.isLogout, userHelper.countOfCartAndWishlist, userController.loadOtp);
user_route.post('/otp', userAuth.isLogout, userController.verifyOtp);

// Resend OTP
user_route.get('/resend/:email', userAuth.isLogout, userController.resendOtp);

// Forgot Password
user_route.get('/forgot-password', userAuth.isLogout, userHelper.countOfCartAndWishlist, userController.loadForgotPassword);
user_route.post('/forgot-password', userAuth.isLogout, userController.forgotPassword);

// Reset Password
user_route.get('/reset-password/:id/:token', userAuth.isLogin, userHelper.countOfCartAndWishlist, userController.loadResetPassword);
user_route.post('/reset-password', userAuth.isLogin, userController.resetPassword);

// User Profile
user_route.get('/profile', userAuth.isLogin, userHelper.countOfCartAndWishlist, userProfileController.loadProfile);
user_route.post('/update-profile', userAuth.isLogin, userProfileController.updateProfile);
user_route.post('/profile/change-password', userAuth.isLogin, userProfileController.changePassword);

// Shop
user_route.get('/shop', userAuth.isLogin, userHelper.countOfCartAndWishlist, shopController.loadShop);
user_route.get('/single-product', userAuth.isLogin, userHelper.countOfCartAndWishlist, shopController.loadSingleProduct);
user_route.post('/filter-shop', userAuth.isLogin, userHelper.countOfCartAndWishlist, shopController.filterShop);

// About Us
user_route.get('/about-us', userAuth.isLogin, userHelper.countOfCartAndWishlist, userController.loadAboutUs);

// Cart
user_route.get('/cart', userAuth.isLogin, userHelper.countOfCartAndWishlist, cartController.loadCart);
user_route.post('/addtocart', userAuth.isLogin, cartController.addToCart);
user_route.post('/remove-cart', userAuth.isLogin, cartController.removeFromCart);
user_route.post('/check-cart', userAuth.isLogin, cartController.checkCart);
user_route.post('/change-quantity', userAuth.isLogin, cartController.changeQuantity);

// Checkout
user_route.get('/checkout', userAuth.isLogin, userHelper.countOfCartAndWishlist, cartController.loadCheckout);
user_route.post('/place-order', userAuth.isLogin, userHelper.countOfCartAndWishlist, orderController.placeOrder);

// Wishlist
user_route.get('/wishlist', userAuth.isLogin, userHelper.countOfCartAndWishlist, wishlistController.loadWishlist);
user_route.post('/add-to-wishlist', userAuth.isLogin, wishlistController.addToWishlist);
user_route.post('/remove-wishlist', userAuth.isLogin, wishlistController.removeFromWishlist);

// Address
user_route.post('/add-address', userAuth.isLogin, userProfileController.addAddress);
user_route.get('/edit-address', userAuth.isLogin, userProfileController.editAddress);
user_route.post('/edit-address', userAuth.isLogin, userProfileController.updateAddress);

// Order Success
user_route.get('/order-success/:orderId', userAuth.isLogin, userHelper.countOfCartAndWishlist, orderController.loadOrderSuccess);

// Order Details
user_route.get('/order-details', userAuth.isLogin, userHelper.countOfCartAndWishlist, orderController.loadOrderDetails);

// My Orders
user_route.get('/my-orders', userAuth.isLogin, userHelper.countOfCartAndWishlist, orderController.loadMyOrder);
user_route.post('/my-orders/retry-payment', userAuth.isLogin, orderController.retryPayment);
user_route.post('/cancel-order', userAuth.isLogin, orderController.orderCancel);

// Single Order Product
user_route.get('/single-order-product', userAuth.isLogin, userHelper.countOfCartAndWishlist, orderController.singleOrderProduct);

// Return Product
user_route.post('/return-product', userAuth.isLogin, orderController.returnProduct);

// Razorpay Payment
user_route.put('/order/razorpay-failed', userAuth.isLogin, orderController.razorPayFailed);
user_route.post('/order/verify-payment', userAuth.isLogin, paymentController.verifyPaymentRazorpay);

// Coupon
user_route.post('/apply-coupon', userAuth.isLogin, couponController.validateCoupon);
user_route.post('/remove-coupon', userAuth.isLogin, couponController.removeAppliedCoupon);

// Invoice
user_route.get('/my-orders/single-order-product/invoice', userAuth.isLogin, orderController.loadInvoice);

// Error Handling
user_route.get('/404', userAuth.isLogin, userHelper.countOfCartAndWishlist, userController.LoadError404);

// Catch-all for 404 errors in user routes
user_route.use((req, res, next) => {
  res.status(404).redirect('/404')
});

module.exports = user_route;
