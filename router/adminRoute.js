const express = require('express');
const admin_route = express();
const path = require('path')
const session = require('express-session');
const multerUpload = require('../middlewares/multer');
// const nocache =require('nocache');


const config = require('../config/config');

const adminController = require('../controller/adminController');
const productController =require('../controller/productController');
const categoryController =require('../controller/categoryController');
const adminAuth = require('../middlewares/adminAuth');
const orderController = require('../controller/orderController')


// admin_route.use(express.static(path.join(__dirname,'public')));
admin_route.use('/user',express.static(path.join(__dirname,'public/user')));
admin_route.use('/admin',express.static(path.join(__dirname,'public/admin')));

admin_route.use(session({secret:config.sessionSecret,resave:false,saveUninitialized:false}));
// admin_route.use(nocache());


admin_route.set('view engine', 'ejs');
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
admin_route.get('/login', adminAuth.isLogout, adminController.adminLoginLoad);
admin_route.post('/login', adminController.verifyAdminLogin);

//global middleware
admin_route.use(adminAuth.isLogin);

// admin home
admin_route.get('/', adminController.loadDashboard);


// user management
admin_route.get('/customers',adminAuth.isLogin, adminController.customersLoad);

// block user
admin_route.post('/block-user', adminController.blockUser);

//admin logout 
admin_route.get('/logout',adminAuth.isLogin, adminController.loadLogout);
  



// list product  
admin_route.get('/products-list', productController.ProductsList);

//add product 
admin_route.get('/add-products', productController.addProducts);
admin_route.post('/add-products', multerUpload.array('images'), productController.insertProduct);

// edit products
admin_route.get('/edit-products/:id', productController.loadEditProduct);
admin_route.post('/edit-products', multerUpload.array('images'), productController.updateProduct);

// product list and unlist
admin_route.post('/products-list',productController.productListAndUnlist);




// load catagory
admin_route.get('/category', adminAuth.isLogin, categoryController.loadCategory);

//add category 
admin_route.get('/add-category', categoryController.addCategory);
admin_route.post('/add-category', categoryController.insertCategory);

// edit category
admin_route.get('/edit-category', categoryController.loadEditCategory);
admin_route.post('/edit-category', categoryController.updateCategory);

// list and unlist category
admin_route.post('/list-category', categoryController.categoryListAndUnlist);


//orders
admin_route.get('/orders', orderController.adminOrders);
//single order
admin_route.get('/order-single', orderController.singleOrderDetails);

//single order status change
admin_route.post('/change-order-status',orderController.changeOrderStatus)

// return request
admin_route.get('/return-request',orderController.loadReturnRequest)






// admin_route.post('admin/login', adminController.LoginVerify);

module.exports=admin_route;

// on userlist delete