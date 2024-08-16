const Users = require('../model/userModel');
const bcrypt = require('bcrypt');
const otpModel = require('../model/otpModel');
const Token = require('../model/tokenModel');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const Wallet = require('../model/walletModel');
const otpGenerator = require('otp-generator');
// const { default: products } = require('razorpay/dist/types/products');
const Razorpay = require('razorpay');
const Products = require('../model/productsModel');
const Orders = require('../model/orderModel');
const Banners = require('../model/bannerModel');
const { match } = require('assert');
const Category = require('../model/categoryModel');



// password secure
const securedPassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
        throw error;
        }
}

// Error 500
const loadError500 = (req, res,next) => {
    try {
        res.render('')
    } catch (error) {
        console.log(error.message);
        next(error);
    }
}


// load home 
const loadHome = async (req, res,next) => {
    try {
        console.log("resqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq", req.query)//------------------

        const mostPopularProduct = await Orders.aggregate([
            { $match: { orderStatus: "Delivered" } },
            { $unwind: '$products' },
            { $match: { 'products.status': "Delivered" } },

            {
                $lookup: {
                    from: 'products',
                    localField: 'products.productId',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },

            {
                $lookup: {
                    from: 'categories',
                    localField: 'product.category',
                    foreignField: '_id',
                    as: 'categoryDetails'
                }
            },
            { $unwind: '$categoryDetails' },

            {
                $lookup: {
                    from: 'offers',
                    localField: 'product.appliedOffer',
                    foreignField: '_id',
                    as: 'productOffer'
                }
            },
            { $unwind: { path: '$productOffer', preserveNullAndEmptyArrays: true } },

            {
                $lookup: {
                    from: 'offers',
                    localField: 'categoryDetails.appliedOffer',
                    foreignField: '_id',
                    as: 'categoryOffer'
                }
            },
            { $unwind: { path: '$categoryOffer', preserveNullAndEmptyArrays: true } },

            {
                $addFields: {
                    maxDiscount: {
                        $max: [
                            { $ifNull: ['$productOffer.discount', 0] },
                            { $ifNull: ['$categoryOffer.discount', 0] }
                        ]
                    },
                    finalPrice: {
                        $cond: [
                            { $gt: [{ $ifNull: ['$productOffer.discount', 0] }, 0] },
                            {
                                $subtract: [
                                    '$product.offerPrice',
                                    { $multiply: ['$product.offerPrice', { $divide: [{ $ifNull: ['$productOffer.discount', 0] }, 100] }] }
                                ]
                            },
                            {
                                $cond: [
                                    { $gt: [{ $ifNull: ['$categoryOffer.discount', 0] }, 0] },
                                    {
                                        $subtract: [
                                            '$product.offerPrice',
                                            { $multiply: ['$product.offerPrice', { $divide: [{ $ifNull: ['$categoryOffer.discount', 0] }, 100] }] }
                                        ]
                                    },
                                    { $ifNull: ['$product.price', '$product.offerPrice'] }
                                ]
                            }
                        ]
                    }
                }
            },

            {
                $group: {
                    _id: '$product._id',
                    product: { $first: '$product' },
                    brand: { $first: '$product.brand' },
                    category: { $first: '$categoryDetails.name' },
                    image: { $first: { $arrayElemAt: ['$product.images', 0] } },
                    finalPrice: { $first: '$finalPrice' },
                    soldCount: { $sum: 1 },
                    discountPercentage: { $first: '$maxDiscount' }
                }
            },

            { $sort: { soldCount: -1 } },
            { $limit: 5 }
        ]);





        const latestProduct = await Products.aggregate([
            { $sort: { created: -1 } },
            { $limit: 4 },

            {
                $lookup: {
                    from: 'offers',
                    localField: 'appliedOffer',
                    foreignField: '_id',
                    as: 'productOffer'
                }
            },
            { $unwind: { path: '$productOffer', preserveNullAndEmptyArrays: true } },

            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },

            {
                $lookup: {
                    from: 'offers',
                    localField: 'category.appliedOffer',
                    foreignField: '_id',
                    as: 'categoryOffer'
                }
            },
            { $unwind: { path: '$categoryOffer', preserveNullAndEmptyArrays: true } },

            {
                $addFields: {
                    maxDiscount: {
                        $max: [
                            { $ifNull: ['$productOffer.discount', 0] },
                            { $ifNull: ['$categoryOffer.discount', 0] }
                        ]
                    }
                }
            },
            {
                $addFields: {
                    finalPrice: {
                        $cond: [

                            { $gt: ['$maxDiscount', 0] },
                            { $subtract: ['$offerPrice', { $multiply: ['$offerPrice', { $divide: ['$maxDiscount', 100] }] }] },
                            { $ifNull: ['$offerPrice', '$price'] }
                        ]
                    }
                }
            }
        ]);



const topOfferedProduct = await Products.aggregate([
    {$match:{isListed:true}},

    {
        $lookup: {
            from: 'offers',
            localField: 'appliedOffer',
            foreignField: '_id',
            as: 'productOffer'
        }
    },
    { $unwind: { path: '$productOffer', preserveNullAndEmptyArrays: true } },

    {
        $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'category'
        }
    },
    { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },

    {
        $lookup: {
            from: 'offers',
            localField: 'category.appliedOffer',
            foreignField: '_id',
            as: 'categoryOffer'
        }
    },
    { $unwind: { path: '$categoryOffer', preserveNullAndEmptyArrays: true } },

    {
        $addFields: {
            maxDiscount: {
                $max: [
                    { $ifNull: ['$productOffer.discount', 0] },
                    { $ifNull: ['$categoryOffer.discount', 0] }
                ]
            }
        }
    },
    {
        $addFields: {
            finalPrice: {
                $cond: [

                    { $gt: ['$maxDiscount', 0] },
                    { $subtract: ['$offerPrice', { $multiply: ['$offerPrice', { $divide: ['$maxDiscount', 100] }] }] },
                    { $ifNull: ['$offerPrice', '$price'] }
                ]
            }
        }
    },
    {$sort:{maxDiscount:-1}},
    {$limit:4}

]);

const currentTime = new Date()

const banners = await Banners.find({isListed:true}).sort({createdAt:-1});

console.log("banners",banners)//----------------------------

  
        // console.log("topOfferedProduct ",topOfferedProduct)//----------------------------
        // console.log("latest 5",latestProduct)//----------------------------

        // console.log("mostPopularProduct", mostPopularProduct)//-------------------------------------
        // { successMessage: req.flash('successMessage') 
        res.render('home', { mostPopularProduct, latestProduct, topOfferedProduct,banners });
    } catch (error) {
        console.log(error.message);
        next(error);
    }
}

