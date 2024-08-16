const products = require('../model/productsModel');
const Cart = require('../model/cartModel');
const mongoose = require('mongoose');
const Users = require('../model/userModel');
const Coupons = require('../model/couponModel');
const Wallet = require('../model/walletModel');

// Load Cart
const loadCart = async (req, res, next) => {
    try {
        if (!req.session.user || !req.session.user.id) {
            req.flash('error', 'Please login to access this service.');
            return res.redirect('/login');
        }

        const userId = req.session.user?.id;
        if (userId) {
            const cartData = await Cart.findOne({ user: userId })
                .populate('products.productId')
                .sort({ createdAt: -1 })
                .exec();

            return res.render('cart', { cartData });
        }

        res.render('cart');
    } catch (error) {
        console.error(error.message);
        next(error);
    }
};

// Add to Cart
const addToCart = async (req, res, next) => {
    try {
        const userId = req.session.user.id;
        const productId = req.body.productId;
        const quantity = req.body?.quantity ? req.body.quantity : 1;

        const productData = await products.findOne({ _id: productId })
            .populate('appliedOffer')
            .populate({ path: 'category', populate: { path: 'appliedOffer', model: 'Offers' } });

        let offerPercentage = productData?.appliedOffer?.discount;

        if (productData?.category?.appliedOffer?.discount) {
            offerPercentage = productData?.category?.appliedOffer?.discount;
        }

        if (productData?.appliedOffer?.discount) {
            offerPercentage = productData?.appliedOffer?.discount;
        }

        if (productData?.category?.appliedOffer?.discount && productData?.appliedOffer?.discount) {
            offerPercentage = Math.max(
                productData?.category?.appliedOffer?.discount,
                productData?.appliedOffer?.discount
            );
        }

        let offerDiscountedPrice;
        if (offerPercentage) {
            offerDiscountedPrice = Math.round((productData.offerPrice / 100) * offerPercentage);
        }

        const price = productData.offerPrice;
        const offerPrice = offerDiscountedPrice
            ? productData.offerPrice - offerDiscountedPrice
            : productData.offerPrice;

        const cartData = await Cart.findOne({ user: userId }).populate('products.productId');
        let product = {
            productId: productId,
            quantity: quantity,
            price: price,
            offerPrice: offerPrice
        };

        if (cartData) {
            const existingProduct = await Cart.findOne({
                user: userId,
                'products.productId': productId
            });

            if (!existingProduct) {
                await Cart.updateOne({ user: userId }, { $push: { products: product } });
                return res.json({ added: true });
            } else {
                return res.json({ exist: true });
            }
        } else {
            const cartProduct = new Cart({ user: userId, products: product });
            await cartProduct.save();
            return res.json({ added: true });
        }
    } catch (error) {
        console.error(error.message);
        next(error);
    }
};

// Remove product from Cart
const removeFromCart = async (req, res, next) => {
    try {
        const userId = req.session.user.id;
        let { productId } = req.body;
        productId = productId.trim();

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ error: 'Invalid productId' });
        }

        await Cart.updateOne(
            { user: userId },
            { $pull: { products: { productId: productId } } }
        );

        res.json({ removed: true });
    } catch (error) {
        console.error(error.message);
        next(error);
    }
};

// Check if product is in Cart
const checkCart = async (req, res, next) => {
    try {
        const userId = req.session.user.id;
        const { productId } = req.body;

        if (!userId) {
            return res.json({ nouser: true });
        }

        const cart = await Cart.findOne({ user: userId, 'products.productId': productId });

        if (cart) {
            return res.json({ exist: true });
        } else {
            return res.json({ not: true, productId });
        }
    } catch (error) {
        console.error("Error checking cart:", error.message);
        next(error);
    }
};

// Change Cart Quantity
const changeQuantity = async (req, res, next) => {
    try {
        const { productId, id, buttonStatus } = req.body;
        const userId = req.session.user.id;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        const product = await products.findOne({ _id: productId });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const cartProduct = cart.products.find((n) => n._id == id);
        if (!cartProduct) {
            return res.status(404).json({ error: 'Product not found in cart' });
        }

        const cartQuantity = cartProduct.quantity;
        const productQuantity = product.totalStock;

        if (buttonStatus == -1 && cartQuantity > 1) {
            await Cart.updateOne(
                { user: userId, products: { $elemMatch: { _id: id } } },
                { $inc: { 'products.$.quantity': -1 } }
            );
            return res.json({ update: true });
        } else if (buttonStatus == 1 && cartQuantity < productQuantity && cartQuantity < 5) {
            await Cart.updateOne(
                { user: userId, products: { $elemMatch: { _id: id } } },
                { $inc: { "products.$.quantity": 1 } }
            );
            return res.json({ update: true });
        } else {
            return res.json({ error: 'Quantity update not allowed' });
        }
    } catch (error) {
        console.error("Error changing quantity:", error.message);
        next(error);
    }
};

// Load Checkout
const loadCheckout = async (req, res, next) => {
    try {
        const subtotal = req.query?.subtotal;
        const userId = req.session.user.id;
        const couponApplied = req?.query?.coupon || false;

        const userData = await Users.findOne({ _id: userId });
        const cartData = await Cart.findOne({ user: userId }).populate('products.productId');
        const wallet = await Wallet.findOne({ user: userId });

        const date = new Date();
        const viewCoupons = await Coupons.find({
            expiryDate: { $gte: date },
            isListed: true,
            limit: { $gt: 0 },
            appliedUsers: { $nin: [userId] }
        });

        res.status(200).render('checkout', { userData, cartData, viewCoupons, couponApplied, wallet });
    } catch (error) {
        console.error(error.message);
        next(error);
    }
};

module.exports = {
    loadCart,
    addToCart,
    removeFromCart,
    checkCart,
    loadCheckout,
    changeQuantity
};
