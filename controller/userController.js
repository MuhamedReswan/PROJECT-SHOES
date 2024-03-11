const Users = require('../model/userModel');
const bcrypt = require('bcrypt');
const otpModel = require('../model/otpModel');
const Token = require('../model/tokenModel');
const nodemailer = require('nodemailer');
const crypto = require('crypto');



// password secure
const securedPassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error);
    }
}


// load home 
const loadHome = (req, res) => {
    try {
        res.render('home');
    } catch (error) {
        console.log(error);
    }
}

// user logout
const userLogout = (req, res) => {
    try {
        req.session.user = null;
        res.redirect('/');
    } catch (error) {
        console.log(error);
    }

}





//========================================= user login and verify ============================================================

// load login 
const loadLogin = (req, res) => {
    try {
        res.render('login');
        // res.render('test');
    } catch (error) {
        console.log(error);
    }

}


//verify login
const
    verifyLogin = async (req, res) => {
        try {
            const Email = req.body.Email;
            const Password = req.body.Password;
            const userData = await Users.findOne({ email: Email });

            if (userData) {
                const verifyPassword = await bcrypt.compare(Password, userData.password);

                if (verifyPassword) {
                    const userBlock = await userData.isBlocked;

                    if (userBlock) {
                        req.flash('blocked', 'You were blocked By admin')
                        res.redirect('/login');
                    } else {
                        req.session.user = {
                            id: userData._id,
                            name: userData.name,
                            email: userData.email
                        }
                        console.log(req.session.user);
                        res.redirect("/");
                    }
                } else {
                    req.flash('passwordError', 'Incorrect password ');
                    res.redirect('/login')
                }
            } else {
                req.flash('emailError', 'Incorrect email ');
                res.redirect('/login');
            }
        } catch (error) {
            console.log(error);
        }

    }

//=================================== user signup and otp verification =================================================

// load registration 
const loadRegister = (req, res) => {
    try {
        res.render('signup');
    } catch (error) {
        console.log(error);
    }

}


// insert user
const insertUser = async (req, res) => {
    try {
        const hashPassword = await securedPassword(req.body.Password)

        const Name = req.body.Name;
        const Email = req.body.Email;

        const username = await Users.findOne({ name: Name });
        const useremail = await Users.findOne({ email: Email });

        if (username) {
            req.flash('nameExist', 'User name already exist');
            res.redirect('/signup');

        } else if (useremail) {
            req.flash('emailExist', 'Email already exist');
            res.redirect('/signup');

        } else {
            const user = new Users({
                email: req.body.Email,
                name: req.body.Name,
                mobile: req.body.Mobile,
                password: hashPassword,
                isAdmin: false,
                isBlocked: false,
                verified: false,
            })

            const userData = await user.save();

            if (userData) {
                sendOtp(user.email);
                res.redirect(`/otp?email=${user.email}`);

            } else {
                console.log('not saved userData....');
            }
        }
    } catch (error) {
        console.log(error);
    }

}


// load otp
const loadOtp = (req, res) => {
    try {
        const email = req.query.email;
        res.render(`otp`, { email: email });
    } catch (error) {
        console.log(error);
    }

}


// send otp
const sendOtp = async (email) => {
    try {
        const transport = nodemailer.createTransport({
            service: 'gmail',
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: 'muhamedreswan9917@gmail.com',
                pass: 'rpwg jlhk dnoa qkcj'
            }
        })

        const createOtp = `${Math.floor(1000 + Math.random() * 9000)}`
        console.log(`OTP${createOtp}`)//-------------------------------------------------

        const mailOption = {
            from: 'muhamedreswan9917@gmail.com',
            to: email,
            subject: "otp verification",
            html: `your otp is ${createOtp}`
        }

        await transport.sendMail(mailOption);
        const hashOtp = await bcrypt.hash(createOtp, 10);

        const userOtp = await new otpModel({
            email: email,
            otp: hashOtp
        })

        const otpSave = await userOtp.save();

    } catch (error) {
        console.log(error);
    }

}


