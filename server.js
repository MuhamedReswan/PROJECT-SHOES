const express = require('express'); 
const app = express();
const path = require('path');
const flash = require('express-flash');
require('dotenv').config();
const { MONGO_CONNECTION } = process.env;
const userController = require('../PROJECT SHOES/controller/userController')







// data base connected
const mongoose = require('mongoose');
mongoose.connect(MONGO_CONNECTION)
.then(() => {
    console.log("Mongo Db Connected");
}).catch((error) => {
    console.log(error);
});

app.use(flash());
app.use(express.static(path.join(__dirname,'public')));
// app.use('/user',express.static(path.join(__dirname,'public/user')));
// app.use(express.static(path.join(__dirname,'public/user')));




// uer route 
const user_route = require('./router/userRoute');
app.use('/', user_route);

// admin route
const admin_route = require('./router/adminRoute');
app.use('/admin',admin_route);


// 404 handling
// app.use('*',userController.loadError404)
app.use("*", (req, res) => {
    res.status(404).render(path.join(__dirname, "views/users/404.ejs"));
  });

const PORT = process.env.PORT || 3001;
app.listen(PORT,()=>{
    console.log(`http://localhost:${PORT}`);
})