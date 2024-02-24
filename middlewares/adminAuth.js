const isLogin = (req, res, next) => {
    try {
        if (req.session.admin) {
            // console.log('next islogin');//-------------------------------
            next();
        } else {
            // console.log('admin login islogin');//------------------
            res.redirect('/admin/login');
        }
    } catch (error) {
        console.log(error);
    }
}



const isLogout = (req, res, next) => {
    try {
        if (req.session.admin) {
            // console.log('admin home logout');//-----------------------------------
            res.redirect('/admin/login');
        } else { 
            // console.log('next logout');//-------------------------
            next();
        }
    } catch (error) {
        console.log(error);
    }  
}


module.exports = {
    isLogin,
    isLogout
}