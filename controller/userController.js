const Users = require('../model/userModel');
const bcrypt = require('bcrypt');
const otpModel = require('../model/otpModel');
const Token = require('../model/tokenModel');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const Wallet = require('../model/walletModel');
const otpGenerator = require('otp-generator');
const Razorpay = require('razorpay');
const Products = require('../model/productsModel');
const Orders = require('../model/orderModel');
const Banners = require('../model/bannerModel');
const { match } = require('assert');
const Category = require('../model/categoryModel');



// Password secure
const securedPassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.error('Error in securedPassword:', error.message);
        throw error;
    }
};



// Error 500 handler
const loadError500 = (req, res, next) => {
    try {
        res.render('error-500');
    } catch (error) {
        console.error('Error in loadError500:', error.message);
        next(error);
    }
};



// Load Home Page
const loadHome = async (req, res, next) => {
    try {
        console.log("Loading home page...");

        // fetch the most populat products
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
            { $limit: 4 }
        ]);

        // fetch latest products
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

        // fetch top offered product
        const topOfferedProduct = await Products.aggregate([
            { $match: { isListed: true } },
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
            { $sort: { maxDiscount: -1 } },
            { $limit: 4 }
        ]);

        const banners = await Banners.find({ isListed: true }).sort({ createdAt: -1 });
        console.log("Banners retrieved:", banners.length);

        res.render('home', { mostPopularProduct, latestProduct, topOfferedProduct, banners });
    } catch (error) {
        console.error('Error loading home page:', error.message);
        next(error);
    }
};



// Load login
const loadLogin = (req, res, next) => {
    try {
        res.render('login');
    } catch (error) {
        console.error('Error loading login page:', error.message);
        next(error);
    }
}



// Verify login
const verifyLogin = async (req, res, next) => {
    try {
        const { Email, Password } = req.body;
        const userData = await Users.findOne({ email: Email });

        if (userData) {
            const verifyPassword = await bcrypt.compare(Password, userData.password);

            if (verifyPassword) {
                if (userData.isBlocked) { // if the user blocked by admin  redirecting to login with a message
                    req.flash('blocked', 'You were blocked by admin');
                    res.redirect('/login');
                } else {
                    req.session.user = {
                        id: userData._id,
                        name: userData.name,
                        email: userData.email,
                    };
                    req.flash('loginSuccess', 'Login Successful');
                    res.redirect("/");
                }
            } else {
                req.flash('passwordError', 'Incorrect password');
                res.redirect('/login');
            }
        } else {
            req.flash('emailError', 'Incorrect email');
            res.redirect('/login');
        }
    } catch (error) {
        console.error('Error verifying login:', error.message);
        next(error);
    }
}



// Load registration
const loadRegister = (req, res, next) => {
    try {
        const referel = req.query.referel;
        res.render('signup', { referel });
    } catch (error) {
        console.error('Error loading registration page:', error.message);
        next(error);
    }
}



// Insert user
const insertUser = async (req, res, next) => {
    try {
        const { Name, Email, Password, referel } = req.body;
        const hashPassword = await securedPassword(Password);

        const usernameExists = await Users.findOne({ name: Name });
        const emailExists = await Users.findOne({ email: Email });

        if (usernameExists) {  
            req.flash('nameExist', 'Username already exists');
            res.redirect('/signup');
        } else if (emailExists) {
            req.flash('emailExist', 'Email already exists');
            res.redirect('/signup');
        } else {
            const referelCode = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });

            const user = new Users({
                email: Email,
                name: Name,
                mobile: req.body.Mobile,
                password: hashPassword,
                isAdmin: false,
                isBlocked: false,
                verified: false,
                referelCode: referelCode
            });

            const userData = await user.save();

            if (userData) {
                await new Wallet({ user: userData._id }).save();
                sendOtp(user.email);
                res.redirect(`/otp?email=${user.email}&referel=${referel}`);
            } else {
                console.error('Failed to save user data');
            }
        }
    } catch (error) {
        console.error('Error inserting user:', error.message);
        next(error);
    }
}



