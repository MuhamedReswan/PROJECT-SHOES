const isLogin = (req, res, next) => {
    try {
        if (req.session?.user) {
            console.log('User is logged in, proceeding to the next middleware/route.');
            next(); // User is logged in, proceed to the next middleware/route
        } else {
            console.log('User is not logged in, redirecting to the login page.');
            res.redirect('/login'); // User is not logged in, redirect to the login page
        }
    } catch (error) {
        console.error('Error in isLogin middleware:', error);
        res.status(500).send('Internal Server Error'); 
    }
};

const isLogout = (req, res, next) => {
    try {
        if (req.session?.user) {
            console.log('User is logged in, redirecting to the home page.');
            res.redirect('/'); // User is logged in, redirect to the home page
        } else {
            console.log('User is not logged in, proceeding to the next middleware/route.');
            next(); 
        }
    } catch (error) {
        console.error('Error in isLogout middleware:', error);
        res.status(500).send('Internal Server Error'); 
    }
};

const checkLogin = (req, res, next) => {
    try {
        if (req.session?.user) {
            console.log('User is logged in, proceeding to the next middleware/route.');
            next();
        } else {
            console.log('User is not logged in, redirecting to the login page.');
            res.redirect('/login'); // User is not logged in, redirect to the login page
        }
    } catch (error) {
        console.error('Error in checkLogin middleware:', error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    isLogin,
    isLogout,
    checkLogin
};
