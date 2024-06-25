const Products = require('../model/productsModel');
const Users = require('../model/userModel');
const Orders = require('../model/orderModel');
const Coupons = require('../model/couponModel');
const otpGenerator = require('otp-generator');


// coupon management
const loadcouponManagement = async (req, res)=>{
try {
    console.log("in counpon management")//-------------------
    const coupons = await Coupons.find({isListed:true});
    res.status(200).render("couponManagement",{coupons});
    
} catch (error) {
    console.log(error);
}
}



// add coupon 
const  addCoupon = async (req, res)=>{
    try {
        console.log("add coupon")//-------------------
        console.log("couponbody",req.body)//---------
        const {name,endDate,userLimit,description,discountPercentage,minimumAmount}=req.body

        let n =name.slice(0,4).trim()
     const randomString=   otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
     let counponCode =`${n}-${randomString}-${discountPercentage}`
     console.log('counponCode',counponCode)//----------------

        const coupon = new Coupons({
            title:name,
            limit:userLimit,
            description:description,
            expiryDate:endDate,
            discount:discountPercentage,
            minCost:minimumAmount,
            couponCode:counponCode
        })

        await coupon.save();

        res.status(301).redirect('/admin/coupons')
    } catch (error) {
        console.log(error)//-------------
        console.log(' in add coupon')//-------------
    }
}




// updated coupon 
 const updateCoupon = async(req, res)=>{
    try {
        console.log("update coupon")//-------------------
        const couponId = req.body._id;
        console.log("req.body",req.body)//-------------------
        const {name,endDate,userLimit,description,discountPercentage,minimumAmount}=req.body

        const updatedCoupon = await Coupons.findByIdAndUpdate({_id:couponId},{
            $set:{
                title:name,
                limit:userLimit,
                description:description,
                expiryDate:endDate,
                discount:discountPercentage,
                minCost:minimumAmount
            }
        })
        console.log('updatedCoupon',updatedCoupon)//-----------------
        res.status(200).redirect('/admin/coupons')
    } catch (error) {
        console.log(error)
    }
 }


module.exports={
    loadcouponManagement,
    addCoupon,
    updateCoupon
}