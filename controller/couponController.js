const Products = require('../model/productsModel');
const Users = require('../model/userModel');
const Orders = require('../model/orderModel');
const Coupons = require('../model/couponModel');
const otpGenerator = require('otp-generator');
const Cart = require('../model/cartModel');



// coupon management
const loadcouponManagement = async (req, res,next) => {
    try {
        console.log("load coupon management", req.body);
        let page = 1;
        let limit = 6;
        if (req.query.id) {
            page = req.query.id
        }
        let next = page + 1
        let previous = page > 1 ? page - 1 : 1
        let start = (page - 1) * limit
        console.log('start', start);//---------------------
        const count = await Coupons.find({}).count()

        let totalPage = Math.ceil(count / limit)
        if (next > totalPage) {
            next = totalPage
        }

        const couponData = await Coupons.find({})
            .limit(limit)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .exec()


        console.log("in counpon management")//-------------------
        const coupons = await Coupons.find().sort({ createdAt: -1 });
        res.status(200).render("couponManagement", {
            coupons,
            page,
            previous,
            next,
            totalPage,
            start
        });

    } catch (error) {
        console.log(error.message);
        next(error);   
     }
}



// add coupon 
const addCoupon = async (req, res,next) => {
    try {
        console.log("add coupon")//-------------------
        console.log("couponbody", req.body)//---------
        let { name, endDate, userLimit, description, discountPercentage, minimumAmount } = req.body
        let customisedName = name.toLowerCase();
        let customiseDescription = description.toLowerCase();
        let n = name.slice(0, 4).trim()
        const randomString = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
        let counponCode = `${n}-${randomString}-${discountPercentage}`
        console.log('counponCode', counponCode)//----------------

        const nameExist = await Coupons.findOne({ title: customisedName })
        console.log("add nameExist////////", nameExist)//-------------------

        if (nameExist) {
            return res.status(200).json({ already: true })
        } else {

            const coupon = new Coupons({
                title: customisedName,
                limit: userLimit,
                description: customiseDescription,
                expiryDate: endDate,
                discount: discountPercentage,
                minCost: minimumAmount,
                couponCode: counponCode
            })

            await coupon.save();

            res.status(201).json({ success: true })
        }
    } catch (error) {
        console.log(error.message);
        next(error);   
     }
}




// updated coupon 
const updateCoupon = async (req, res,next) => {
    try {
        const { name, endDate, userLimit, description, discountPercentage, minimumAmount, isListed, couponId } = req.body;

        let customisedName = name.toLowerCase();
        let = description.toLowerCase();
        const couponData = await Coupons.findOne({ _id: couponId })
        let couponCode = couponData.couponCode.slice(0, -2) + discountPercentage
        const nameExist = await Coupons.findOne({ title: name, _id: { $ne: couponId } })

        if (nameExist) {
            return res.status(200).json({ already: true })
        } else {

            const updatedCoupon = await Coupons.findByIdAndUpdate({ _id: couponId }, {
                $set: {
                    title: customisedName,
                    limit: userLimit,
                    description: description,
                    expiryDate: endDate,
                    discount: discountPercentage,
                    minCost: minimumAmount,
                    isListed: isListed,
                    couponCode: couponCode
                }
            })

            return res.status(200).json({ success: true })
        }
    } catch (error) {
        console.log(error.message);
        next(error);   
     }
}



// change coupon status
const changeStatus = async (req, res,next) => {
    try {
        console.log("changeStatus")//--------------------------------------

        const { couponId, status } = req.body;
        let toStatus = status === true ? false : true;

        const coupon = await Coupons.findByIdAndUpdate({
            _id: couponId
        }, {
            $set: {
                isListed: toStatus
            }
        }, {
            new: true
        })

        console.log("coupon", coupon)//-------------

        if (coupon) {
            res.status(200).json({ changed: true })
        } else {
            res.status(200).json({ changed: false })
        }

    } catch (error) {
        console.log(error.message);
        next(error);   
     }
}




// User

// validate coupon

