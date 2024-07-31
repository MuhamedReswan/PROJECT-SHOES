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
app.use("*", (req, res) => {
    res.status(404).render(path.join(__dirname, "views/user/404.ejs"));
  });
  

// set view engine
app.set('view engine', 'ejs');


// for error message render
app.set('views', './views');



  // Global Error Handler Middleware (Define this last)
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err.stack); // Log the error stack trace for debugging
  
    // Set the response status code
    res.status(err.status || 500);
  
    // Check if the request accepts JSON
    // if (req.accepts('json')) {
    //   res.json({ error: err.message || 'Internal Server Error' });
    // } else {
      // Render an error view for web pages
      res.render('error/error-500', { errorMessage: err.message || 'Internal Server Error' });
    // }
  });


const PORT = process.env.PORT || 3001;
app.listen(PORT,()=>{
    console.log(`http://localhost:${PORT}`);
})