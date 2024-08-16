
const isLogin = (req, res, next) => {
    try {
        if (req.session.admin) {
            next(); // Proceed if admin session exists
        } else {
            res.redirect('/admin/login'); // Redirect to login if not logged in
        }
    } catch (error) {
        console.error("Error in isLogin middleware:", error);
        res.status(500).send("Internal Server Error");
    }
};

const isLogout = (req, res, next) => {
    try {
        if (req.session.admin) {
            res.redirect('/admin/'); // Redirect to admin home if already logged in
        } else {
            next(); // Proceed if no admin session
        }
    } catch (error) {
        console.error("Error in isLogout middleware:", error);
        res.status(500).send("Internal Server Error");
    }
};

module.exports = {
    isLogin,
    isLogout
};