const validateCoupon = async (req, res,next) => {
    try {
        console.log("in validate coupon");//-------------
        console.log("req.body=", req.body);//-----------
        let { subTotal, cartId, couponCode } = req.body;
        console.log("couopon code 1-----------", couponCode)//-----------------------

        couponCode = couponCode.toLowerCase();
        const userId = req.session?.user?.id;
        console.log(" userId==", userId)//----------------------

        console.log("couopon code 2-----------", couponCode)//-----------------------


        const coupon = await Coupons.findOne({ couponCode: couponCode });
        console.log("coupon=", coupon);//-----------

        if (coupon) {
            if (coupon?.minCost > subTotal) {
                res.json({ valid: false, message: "order amount is lessthatn required for this coupon !" });

            } else if (coupon?.limit == 0) {
                res.json({ valid: false, message: "coupon limit exceeded !" });

            } else if (coupon?.appliedUsers.includes(userId)) {
                res.json({ valid: false, message: "this coupon already redeemed !" });
            } else {

                console.log("within the upadaate coupon ", req.session?.user)//----------------------

                // const updateCoupon = await Coupons.findByIdAndUpdate({ _id: coupon._id },
                //     {
                //         $inc: { limit: -1 },
                //         $push: { appliedUsers: userId }
                //     },
                //     { new: true }
                // );                                   // this moved to place order

                //         const changeStatusAppliedCoupon = await Cart.updateOne({user:userId},
                //             {
                //                 $set:{
                //             couponApplied:true
                //         }
                //     },
                // {new:true})

                //   console.log(" updateCoupon==", updateCoupon)//----------------------
                //   console.log(" changeStatusAppliedCoupon==", changeStatusAppliedCoupon)//----------------------



                let couponDiscount = Math.round((coupon.discount / 100) * subTotal);
                console.log("couponDiscount", couponDiscount)//--------------

                const cartData = await Cart.findOne({ user: userId });

                const productCount = cartData.products.length;
                const couponOffEachProduct = Math.round(couponDiscount / productCount);

                console.log("cartData", cartData)//------------------
                console.log("productCount", productCount)//------------------

                console.log("couponOffEachProduct", couponOffEachProduct)//------------------------

                let detailsOfCoupon = {
                    couponDiscount: couponDiscount,
                    couponId: coupon._id,
                    code: couponCode
                }

                // for(let i=0; i<cartData.products.length; i++){
                //     cartData.products[i].offerPrice -=couponOffEachProduct
                // }


                //  const updatedCart= await cartData.save()
                //  console.log("updatedCart",updatedCart)//------------------------

                await Cart.updateOne({ user: userId },
                    { $set: { coupon: detailsOfCoupon, couponApplied: true, couponDiscoundProduct: couponOffEachProduct } },
                    { new: true });

                res.json({ valid: true, message: "Coupon added success !", couponDiscount, subTotal });

            }
        } else {
            res.json({ valid: false, message: "coupon not available !" })
        }

    } catch (error) {
        console.log(error.message);
        next(error);   
     }
}



// remove applied coupon
const removeAppliedCoupon = async (req, res,next) => {
    try {
        console.log("within remove applied couopon")//--------------
        const { cartId, subTotal } = req.body
        const userId = req.session?.user?.id;




        const cart = await Cart.findOne({ user: userId });
        // const cart= await Cart.findOne({user:userId});
        console.log("cart", cart,)//------------------------

        // if(cart.couponApplied){
        //     for(let i=0; i<cart.products.length; i++){
        //         cart.products[i].offerPrice+=cart.couponDiscoundProduct
        //     }
        //     const cartUpdated = await cart.save();        

        //     console.log("cart",cart,)//------------------------
        // }


        const updateCouponDisCart = await Cart.findByIdAndUpdate({
            _id: cartId
        }, {
            $set: {
                couponApplied: false,
                couponDiscoundProduct: 0
            },
            $unset: {
                coupon: null
            }
        }, {
            new: true
        })

        console.log("updateCouponDisCart", updateCouponDisCart);//-------------------------

        res.status(200).json({ removed: true, message: 'coupon successfully removed !' });

    } catch (error) {
        console.log(error.message);
        next(error);   
     }
}

module.exports = {
    loadcouponManagement,
    addCoupon,
    updateCoupon,
    changeStatus,


    validateCoupon,
    removeAppliedCoupon
}