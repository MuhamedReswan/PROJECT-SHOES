const products = require('../model/productsModel');
const Cart = require('../model/cartModel');
const { json } = require('express');
const mongoose = require('mongoose');
const Users = require('../model/userModel');
const Coupons = require('../model/couponModel');
const Wallet = require('../model/walletModel');



//load Cart
const loadCart = async (req, res,next) => {
    try {
        console.log('im in caert');//-----------------------------
        if (!req.session.user || !req.session.user.id) {
            console.log("within if load cart")//----------------------------------------
            req.flash('error', 'please Login then only service');
            res.redirect('/login')
        } else {
            const userId = req.session.user?.id;
            if (userId) {
                const cartData = await Cart.findOne({ user: userId }).populate('products.productId').sort({ createdAt: -1 }).exec();
                res.render('cart', { cartData });
            } else {
                res.render('cart');
            }
        }

    } catch (error) {
        console.log(error.message);
        next(error);   
     }
}

// add to Cart
const addToCart = async (req, res,next) => {
    try {
        console.log(" add to cart startedd>>>>>>");//-------------------
        console.log('userId', req.session.user.id);//---------------
        console.log(">>>>>>");//----------------------
        const userId = req.session.user.id;
        const productId = req.body.productId;
        const quantity = req.body?.quantity ? req.body.quantity : 1;

        const productData = await products.findOne({ _id: productId })
            .populate('appliedOffer')
            .populate({ path: 'category', populate: { path: 'appliedOffer', model: 'Offers' } });

        console.log('productId', productId)//--------------------
        // console.log('size', size)//--------------------
        // console.log('userId', userId)//--------------------
        // console.log('q', quantity)//--------------------
        const cartData = await Cart.findOne({ user: userId }).populate('products.productId');
        // console.log('cartData',cartData);//-------------------


        let offerPercentege = productData?.appliedOffer?.discount;
        let offerDiscountedPrice;


        if (productData?.category?.appliedOffer?.discount) {
            offerPercentege = productData?.category?.appliedOffer?.discount
        }

        if (productData?.appliedOffer?.discount) {
            offerPercentege = productData?.appliedOffer?.discount
        }

        if (productData?.category?.appliedOffer?.discount && productData?.appliedOffer?.discount) {
            offerPercentege = Math.max(productData?.category?.appliedOffer?.discount, productData?.appliedOffer?.discount)
        }
        console.log("offerPercentege cart----------------------------", offerPercentege);//-----------------------------





        if (offerPercentege) {
            offerDiscountedPrice = Math.round((productData.offerPrice / 100 * offerPercentege))
        }

        let price = productData.offerPrice
        let offerPrice = offerDiscountedPrice ? productData.offerPrice - offerDiscountedPrice : productData.offerPrice;

        console.log('offerPercentege', offerPercentege)//----------------------------
        console.log('offerDiscountedPrice', offerDiscountedPrice)//----------------------------
        console.log('price', price)//----------------------------
        console.log('offerPrice', offerPrice)//----------------------------




        if (cartData) {
            let product = {
                productId: productId,
                quantity: quantity,
                // size: size,
                price: price,
                offerPrice: offerPrice
            }

            console.log('product from addto Cart 0', product);//-------------------
            const pro = await Cart.findOne({ user: userId, 'products.productId': productId });
            // console.log(pro, 'pro');//----------------------
            // if (pro !== null && typeof pro === 'object' && typeof pro.products !== 'undefined') {
            //     const productDetails = pro.products.find((el) => el.size == size);

            if (!pro) {
                await Cart.updateOne({ user: userId }, {
                    $push: {
                        products: product,
                    }
                })
                console.log('product added to cart existing cart')//------------------
                return res.json({ added: true })

            } else {
                return res.json({ exist: true })
            }
            // }
            // else {
            //     const product = {
            //         productId: productId,
            //         quantity: quantity,
            //         size: size,
            //         price: productData.price,
            //         offerPrice: productData.offerPrice
            //     }
            //     // console.log('quantity',quantity)//-----------
            //     // console.log('productData.price',productData.price)//-----------
            //     // console.log('totalOrginalPrice2', product.totalOrginalPrice);//-------------------
            //     console.log('product from addto Cart1', product);//-------------------
            //     await Cart.updateOne({ user: userId }, {
            //         $push: {
            //             products: product
            //         }
            //     })
            //     console.log("Pro is null or undefined, or 'products' property does not exist.");//--------------

            // }


        } else {
            let product = {
                productId: productId,
                quantity: quantity,
                // size: size,
                price: price,
                offerPrice: offerPrice
            }
            // console.log('product from addto Cart2', product);//-------------------

            const cartProduct = new Cart({
                user: userId,
                products: product
            })

            if (cartProduct) {
                await cartProduct.save();
                res.json({ added: true });
            }
        }

    } catch (error) {
        console.log(error.message);
        next(error);   
     }
}


