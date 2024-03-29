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
const orderController =require('../controller/orderController');
const config = require('../config/config');
const userAuth = require('../middlewares/userAuth');


user_route.use('/user',express.static(path.join(__dirname,'public/user')));
// user_route.use(express.static(path.join(__dirname,'public/user/images')));

user_route.use(session({secret:config.sessionSecret,resave:false,saveUninitialized:false}));
// user_route.use(nocache());



user_route.use(express.json());
user_route.use(express.urlencoded({extended:true}));


// set view engine
user_route.set('view engine', 'ejs');
user_route.set('views', './views/user');

user_route.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.logedIn = req.session.user ? true : false;
    next();
})

user_route.use((req, res, next) => {
    console.log('method',req.method,'path', req.path);
    next();
})

// load home
user_route.get('/',userController.loadHome );

// load sign up
user_route.get('/signup',userAuth.isLogout,userController.loadRegister);

// insert user
user_route.post('/signup',userController.insertUser);

// logout
user_route.get('/logout',userController.userLogout);

// load login
user_route.get('/login',userAuth.isLogout,userController.loadLogin);

// verify login 
user_route.post('/login',userController.verifyLogin);

// load otp
user_route.get('/otp',userAuth.isLogout,userController.loadOtp);

// verify otp
user_route.post('/otp',userController.verifyOtp);

// resend otp
user_route.get('/resend/:email',userController.resendOtp);

//forgot password
user_route.get('/forgot-password', userController.loadForgotPassword);

//update password
user_route.post('/forgot-password', userController.forgotPassword);

// reset Password 
user_route.get('/reset-password/:id/:token', userController.loadResetPassword);
user_route.post('/reset-password', userController.resetPassword);

//profile
user_route.get('/profile', userController.loadProfile)



// load shop
user_route.get('/shop',shopController.loadShop);

// load single Product
user_route.get('/single-product',shopController.loadSingleProduct);




// load cart
user_route.get('/cart',userAuth.checkLogin,cartController.loadCart);

// add to cart
user_route.post('/addtocart',userAuth.isLogin,cartController.addToCart);//want to add middleware to login

// remove single product from cart
user_route.post('/remove-cart',cartController.removeFromCart);

// check cart
user_route.post('/check-cart',cartController.checkCart);

// change cart quantity
user_route.post('/change-quantity',cartController.changeQuantity);





//checkout 
user_route.get('/checkout',cartController.loadCheckout);
 
// place order
user_route.post('/place-order',orderController.placeOrder);



//wishlist 
user_route.get('/wishlist',wishlistController.loadWishlist);

//add to wishlist
// user_route.post('/add-to-wishlist',userAuth.checkLogin,wishlistController.addToWishlist);





//add address
user_route.post('/add-address',userAuth.checkLogin,userProfileController.addAddress);


//order success
user_route.get('/order-success/:orderId', orderController.loadOrderSuccess);

//order details
user_route.get('/order-details', orderController.loadOrderDetails);


// 404 error
// user_route.get('/*',userController.loadError)//


module.exports=user_route;