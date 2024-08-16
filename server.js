const express = require('express');
const app = express();
const path = require('path');
const flash = require('express-flash');
require('dotenv').config();
const { MONGO_CONNECTION } = process.env;

// Connect to MongoDB
const mongoose = require('mongoose');
mongoose.connect(MONGO_CONNECTION)
  .then(() => console.log("Mongo Db Connected"))
  .catch((error) => console.log(error));

// Set up flash messages for user notifications
app.use(flash());

// Parse incoming JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set view engine and views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to set up data for all routes
const userHelper = require('./middlewares/userHelper');
app.use(userHelper.countOfCartAndWishlist);

// Admin routes
const admin_route = require('./router/adminRoute');
app.use('/admin', admin_route);

// User routes
const user_route = require('./router/userRoute');
app.use('/', user_route);

// Error handling for 404 (Not Found) 
app.use((req, res, next) => {
  const requestPath = req.originalUrl;
  
  // Different error pages based on the route
  if (requestPath.startsWith('/admin')) {
    res.status(404).render('admin/admin-404', { errorMessage: 'Page Not Found' });
  } else if (requestPath.startsWith('/')) {
    res.status(404).render('user/Error404', { errorMessage: 'Page Not Found' });
  } else {
    res.status(404).render('user/Error404', { errorMessage: 'Page Not Found' });
  }
});

// Error handling for 500 (Internal Server Error)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error/error-500', { errorMessage: err.message || 'Internal Server Error' });
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