// user logout
const userLogout = (req, res,next) => {
    try {
        req.session.user = null;
        res.redirect('/');
    } catch (error) {
        console.log(error.message);
        next(error);
    }

}





//========================================= user login and verify ============================================================

// load login 
const loadLogin = (req, res,next) => {
    try {
        // console.log("loginSuccess render1",req.session.user.loginSuccess)//--------------------------

        // const loginSuccess = req.session.user.loginSuccess;
        // console.log("loginSuccess render",loginSuccess)//--------------------------
        // delete req.session.user.loginSuccess; // Clear the message after it's been read
        // res.render('login',{loginSuccess});
        res.render('login');
    } catch (error) {
        console.log(error.message);
        next(error);
    }

}


//verify login
const
    verifyLogin = async (req, res,next) => {
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
                            email: userData.email,
                        }
                        // req.session.user.loginSuccess = 'Login Successful';
                        req.flash('loginSuccess', 'Login Successful')
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
            console.log(error.message);
            next(error);
        }

    }

//=================================== user signup and otp verification =================================================

// load registration 
const loadRegister = (req, res,next) => {
    try {
        const referel = req.query.referel
        res.render('signup', { referel });
    } catch (error) {
        console.log(error.message);
        next(error);
    }

}


// insert user
const insertUser = async (req, res,next) => {
    try {
        const hashPassword = await securedPassword(req.body.Password)

        const Name = req.body.Name;
        const Email = req.body.Email;
        const refCode = req.body?.referel;


        const username = await Users.findOne({ name: Name });
        const useremail = await Users.findOne({ email: Email });

        if (username) {
            req.flash('nameExist', 'User name already exist');
            res.redirect('/signup');

        } else if (useremail) {
            req.flash('emailExist', 'Email already exist');
            res.redirect('/signup');

        } else {

            const referelCode = await otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });

            const user = new Users({
                email: req.body.Email,
                name: req.body.Name,
                mobile: req.body.Mobile,
                password: hashPassword,
                isAdmin: false,
                isBlocked: false,
                verified: false,
                referelCode: referelCode
            })

            const userData = await user.save();

            if (userData) {

                const userId = userData?._id;

                const userWallet = new Wallet({
                    user: userId
                })

                const userWalletDetails = await userWallet.save();

                sendOtp(user.email);

                res.redirect(`/otp?email=${user.email}&referel=${refCode}`);

            } else {
                console.log('not saved userData....');
            }
        }

    } catch (error) {
        console.log(error.message);
        next(error);
    }

}


// load otp
const loadOtp = (req, res,next) => {
    try {
        const email = req.query.email;
        const refCode = req.query.referel;

        // if(refCode){
        res.render(`otp`, { email: email, referelCode: refCode });
        // }else{
        //     res.render(`otp`, { email: email });
        // }

    } catch (error) {
        console.log(error.message);
        next(error);
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
                // pass: 'rpwg jlhk dnoa qkcj'
                pass: 'neek jdze decd qtoa'
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
        console.log(error.message);
        throw error;
            }
}