// Load OTP
const loadOtp = (req, res, next) => {
    try {
        const { email, referel } = req.query;
        res.render('otp', { email, referelCode: referel });
    } catch (error) {
        console.error('Error loading OTP page:', error.message);
        next(error);
    }
}



// Send OTP
const sendOtp = async (email) => {
    try {
        // Configure nodemailer transport for Gmail service
        const transport = nodemailer.createTransport({
            service: 'gmail',
            host: "smtp.gmail.com",
            port: 465,
            secure: true, 
            auth: {
                user: 'muhamedreswan9917@gmail.com', // Your Gmail address
                pass: 'neek jdze decd qtoa' // App-specific password for Gmail
            }
        });

        // Generate a 4-digit OTP
        const createOtp = `${Math.floor(1000 + Math.random() * 9000)}`;
        console.log(`OTP: ${createOtp}`); 

        // Set up the email options
        const mailOption = {
            from: 'muhamedreswan9917@gmail.com', 
            to: email,
            subject: "OTP Verification", 
            html: `Your OTP is <strong>${createOtp}</strong>`
        };

        // Send the email with OTP
        await transport.sendMail(mailOption);

        // Hash the OTP before saving it in the database for security purposes
        const hashOtp = await bcrypt.hash(createOtp, 10);

        await new otpModel({ email, otp: hashOtp }).save();

    } catch (error) {
        console.error('Error sending OTP:', error.message);
        throw error;
    }
}



// Verify OTP
const verifyOtp = async (req, res, next) => {
    try {
        const { email, referel } = req.body;

        const otp = req.body.otp1 + req.body.otp2 + req.body.otp3 + req.body.otp4;
        console.log("Received OTP:", otp);

        // Find the OTP document based on the provided email
        const otpUser = await otpModel.findOne({ email });

        if (otpUser) {
            // Compare the received OTP with the hashed OTP stored in the database
            const otpVerification = await bcrypt.compare(otp, otpUser.otp);

            if (otpVerification) {
                const userData = await Users.findOne({ email });
                const userId = userData._id;

                if (userData) {
                    // Mark the user as verified and remove the OTP from the database
                    await Users.findByIdAndUpdate(userId, { verified: true });
                    await otpModel.deleteOne({ email });

                    // If a referral code is provided, process the referral bonus
                    if (referel) {
                        const referelOwner = await Users.findOne({ referelCode: referel });

                        if (referelOwner) {
                            console.log("Valid referral code found.");

                            // Create a transaction for the referral owner
                            const transaction = {
                                amount: 200,
                                mode: "Credited",
                                description: "Your friend joined through your referral link"
                            };

                            // Update the wallet of the referral owner
                            await Wallet.updateOne(
                                { user: referelOwner._id },
                                { $inc: { balance: 200 }, $push: { transactions: transaction } },
                                { new: true }
                            );

                            // Create a transaction for the referred user
                            const userTransaction = {
                                amount: 100,
                                mode: "Credited",
                                description: "You received 100 rupees by applying referral code"
                            };

                            // Update the wallet of the newly verified user
                            await Wallet.updateOne(
                                { user: userId },
                                { $inc: { balance: 100 }, $push: { transactions: userTransaction } },
                                { new: true }
                            );
                        }
                    }

                    // Flash success message and redirect to login page
                    req.flash('success', 'Verification successful');
                    return res.redirect('/login');
                } else {
                    console.error('User data not found');
                    req.flash('error', 'User data not found');
                    return res.redirect(`/otp?email=${email}&referel=${referel}`);
                }
            } else {
                console.error('OTP verification failed');
                req.flash('incorrect', 'Please enter a valid OTP');
                return res.redirect(`/otp?email=${email}&referel=${referel}`);
            }
        } else {
            console.error('OTP expired or not found');
            req.flash('expired', 'OTP expired. Please resend');
            return res.redirect(`/otp?email=${email}&referel=${referel}`);
        }
    } catch (error) {
        // Log any errors and pass them to the next middleware for handling
        console.error('Error verifying OTP:', error.message);
        next(error);
    }
};



