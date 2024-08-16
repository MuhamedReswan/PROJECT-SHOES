const Products = require('../model/productsModel');
const Users = require('../model/userModel');
const Orders = require('../model/orderModel');
const Coupons = require('../model/couponModel');
const otpGenerator = require('otp-generator');
const Cart = require('../model/cartModel');

// Coupon Management: Load Coupon Data with Pagination
const loadCouponManagement = async (req, res, next) => {
    try {
        let page = parseInt(req.query.id) || 1;
        const limit = 6;
        const start = (page - 1) * limit;

        const count = await Coupons.countDocuments();
        const totalPage = Math.ceil(count / limit);
        const next = page < totalPage ? page + 1 : totalPage;
        const previous = page > 1 ? page - 1 : 1;

        const coupons = await Coupons.find({})
            .limit(limit)
            .sort({ createdAt: -1 })
            .skip(start);

        res.status(200).render("couponManagement", {
            coupons,
            page,
            previous,
            next,
            totalPage
        });
    } catch (error) {
        next(error);   
    }
}

// Add Coupon
const addCoupon = async (req, res, next) => {
    try {
        const { name, endDate, userLimit, description, discountPercentage, minimumAmount } = req.body;
        const customisedName = name.toLowerCase();
        const customiseDescription = description.toLowerCase();
        const n = name.slice(0, 4).trim();
        const randomString = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
        const couponCode = `${n}-${randomString}-${discountPercentage}`;

        // Check if the coupon name already exists
        const nameExist = await Coupons.findOne({ title: customisedName });
        if (nameExist) {
            return res.status(200).json({ already: true });
        }

        // Create new coupon
        const coupon = new Coupons({
            title: customisedName,
            limit: userLimit,
            description: customiseDescription,
            expiryDate: endDate,
            discount: discountPercentage,
            minCost: minimumAmount,
            couponCode
        });

        await coupon.save();
        res.status(201).json({ success: true });
    } catch (error) {
        next(error);   
    }
}

// Update Coupon
const updateCoupon = async (req, res, next) => {
    try {
        const { name, endDate, userLimit, description, discountPercentage, minimumAmount, isListed, couponId } = req.body;
        const customisedName = name.toLowerCase();
        const customiseDescription = description.toLowerCase();

        const couponData = await Coupons.findById(couponId);
        const couponCode = couponData.couponCode.slice(0, -2) + discountPercentage;

        // Check if the coupon name exists for another coupon
        const nameExist = await Coupons.findOne({ title: name, _id: { $ne: couponId } });
        if (nameExist) {
            return res.status(200).json({ already: true });
        }

        // Update the coupon
        await Coupons.findByIdAndUpdate(couponId, {
            $set: {
                title: customisedName,
                limit: userLimit,
                description: customiseDescription,
                expiryDate: endDate,
                discount: discountPercentage,
                minCost: minimumAmount,
                isListed,
                couponCode
            }
        });

        res.status(200).json({ success: true });
    } catch (error) {
        next(error);   
    }
}

// Change Coupon Status
const changeStatus = async (req, res, next) => {
    try {
        const { couponId, status } = req.body;
        const toStatus = !status;

        // Update the coupon listing status
        const coupon = await Coupons.findByIdAndUpdate(couponId, {
            $set: { isListed: toStatus }
        }, { new: true });

        res.status(200).json({ changed: coupon ? true : false });
    } catch (error) {
        next(error);   
    }
}

// Validate Coupon
const validateCoupon = async (req, res, next) => {
    try {
        const { subTotal, cartId, couponCode } = req.body;
        const userId = req.session?.user?.id;
        const coupon = await Coupons.findOne({ couponCode: couponCode.toLowerCase() });

        if (!coupon) {
            return res.json({ valid: false, message: "Coupon not available!" });
        }

        if (coupon.minCost > subTotal) {
            return res.json({ valid: false, message: "Order amount is less than required for this coupon!" });
        }

        if (coupon.limit === 0) {
            return res.json({ valid: false, message: "Coupon limit exceeded!" });
        }

        if (coupon.appliedUsers.includes(userId)) {
            return res.json({ valid: false, message: "This coupon has already been redeemed!" });
        }

        const couponDiscount = Math.round((coupon.discount / 100) * subTotal);
        const cartData = await Cart.findOne({ user: userId });
        const productCount = cartData.products.length;
        const couponOffEachProduct = Math.round(couponDiscount / productCount);

        const detailsOfCoupon = {
            couponDiscount,
            couponId: coupon._id,
            code: couponCode.toLowerCase()
        };

        // Update cart with coupon details
        await Cart.updateOne({ user: userId }, {
            $set: { coupon: detailsOfCoupon, couponApplied: true, couponDiscoundProduct: couponOffEachProduct }
        });

        res.json({ valid: true, message: "Coupon added successfully!", couponDiscount, subTotal });
    } catch (error) {
        next(error);   
    }
}

// Remove Applied Coupon
const removeAppliedCoupon = async (req, res, next) => {
    try {
        const { cartId } = req.body;
        const userId = req.session?.user?.id;

        // Update the cart to remove coupon details
        await Cart.findByIdAndUpdate(cartId, {
            $set: { couponApplied: false, couponDiscoundProduct: 0 },
            $unset: { coupon: "" }
        });

        res.status(200).json({ removed: true, message: 'Coupon successfully removed!' });
    } catch (error) {
        next(error);   
    }
}

module.exports = {
    loadCouponManagement,
    addCoupon,
    updateCoupon,
    changeStatus,
    validateCoupon,
    removeAppliedCoupon
}
