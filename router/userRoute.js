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
const paymentController = require('../controller/paymentController')
const config = require('../config/config');
const userAuth = require('../middlewares/userAuth');
const { verify } = require('crypto');


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
user_route.get('/', userAuth.isLogin, userController.loadHome);

// load sign up
user_route.get('/signup', userAuth.isLogout, userController.loadRegister);

// insert user
user_route.post('/signup', userController.insertUser);

// logout
user_route.get('/logout', userAuth.isLogin, userController.userLogout);

// load login
user_route.get('/login', userAuth.isLogout, userController.loadLogin);

// verify login 
user_route.post('/login', userController.verifyLogin);

// load otp
user_route.get('/otp', userAuth.isLogout, userController.loadOtp);

// verify otp
user_route.post('/otp', userController.verifyOtp);

// resend otp
user_route.get('/resend/:email', userController.resendOtp);

//forgot password
user_route.get('/forgot-password', userAuth.isLogout, userController.loadForgotPassword);

//update password
user_route.post('/forgot-password', userAuth.isLogout, userController.forgotPassword);

// reset Password 
user_route.get('/reset-password/:id/:token', userAuth.isLogin, userController.loadResetPassword);
user_route.post('/reset-password', userController.resetPassword);

//profile
user_route.get('/profile', userAuth.isLogin, userProfileController.loadProfile)
// update profile
user_route.post('/update-profile', userAuth.isLogin, userProfileController.updateProfile)



// load shop
user_route.get('/shop', userAuth.isLogin, shopController.loadShop);

// load single Product
user_route.get('/single-product', userAuth.isLogin, shopController.loadSingleProduct);

//filter
user_route.post('/filter-shop', userAuth.isLogin, shopController.filterShop);




// load cart
user_route.get('/cart', cartController.loadCart);

// add to cart
user_route.post('/addtocart', cartController.addToCart);//want to add middleware to login

// remove single product from cart
user_route.post('/remove-cart', cartController.removeFromCart);

// check cart
user_route.post('/check-cart', cartController.checkCart);

// change cart quantity
user_route.post('/change-quantity', cartController.changeQuantity);





//checkout 
user_route.get('/checkout', userAuth.isLogin, cartController.loadCheckout);
// place order
user_route.post('/place-order', orderController.placeOrder);

// user_route.get('/online-payment',paymentController.paymentGateway)

// user_route.post('/create-online-order',paymentController.createOrderPayment)


//wishlist 
user_route.get('/wishlist', userAuth.isLogin, wishlistController.loadWishlist);

//add to wishlist
user_route.post('/add-to-wishlist', wishlistController.addToWishlist);

//remove from wishlist
user_route.post('/remove-wishlist', userAuth.checkLogin, wishlistController.removeFromWishlist);






//add address
user_route.post('/add-address', userProfileController.addAddress);
user_route.get('/edit-address', userAuth.isLogin, userProfileController.editAddress);
user_route.post('/edit-address', userProfileController.updateAddress);


//order success
user_route.get('/order-success/:orderId', orderController.loadOrderSuccess);

//order details
user_route.get('/order-details', userAuth.isLogin, orderController.loadOrderDetails);

// my order
user_route.get('/my-orders', userAuth.isLogin, orderController.loadMyOrder)

//cancel order
user_route.post('/cancel-order', orderController.orderCancel);

user_route.get('/single-order-product', userAuth.isLogin, orderController.singleOrderProduct)

user_route.post('/return-product', orderController.returnProduct)


// razor pay failed
user_route.put('/order/razorpay-failed', orderController.razorPayFailed)

// verify razorpay payment
user_route.post('/order/verify-payment',paymentController.verifyPaymentRazorpay)

//order-single-product
// user_route.get('/order-single-product', orderController.orderSingleProduct);

// user_route.post('/change-order-status-single', orderController.updateSingleOrderStatus);


// 404 error
// user_route.get('/*',userController.loadError)//


module.exports = user_route;