// Resend OTP
const resendOtp = async (req, res, next) => {
    try {
        const { email } = req.params;
        const { referel } = req.query;

        if (email) {
            await otpModel.deleteMany({ email });
            sendOtp(email);
            req.flash('resend', 'OTP Resent');
            res.redirect(`/otp?email=${email}&referel=${referel}`);
            console.log('OTP resent successfully');
        } else {
            console.error('No email in query');
        }
    } catch (error) {
        console.error('Error resending OTP:', error.message);
        next(error);
    }
}



// Load forgot password
const loadForgotPassword = (req, res, next) => {
    try {
        res.status(200).render('forgotPassword');
    } catch (error) {
        console.error('Error loading forgot password page:', error.message);
        next(error);
    }
}



// Reset password function
const resetPass = async (email, res, next) => {
    try {
        const user = await Users.findOne({ email });

        if (!user) {
            return res.status(400).send('User with this email does not exist');
        }

        let token = await Token.findOne({ userId: user._id });

        if (!token) {
            token = new Token({
                userId: user._id,
                token: crypto.randomBytes(32).toString('hex')
            });
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
        });

        const resetPage = `https://shoefactori.online/forgot-password/${user._id}/${token.token}`;

        const mailOption = {
            from: 'muhamedreswan9917@gmail.com',
            to: email,
            subject: "Verify Your Email",
            html: `Your reset password link is <a href="${resetPage}">here</a>.`
        };

        await transport.sendMail(mailOption);
    } catch (error) {
        console.error('Error resetting password:', error.message);
        next(error);
    }
}



// Forgot password
const forgotPassword = async (req, res, next) => {
    try {
        const email = req.body.email;
        await resetPass(email, res, next);
        req.flash('success', 'Sent a reset password link to your email');
        res.redirect('/login');
    } catch (error) {
        console.error('Error handling forgot password request:', error.message);
        next(error);
    }
}



// Load reset password page
const loadResetPassword = async (req, res, next) => {
    try {
        const { id: userId, token } = req.params;
        res.render('resetPassword', { userId, token });
    } catch (error) {
        console.error('Error loading reset password page:', error.message);
        next(error);
    }
}



// Reset password
const resetPassword = async (req, res, next) => {
    try {
        const { userId, token, confirmPassword: password } = req.body;

        const user = await Users.findOne({ _id: userId });

        if (!user) {
            return res.status(400).send('Invalid link or expired');
        }

        const validToken = await Token.findOne({ token, userId });

        if (!validToken) {
            return res.status(400).send('Invalid link or expired');
        }

        const hashPassword = await securedPassword(password);

        await Users.updateOne({ _id: userId }, { $set: { password: hashPassword } });

        req.flash('success', 'Password reset successfully');
        res.redirect('/login');
    } catch (error) {
        console.error('Error resetting password:', error.message);
        next(error);
    }
}



// Load profile
const loadProfile = (req, res, next) => {
    try {
        res.render('addProfile');
    } catch (error) {
        console.error('Error loading profile page:', error.message);
        next(error);
    }
}



// 404 Error
const LoadError404 = (req, res, next) => {
    try {
        res.render('Error404');
    } catch (error) {
        console.error('Error loading 404 page:', error.message);
        next(error);
    }
}



// About us 
const loadAboutUs = (req, res, next) => {
    try {
        res.status(200).render("aboutUs");
    } catch (error) {
        console.error('Error loading about us page:', error.message);
        next(error);
    }
}




// User Logout
const userLogout = (req, res, next) => {
    try {
        req.session.user = null;
        console.log('User successfully logged out');
        res.redirect('/');
    } catch (error) {
        console.error('Error during user logout:', error.message);
        next(error);
    }
};
    



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
    securedPassword
}