// verify otp 
const verifyOtp = async (req, res,next) => {
    try {
        const email = req.body.email;
        const referelCode = req.body?.referel;

        const otp = req.body.otp1 + req.body.otp2 + req.body.otp3 + req.body.otp4;
        console.log("otp from the verify", otp)//----------------

        const otpUser = await otpModel.findOne({ email: email });

        if (otpUser) {
            const otpVerification = await bcrypt.compare(otp, otpUser.otp);

            if (otpVerification) {
                const userData = await Users.findOne({ email: email });
                const userId = userData._id;

                if (userData) {
                    const verifiedTrue = await Users.findByIdAndUpdate({ _id: userData._id }, { $set: { verified: true } });
                    console.log('verifiedTrue' + verifiedTrue);//-----------------------------------------

                    if (verifiedTrue) {
                        await otpModel.deleteOne({ email: otpUser.email });

                        if (referelCode) {
                            const referelOwner = await Users.findOne({ referelCode: referelCode });

                            if (referelOwner) {
                                console.log("within valid areferl code  with owner in userCOntroller0")//------------------------------------

                                const transaction = {
                                    amount: 200,
                                    mode: "Credited",
                                    description: "your friend joined thorugh your referel link"
                                }

                                const updateWalletOwner = await Wallet.updateOne(
                                    { user: referelOwner._id },
                                    {
                                        $inc: { balance: 200 },
                                        $push: { transactions: transaction }
                                    },
                                    { new: true })

                                const userTransaction = {
                                    amount: 100,
                                    mode: "Credited",
                                    description: "you got 100 rupees by applied referel code !"
                                }

                                const referlUserWalletUpdation = await Wallet.updateOne(
                                    { user: userId },
                                    {
                                        $inc: { balance: 100 },
                                        $push: { transactions: userTransaction }
                                    },
                                    { new: true }
                                )


                            }
                        }

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
                res.redirect(`/otp?email=${email}&referel=${referelCode}`);
            }
        } else {
            console.log('user not found');
            req.flash('expired', 'OTP Expired  Please Resend');
            res.redirect(`/otp?email=${email}&referel=${referelCode}`);
        }
    } catch (error) {
        console.log(error.message);
        next(error); 
        }
}


// resend Otp
const resendOtp = async (req, res,next) => {
    try {
        const email = req.params.email;
        const referel = req.query.referel;

        if (email) {
            await otpModel.deleteMany({ email: email });
            sendOtp(email);
            req.flash('resend', 'OTP Resended ');
            res.redirect(`/otp?email=${email}&referel=${referel}`);
            console.log('otp resended');//--------------------------

        } else {
            console.log('no email in query');//-----------------
        }

    } catch (error) {
        console.log(error.message);
        next(error); 
        }

}

// ============================================== user signup and verification end =============================================

//  load forgot password
const loadForgotPassword = (req, res,next) => {
    try {
        res.status(200).render('forgotPassword');
    } catch (error) {
        console.log(error.message);
        next(error); 
        }
}



// reset password function
const resetPass = async (email, res,next) => {
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
// domain changed for hosting 
        // const restPage = `http://localhost:3001/reset-password/${user._id}/${token.token}`
        
        const restPage = `https://shoefactori.online/forgot-password/${user._id}/${token.token}`

        const mailOption = {
            from: 'muhamedreswan9917@gmail.com',
            to: email,
            subject: "Verify Your Email",
            html: `Your reset password link is ${restPage}`
        }

        await transport.sendMail(mailOption);
    } catch (error) {
        console.log(error.message);
        next(error); 
        }


}

// forgot password
const forgotPassword = async (req, res, next) => {
    try {
        const email = req.body.email;
        console.log(req.body, 'body');//------------------------------------
        console.log(email, 'email');//------------------------
        await resetPass(email, res)
        req.flash('success', 'Sent a reset password link to your email');
        res.redirect('/login');
    } catch (error) {
        console.log(error.message);
        next(error); 
    }
}

// load reset password 
const loadResetPassword = async (req, res,next) => {
    try {
        const userId = req.params.id;
        const token = req.params.token;
        res.render('resetPassword', { userId, token });

    } catch (error) {
        console.log(error.message);
        next(error); 
    }
}

//reset password
const resetPassword = async (req, res, next) => {
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
        console.log(error.message);
        next(error); 
    }

}

// profile 
const loadProfile = (req, res,next) => {
    try {
        console.log('profile working');//------------------
        res.render('addProfile')
    } catch (error) {
        console.log(error.message);
        next(error); 
    }
}



// 404 Error
const LoadError404 = (req, res,next) => {
    try {
        res.render('Error404');
    } catch (error) {
        console.log(error.message);
        next(error); 
        }
}


// about us 
const loadAboutUs = (req,res)=>{
    try {
        res.status(200).render("aboutUs")
    } catch (error) {
        console.log(error.message);
        next(error); 
    }
}

module.exports = {
    loadHome,
    loadAboutUs,
    loadRegister,
    loadLogin,
    insertUser,
    verifyLogin,

    loadOtp,
    verifyOtp,
    sendOtp,
    resendOtp,

    userLogout,
    LoadError404,
    loadForgotPassword,
    forgotPassword,
    loadResetPassword,
    resetPassword,
    securedPassword,







}
