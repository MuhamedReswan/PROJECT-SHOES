const isLogin = (req, res, next) => {
    try {
        if (req.session.user) {
            console.log('next islogin');
            next();
        } else {
            console.log('login islogin');
            res.redirect('/');
        }
    } catch (error) {
        console.log(error);
    }
}



const isLogout = (req, res, next) => {
    try {
        if (req.session.user) {
            console.log('home logout');
            res.redirect('/');
        } else { 
            console.log('next logout');
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