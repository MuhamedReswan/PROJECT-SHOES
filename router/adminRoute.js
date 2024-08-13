const express = require('express');
const admin_route = express();
const path = require('path')
const session = require('express-session');
const multerUpload = require('../middlewares/multer');
const nocache =require('nocache');

// const upload = multer({ dest: 'uploads/' });
// const multer = require('multer');



const config = require('../config/config');

const adminController = require('../controller/adminController');
const productController =require('../controller/productController');
const categoryController =require('../controller/categoryController');
const orderController = require('../controller/orderController');
const couponController = require('../controller/couponController');
const bannerController = require('../controller/bannerController');
const adminAuth = require('../middlewares/adminAuth');
const adminHelper = require('../middlewares/adminHelpers')



admin_route.use('/user',express.static(path.join(__dirname,'public/user')));
admin_route.use('/admin',express.static(path.join(__dirname,'public/admin')));

admin_route.use(session({secret:config.sessionSecret,resave:false,saveUninitialized:false}));
admin_route.use(nocache());


admin_route.set('views', './views/admin');

// setting global middleware
admin_route.use((req,res,next)=>{
    res.locals.admin =req.session.admin;
    res.adminLoggedIn = req.session.admin ? true : false; 
    console.log('locals.admin',res.locals.admin,);//-------------
    console.log('adminLoggedIn',res.adminLoggedIn,);//-------------
    next();   
})


// admin login
admin_route.get('/login', adminAuth.isLogout, adminHelper.returnRequestCount, adminController.adminLoginLoad);
admin_route.post('/login', adminAuth.isLogout, adminController.verifyAdminLogin);


// admin home
admin_route.get('/',adminAuth.isLogin,adminHelper.returnRequestCount, adminController.loadDashboard);


// user management
admin_route.get('/customers', adminAuth.isLogin, adminHelper.returnRequestCount, adminController.customersLoad);

// block user
admin_route.post('/block-user', adminAuth.isLogin, adminController.blockUser);

//admin logout 
admin_route.get('/logout',adminAuth.isLogin, adminHelper.returnRequestCount, adminController.loadLogout);

// list product  
admin_route.get('/products-list' ,adminAuth.isLogin, adminHelper.returnRequestCount, productController.ProductsList);

//add product 
admin_route.get('/add-products' ,adminAuth.isLogin, adminHelper.returnRequestCount, productController.addProducts);
admin_route.post('/add-products',adminAuth.isLogin, multerUpload.array('images'), productController.insertProduct);

// edit products
admin_route.get('/edit-products/:id',adminAuth.isLogin, adminHelper.returnRequestCount, productController.loadEditProduct);
admin_route.post('/edit-products', adminAuth.isLogin, multerUpload.array('images'), productController.updateProduct);

// product list and unlist
admin_route.post('/products-list', adminAuth.isLogin, productController.productListAndUnlist);

// load catagory
admin_route.get('/category' ,adminAuth.isLogin, adminAuth.isLogin, adminHelper.returnRequestCount, categoryController.loadCategory);

//add category 
admin_route.get('/add-category',adminAuth.isLogin, adminHelper.returnRequestCount, categoryController.addCategory);
admin_route.post('/add-category', adminAuth.isLogin, categoryController.insertCategory);

// edit category
admin_route.get('/edit-category',adminAuth.isLogin, adminHelper.returnRequestCount, categoryController.loadEditCategory);
admin_route.post('/edit-category', adminAuth.isLogin, categoryController.updateCategory);

// list and unlist category
admin_route.post('/list-category', adminAuth.isLogin, categoryController.categoryListAndUnlist);


//orders
admin_route.get('/orders',adminAuth.isLogin, adminHelper.returnRequestCount, orderController.adminOrders);
//single order
admin_route.get('/order-single',adminAuth.isLogin, adminHelper.returnRequestCount, orderController.singleOrderDetails);

//single order status change
admin_route.post('/change-order-status', adminAuth.isLogin, adminHelper.returnRequestCount, orderController.changeOrderStatus);

// return request
admin_route.get('/return-request',adminAuth.isLogin, adminHelper.returnRequestCount, orderController.loadReturnRequest);

// return product status change
admin_route.post('/return-product-status-change', adminAuth.isLogin, orderController.changeRetrunProductStatus);


//coupon Management 
admin_route.get('/coupons',adminAuth.isLogin, adminHelper.returnRequestCount, couponController.loadcouponManagement);

//add coupon 
 admin_route.post('/coupons/add-coupon', adminAuth.isLogin, couponController.addCoupon);

 //edit coupon 
  admin_route.post('/coupons/edit-coupon',adminAuth.isLogin, couponController.updateCoupon);

  // change coupon status
  admin_route.post('/coupons/change-status', adminAuth.isLogin,couponController.changeStatus);


  // offers
  admin_route.get('/offers',adminAuth.isLogin, adminHelper.returnRequestCount, adminController.loadOffers);

  // add offer 
   admin_route.get('/offers/add-offer',adminAuth.isLogin, adminHelper.returnRequestCount, adminController.addOffer);

   // insert offer
   admin_route.post('/offers/add-offer',adminAuth.isLogin,adminController.insertOffer);

   // edit offer
admin_route.get('/offers/edit-offer',adminAuth.isLogin, adminHelper.returnRequestCount, adminController.editOffer);   

//update offer
admin_route.post('/offers/edit-offer',adminAuth.isLogin,adminController.updateOffer);

// change offer status
admin_route.post('/offers/change-status',adminAuth.isLogin,adminController.changeOfferStatus);

// load offers for category and product
admin_route.get('/apply-offer/offer',adminAuth.isLogin, adminController.loadOfferForApply);

// apply offers for product
admin_route.post('/product/apply-offer',adminAuth.isLogin,adminController.applyPoductOffer);

// remove offers from product 
admin_route.post('/product/remove-offer',adminAuth.isLogin,adminController.removePoductOffer);


// apply offer on category
admin_route.post('/category/apply-offer',adminAuth.isLogin,adminController.applyCategoryOffer);

// remove offer on category
admin_route.post('/category/remove-offer',adminAuth.isLogin,adminController.removecategoryOffer)


// sales report 
admin_route.get('/sales-report', adminAuth.isLogin, adminHelper.returnRequestCount, adminController.loadSalesreport);

//filter chart
admin_route.post('/dashboard/filter-chart',adminAuth.isLogin,adminController.filterYearlyMonthly);




// load banners
 admin_route.get('/banners',adminAuth.isLogin, adminHelper.returnRequestCount, bannerController.loadBanners);
 admin_route.get('/banners/add-banner',adminAuth.isLogin, adminHelper.returnRequestCount, bannerController.loadAddBanner );
 admin_route.post('/banners/add-banner',adminAuth.isLogin,multerUpload.single('image'),bannerController.insertBanners );
 admin_route.post('/banners/change-status',adminAuth.isLogin,bannerController.changeBannerStatus)
 admin_route.get('/banners/edit-banner',adminAuth.isLogin, adminHelper.returnRequestCount, bannerController.loadEditBanner)
 admin_route.post('/banners/edit-banner',adminAuth.isLogin,multerUpload.single('image'),bannerController.updateBanner)

 
// 404
admin_route.get('*', adminAuth.isLogin,adminController.loadError404);

// app.use("*", (req, res) => {
//     res.status(404).render("error/error-404");
//   });
module.exports=admin_route;