// remove product from Cart
const removeFromCart = async (req, res,next) => {
    try {
        // console.log('removeFromCart', req.body);//------------------
        const id = req.session.user.id;
        let { productId } = req.body;
        productId = productId.trim()
        // console.log('productId', productId)//-----------------------------
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ error: 'Invalid productId' });
        }
        const cartProducts = await Cart.updateOne({ user: id }, {
            $pull: {
                products: { productId: productId }
            }
        })

        res.json({ removed: true });
    } catch (error) {
        console.log(error.message);
        next(error);   
     }
}
// check cart
const checkCart = async (req, res,next) => {
    try {
        console.log('checkCart back end');//-------------
        const userId = req.session.user.id;

        const { productId/*, size */ } = req.body;
        // console.log(req.body, userId)//=-----------------
        if (!userId) {
            return res.json({ nouser: true })
        }
        const cart = await Cart.findOne({ user: userId, 'products.productId': productId });
        // console.log('cart', cart);//----------------
        // if (cart && cart.products && Array.isArray(cart.products)) {
        //     const product = cart.products.find((el) => el.size == size);
        // console.log(product, 'dddddddddd');//---------------
        if (cart) {
            // console.log('product exist', product)//-----------------
            res.json({ exist: true, })
        } else {
            res.json({ not: true, productId });
            // console.log('product not exist', product)//-----------------
        }
        // } else {
        //     res.json({ not: true, productId });
        // }

    } catch (error) {
        console.log("error check quantity", error.message);
        next(error);
    }
}


// cart change quantity
const changeQuantity = async (req, res, next) => {
    try {
        console.log('im in change qty'); // Logging
        const { productId, id, buttonStatus } = req.body;
        const userId = req.session.user.id; // Corrected variable name

        // Check if userId is present
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

        if (buttonStatus) {
            const cartQuantity = cartProduct.quantity;
            const productQuantity = product.totalStock;

            if (buttonStatus == -1) {
                if (cartQuantity > 1) {
                    await Cart.updateOne(
                        { user: userId, products: { $elemMatch: { _id: id } } },
                        { $inc: { 'products.$.quantity': -1 } }
                    );
                    return res.json({ update: true });
                } else {
                    console.log('Minimum quantity required');
                    return res.json({ min: true });
                }
            }

            if (cartQuantity == 5) {
                console.log('Max quantity reached');
                return res.json({ maxQty: true });
            }

            if (buttonStatus == 1) {
                if (cartQuantity < productQuantity) {
                    await Cart.updateOne(
                        { user: userId, products: { $elemMatch: { _id: id } } },
                        { $inc: { "products.$.quantity": 1 } }
                    );
                    return res.json({ update: true });
                } else {
                    return res.json({ max: true });
                }
            }
        }
    } catch (error) {
        console.log("Error changing quantity:", error.message);
        next(error); // Pass the error to the next middleware
    }
};


// load checkout
const loadCheckout = async (req, res,next) => {
    try {
        console.log('im in checkout');//-----------
        const subtotal = req.query?.subtotal;
        const userId = req.session.user.id;
        let couponApplied = false;
        couponApplied = req?.query?.coupon;
        console.log('subtotal chsckout', subtotal);//------------
        console.log('userId chsckout', userId);//------------
        const userData = await Users.findOne({ _id: userId });
        const cartData = await Cart.findOne({ user: userId }).populate('products.productId');
        const wallet = await Wallet.findOne({ user: userId })
        let date = new Date()
        console.log("date&&&&", date)//--------------------
        const viewCoupons = await Coupons.find({ expiryDate: { $gte: date }, isListed: true, limit: { $gt: 0 }, appliedUsers: { $nin: [userId] } });
        console.log("coupon form load checkout")//-----------------------
        console.log('viewCoupons', viewCoupons);//-----------------
        //    console.log('userData',userData);//-----------------
        //    console.log('cartData',cartData);//-----------------

        res.status(200).render('checkout', { userData, cartData, viewCoupons, couponApplied, wallet });
    } catch (error) {
        console.log(error.message);
        next(error);   
     }
}

module.exports = {
    loadCart,
    addToCart,
    removeFromCart,
    checkCart,
    loadCheckout,
    changeQuantity
}