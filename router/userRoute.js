const express = require('express');
const user_route = express();
const path = require('path');
const session = require('express-session');
// const nocache =require('nocache');

const shopController = require('../controller/shopController');
const userController = require('../controller/userController');
const cartController = require('../controller/cartController');
const wishlistController = require('../controller/wishlistController');
const userProfileController = require('../controller/userProfileController');
const orderController = require('../controller/orderController');
const paymentController = require('../controller/paymentController');
const couponController = require('../controller/couponController');
const config = require('../config/config');
const userAuth = require('../middlewares/userAuth');
const userHelper = require('../middlewares/userHelper')
const { verify } = require('crypto');
const { error } = require('console');


user_route.use('/user', express.static(path.join(__dirname, 'public/user')));
// user_route.use(express.static(path.join(__dirname,'public/user/images')));

user_route.use(session({ secret: config.sessionSecret, resave: false, saveUninitialized: false }));
// user_route.use(nocache());



user_route.use(express.json());
user_route.use(express.urlencoded({ extended: true }));


// set view engine
user_route.set('view engine', 'ejs');
user_route.set('views', './views/user');

user_route.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.logedIn = req.session.user ? true : false;
    next();
})

user_route.use((req, res, next) => {
    console.log('method', req.method, 'path', req.path);
    next();
})

// load home
user_route.get('/', userAuth.isLogin, userHelper.countOfCartAndWishlist, userController.loadHome);

// load sign up
user_route.get('/signup', userAuth.isLogout, userHelper.countOfCartAndWishlist, userController.loadRegister);

// insert user
user_route.post('/signup', userHelper.countOfCartAndWishlist, userController.insertUser);

// logout
user_route.get('/logout', userAuth.isLogin, userController.userLogout);

// load login
user_route.get('/login', userAuth.isLogout, userHelper.countOfCartAndWishlist, userController.loadLogin);

// verify login 
user_route.post('/login',userAuth.isLogout, userHelper.countOfCartAndWishlist, userController.verifyLogin);

// load otp
user_route.get('/otp', userAuth.isLogout, userHelper.countOfCartAndWishlist, userController.loadOtp);

// verify otp
user_route.post('/otp', userAuth.isLogout, userController.verifyOtp);

// resend otp
user_route.get('/resend/:email', userAuth.isLogout, userController.resendOtp);

//forgot password
user_route.get('/forgot-password', userAuth.isLogout, userHelper.countOfCartAndWishlist, userController.loadForgotPassword);

//update password
user_route.post('/forgot-password', userAuth.isLogout, userController.forgotPassword);

// reset Password 
user_route.get('/reset-password/:id/:token', userAuth.isLogin, userHelper.countOfCartAndWishlist, userController.loadResetPassword);
user_route.post('/reset-password', userAuth.isLogin, userController.resetPassword);

//profile
user_route.get('/profile', userAuth.isLogin, userHelper.countOfCartAndWishlist, userProfileController.loadProfile)
// update profile
user_route.post('/update-profile', userAuth.isLogin, userProfileController.updateProfile)
// change password
user_route.post('/profile/change-password',userAuth.isLogin,userProfileController.changePassword)



// load shop
user_route.get('/shop', userAuth.isLogin, userHelper.countOfCartAndWishlist, shopController.loadShop);

// load single Product
user_route.get('/single-product', userAuth.isLogin, userHelper.countOfCartAndWishlist, shopController.loadSingleProduct);

//filter
user_route.post('/filter-shop', userAuth.isLogin, userHelper.countOfCartAndWishlist, shopController.filterShop);


// about us
user_route.get('/about-us',userAuth.isLogin, userHelper.countOfCartAndWishlist, userController.loadAboutUs)
// load cart
user_route.get('/cart', userAuth.isLogin, userHelper.countOfCartAndWishlist, cartController.loadCart);

// add to cart
user_route.post('/addtocart',userAuth.isLogin, cartController.addToCart);

// remove single product from cart
user_route.post('/remove-cart',userAuth.isLogin, cartController.removeFromCart);

// check cart
user_route.post('/check-cart',userAuth.isLogin, cartController.checkCart);

// change cart quantity
user_route.post('/change-quantity',userAuth.isLogin, cartController.changeQuantity);





//checkout 
user_route.get('/checkout', userAuth.isLogin, userHelper.countOfCartAndWishlist, cartController.loadCheckout);
// place order
user_route.post('/place-order',userAuth.isLogin, userHelper.countOfCartAndWishlist,orderController.placeOrder);

//wishlist 
user_route.get('/wishlist', userAuth.isLogin, userHelper.countOfCartAndWishlist, wishlistController.loadWishlist);

//add to wishlist
user_route.post('/add-to-wishlist', userAuth.isLogin, wishlistController.addToWishlist);

//remove from wishlist
user_route.post('/remove-wishlist', userAuth.isLogin, wishlistController.removeFromWishlist);


//add address
user_route.post('/add-address',userAuth.isLogin, userProfileController.addAddress);
user_route.get('/edit-address', userAuth.isLogin, userProfileController.editAddress);
user_route.post('/edit-address',userAuth.isLogin, userProfileController.updateAddress);


//order success
user_route.get('/order-success/:orderId',userAuth.isLogin, userHelper.countOfCartAndWishlist, orderController.loadOrderSuccess);

//order details
user_route.get('/order-details', userAuth.isLogin, userHelper.countOfCartAndWishlist, orderController.loadOrderDetails);

// my order
user_route.get('/my-orders', userAuth.isLogin, userHelper.countOfCartAndWishlist, orderController.loadMyOrder);

//retry payment
user_route.post('/my-orders/retry-payment',userAuth.isLogin, userAuth.isLogin,orderController.retryPayment);

//cancel order
user_route.post('/cancel-order',userAuth.isLogin, orderController.orderCancel);

//order-single-product
user_route.get('/single-order-product', userAuth.isLogin, userHelper.countOfCartAndWishlist, orderController.singleOrderProduct);

//return product
user_route.post('/return-product',userAuth.isLogin, orderController.returnProduct);


// razor pay failed
user_route.put('/order/razorpay-failed',userAuth.isLogin, orderController.razorPayFailed);

// verify razorpay payment
user_route.post('/order/verify-payment',userAuth.isLogin, paymentController.verifyPaymentRazorpay);


// coupon validate and apply
user_route.post('/apply-coupon', userAuth.isLogin, couponController.validateCoupon);

// remove coupon
user_route.post('/remove-coupon', userAuth.isLogin,couponController.removeAppliedCoupon);

// error
// user_route.get('/500',userAuth.isLogin,userController.loadError500);




// load invoice 
 user_route.get('/my-orders/single-order-product/invoice',userAuth.isLogin,orderController.loadInvoice);


 //404
//  user_route.get('*',userAuth.isLogin,userController.LoadError404);




module.exports = user_route;