// verify otp 
const verifyOtp = async (req, res) => {
    try {
        const email = req.body.email;
        const otp = req.body.otp1 + req.body.otp2 + req.body.otp3 + req.body.otp4;

        const otpUser = await otpModel.findOne({ email: email });

        if (otpUser) {
            const otpVerification = await bcrypt.compare(otp, otpUser.otp);

            if (otpVerification) {
                const userData = await Users.findOne({ email: email });
                console.log('userData2 = ', userData); //------------------------------------------

                if (userData) {
                    const verifiedTrue = await Users.findByIdAndUpdate({ _id: userData._id }, { $set: { verified: true } });
                    console.log('verifiedTrue' + verifiedTrue);//-----------------------------------------

                    if (verifiedTrue) {
                        await otpModel.deleteOne({ email: otpUser.email });

                        req.flash('success', 'Verification Success...')
                        res.redirect('/login');

                    } else {
                        console.log(' verified verification failed');
                    }

                } else {
                    console.log('userData not getting');
                }
            } else {
                console.log('otp verification failed !');
                req.flash('incorrect', 'Please Enter Valid OTP !');
                res.redirect(`/otp?email=${email}`);
            }
        } else {
            console.log('user not found');
            req.flash('expired', 'OTP Expired  Please Resend');
            res.redirect(`/otp?email=${email}`);
        }
    } catch (error) {
        console.log(error);
    }
}


// resend Otp
const resendOtp = async (req, res) => {
    try {
        const email = req.params.email;

        if (email) {
            await otpModel.deleteMany({ email: email });
            sendOtp(email);
            req.flash('resend', 'OTP Resended ');
            res.redirect(`/otp?email=${email}`);
            console.log('otp resended');//--------------------------

        } else {
            console.log('no email in query');//-----------------
        }

    } catch (error) {
        console.log(error);
    }

}

// ============================================== user signup and verification end =============================================

//  load forgot password
const loadForgotPassword = (req, res) => {
    try {
        res.status(200).render('forgotPassword');
    } catch (error) {
        console.log(error);
        res.status(500).send("Error while rendering forgot password page");
    }
}



// reset password function
const resetPass = async (email, res) => {
    try {
        email = email;
        const user = await Users.findOne({ email: email });
        if (!user) {
            return res.status(400).send('user with this email is not existing');
        }
        let token = await Token.findOne({ userId: user._id });
        console.log('reswantoken1', token);//-------------------
        if (!token) {
            console.log('reswan');//----------------------------
            token = new Token({ userId: user._id, token: crypto.randomBytes(32).toString('hex') })
            console.log('reswantoken', token);//-------------------
            await token.save();
        }

        const transport = nodemailer.createTransport({
            service: 'gmail',
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: 'muhamedreswan9917@gmail.com',
                pass: 'rpwg jlhk dnoa qkcj'
            }
        })

        const restPage = `http://localhost:3001/reset-password/${user._id}/${token.token}`

        const mailOption = {
            from: 'muhamedreswan9917@gmail.com',
            to: email,
            subject: "Verify Your Email",
            html: `Your reset password link is ${restPage}`
        }

        await transport.sendMail(mailOption);
    } catch (error) {
        console.log(error);
    }


}

// forgot password
const forgotPassword = async (req, res) => {
    try {
        const email = req.body.email;
        console.log(req.body, 'body');//------------------------------------
        console.log(email, 'email');//------------------------
        await resetPass(email, res)
        req.flash('success', 'Sent a reset password link to your email');
        res.redirect('/login');
    } catch (error) {

    }
}

// load reset password 
const loadResetPassword = async (req, res) => {
    try {
        const userId = req.params.id;
        const token = req.params.token;
        res.render('resetPassword', { userId, token });

    } catch (error) {
        console.log(error);
    }
}

//reset password
const resetPassword = async (req, res) => {
    try {
        console.log(req.body, 'body')//-----------------------------
        const userId = req.body.userId;
        const token = req.body.token;
        const password = req.body.confirmPassword;

        const user = await Users.findOne({ _id: userId });
        console.log(user, 'user');//--------------

        if (!user) {
            console.log('from user')//-------------
            res.status(400).send('Invalid link or expired');
        }
        const { email } = user;

        const tok = await Token.findOne({ token: token, userId: userId });

        if (!tok) {
            console.log('from token');//-----------------
            res.status(400).send('Invalid link or link expeired');
        }

        const hashPassword = await securedPassword(password)

        await Users.updateOne({
            email: email
        },
            {
                $set: {
                    password: hashPassword
                }
            })

            req.flash('success', 'New password added successful');
            res.redirect('/login');
    } catch (error) {
        console.log(error)
    }

}

// profile 
const loadProfile = (req,res)=>{
    try {
        console.log('profile working');//------------------
        res.render('addProfile')
    } catch (error) {
        console.log(error)
    }
}



// 404 Error
const loadError = (req, res) => {
    try {
        res.render('404');
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    loadHome,
    loadRegister,
    loadLogin,
    insertUser,
    verifyLogin,
    loadOtp,
    verifyOtp,
    sendOtp,
    resendOtp,
    userLogout,
    loadError,
    loadForgotPassword,
    forgotPassword,
    loadResetPassword,
    resetPassword,
    loadProfile,





}
