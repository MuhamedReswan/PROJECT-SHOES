const express = require('express');
const admin_route = express();
const path = require('path');
const session = require('express-session');
const multerUpload = require('../middlewares/multer');
const nocache = require('nocache');
const config = require('../config/config');

// Controllers
const adminController = require('../controller/adminController');
const productController = require('../controller/productController');
const categoryController = require('../controller/categoryController');
const orderController = require('../controller/orderController');
const couponController = require('../controller/couponController');
const bannerController = require('../controller/bannerController');

// Middleware
const adminAuth = require('../middlewares/adminAuth');
const adminHelper = require('../middlewares/adminHelpers');

// Serve static files
admin_route.use('/user', express.static(path.join(__dirname, 'public/user')));
admin_route.use('/admin', express.static(path.join(__dirname, 'public/admin')));

// Session management and security
admin_route.use(session({ secret: config.sessionSecret, resave: false, saveUninitialized: false }));
admin_route.use(nocache());

// Set views directory
admin_route.set('views', './views/admin');

// Global middleware to set up data for all routes
admin_route.use((req, res, next) => {
    res.locals.admin = req.session.admin;
    res.adminLoggedIn = req.session.admin ? true : false;
    console.log('locals.admin', res.locals.admin); 
    console.log('adminLoggedIn', res.adminLoggedIn); 
    next();
});

// Admin Authentication Routes
admin_route.get('/login', adminAuth.isLogout, adminHelper.returnRequestCount, adminController.adminLoginLoad);
admin_route.post('/login', adminAuth.isLogout, adminController.verifyAdminLogin);
admin_route.get('/logout', adminAuth.isLogin, adminHelper.returnRequestCount, adminController.loadLogout);

// Admin Home and Dashboard
admin_route.get('/', adminAuth.isLogin, adminHelper.returnRequestCount, adminController.loadDashboard);

// User Management
admin_route.get('/customers', adminAuth.isLogin, adminHelper.returnRequestCount, adminController.customersLoad);
admin_route.post('/block-user', adminAuth.isLogin, adminController.blockUser);

// Product Management
admin_route.get('/products-list', adminAuth.isLogin, adminHelper.returnRequestCount, productController.ProductsList);
admin_route.get('/add-products', adminAuth.isLogin, adminHelper.returnRequestCount, productController.addProducts);
admin_route.post('/add-products', adminAuth.isLogin, multerUpload.array('images'), productController.insertProduct);
admin_route.get('/edit-products/:id', adminAuth.isLogin, adminHelper.returnRequestCount, productController.loadEditProduct);
admin_route.post('/edit-products', adminAuth.isLogin, multerUpload.array('images'), productController.updateProduct);
admin_route.post('/products-list', adminAuth.isLogin, productController.productListAndUnlist);

// Category Management
admin_route.get('/category', adminAuth.isLogin, adminHelper.returnRequestCount, categoryController.loadCategory);
admin_route.get('/add-category', adminAuth.isLogin, adminHelper.returnRequestCount, categoryController.addCategory);
admin_route.post('/add-category', adminAuth.isLogin, categoryController.insertCategory);
admin_route.get('/edit-category', adminAuth.isLogin, adminHelper.returnRequestCount, categoryController.loadEditCategory);
admin_route.post('/edit-category', adminAuth.isLogin, categoryController.updateCategory);
admin_route.post('/list-category', adminAuth.isLogin, categoryController.categoryListAndUnlist);

// Order Management
admin_route.get('/orders', adminAuth.isLogin, adminHelper.returnRequestCount, orderController.adminOrders);
admin_route.get('/order-single', adminAuth.isLogin, adminHelper.returnRequestCount, orderController.singleOrderDetails);
admin_route.post('/change-order-status', adminAuth.isLogin, adminHelper.returnRequestCount, orderController.changeOrderStatus);
admin_route.get('/return-request', adminAuth.isLogin, adminHelper.returnRequestCount, orderController.loadReturnRequest);
admin_route.post('/return-product-status-change', adminAuth.isLogin, orderController.changeRetrunProductStatus);

// Coupon Management
admin_route.get('/coupons', adminAuth.isLogin, adminHelper.returnRequestCount, couponController.loadCouponManagement);
admin_route.post('/coupons/add-coupon', adminAuth.isLogin, couponController.addCoupon);
admin_route.post('/coupons/edit-coupon', adminAuth.isLogin, couponController.updateCoupon);
admin_route.post('/coupons/change-status', adminAuth.isLogin, couponController.changeStatus);

// Offer Management
admin_route.get('/offers', adminAuth.isLogin, adminHelper.returnRequestCount, adminController.loadOffers);
admin_route.get('/offers/add-offer', adminAuth.isLogin, adminHelper.returnRequestCount, adminController.addOffer);
admin_route.post('/offers/add-offer', adminAuth.isLogin, adminController.insertOffer);
admin_route.get('/offers/edit-offer', adminAuth.isLogin, adminHelper.returnRequestCount, adminController.editOffer);
admin_route.post('/offers/edit-offer', adminAuth.isLogin, adminController.updateOffer);
admin_route.post('/offers/change-status', adminAuth.isLogin, adminController.changeOfferStatus);
admin_route.get('/apply-offer/offer', adminAuth.isLogin, adminHelper.returnRequestCount, adminController.loadOfferForApply);
admin_route.post('/product/apply-offer', adminAuth.isLogin, adminController.applyProductOffer);
admin_route.post('/product/remove-offer', adminAuth.isLogin, adminController.removeProductOffer);
admin_route.post('/category/apply-offer', adminAuth.isLogin, adminController.applyCategoryOffer);
admin_route.post('/category/remove-offer', adminAuth.isLogin, adminController.removeCategoryOffer);

// Sales Report
admin_route.get('/sales-report', adminAuth.isLogin, adminHelper.returnRequestCount, adminController.loadSalesReport);
admin_route.post('/dashboard/filter-chart', adminAuth.isLogin, adminController.filterYearlyMonthly);

// Banner Management
admin_route.get('/banners', adminAuth.isLogin, adminHelper.returnRequestCount, bannerController.loadBanners);
admin_route.get('/banners/add-banner', adminAuth.isLogin, adminHelper.returnRequestCount, bannerController.loadAddBanner);
admin_route.post('/banners/add-banner', adminAuth.isLogin, multerUpload.single('image'), bannerController.insertBanners);
admin_route.post('/banners/change-status', adminAuth.isLogin, bannerController.changeBannerStatus);
admin_route.get('/banners/edit-banner', adminAuth.isLogin, adminHelper.returnRequestCount, bannerController.loadEditBanner);
admin_route.post('/banners/edit-banner', adminAuth.isLogin, multerUpload.single('image'), bannerController.updateBanner);

// 404 Error Handling
admin_route.get('*', adminAuth.isLogin, adminController.loadError404);

module.exports = admin_route;
