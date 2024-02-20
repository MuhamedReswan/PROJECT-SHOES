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


// admin_route.use(express.static(path.join(__dirname,'public')));
// admin_route.use('/user',express.static(path.join(__dirname,'public/user')));
admin_route.use('/admin',express.static(path.join(__dirname,'public/admin')));

admin_route.use(session({secret:config.sessionSecret,resave:false,saveUninitialized:false}));
// admin_route.use(nocache());


admin_route.set('view engine', 'ejs');
admin_route.set('views', './views/admin');



// admin home
admin_route.get('/admin', adminController.loadDashboard);
admin_route.get('/dashboard', adminController.loadDashboard);

// admin login
admin_route.get('/login', adminController.adminLoginLoad);
admin_route.post('/login', adminController.verifyAdminLogin);

// user management
admin_route.get('/customers', adminController.customersLoad);

// block user
admin_route.post('/block-user', adminController.blockUser);





// list product  
admin_route.get('/products-list', productController.ProductsList);

//add product 
admin_route.get('/add-products', productController.addProducts);
admin_route.post('/add-products', multerUpload.array('images'), productController.insertProduct);

// edit products
admin_route.get('/edit-products/:id', productController.loadEditProduct);
admin_route.post('/edit-products', multerUpload.array('images'), productController.updateProduct);





// load catagory
admin_route.get('/category', categoryController.loadCategory);

//add category 
admin_route.get('/add-category', categoryController.addCategory);
admin_route.post('/add-category', categoryController.insertCategory);

// edit category
admin_route.get('/edit-category', categoryController.loadEditCategory);
admin_route.post('/edit-category', categoryController.updateCategory);

// list and unlist category
admin_route.post('/list-category', categoryController.categoryListAndUnlist);





// admin_route.post('admin/login', adminController.LoginVerify);

module.exports=admin_route;

// on userlist delete