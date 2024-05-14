const products = require('../model/productsModel');
const Cart = require('../model/cartModel');
const { json } = require('express');
const mongoose = require('mongoose');
const Users = require('../model/userModel');


//load Cart
const loadCart = async (req, res) => {
    try {
        console.log('im in caert');//-----------------------------
        if (!req.session.user || !req.session.user.id) {
            req.flash('error', 'please Login then only service');
            res.redirect('/login')
        } else {
            const userId = req.session.user.id;
            if (userId) {
                const cartData = await Cart.findOne({ user: userId }).populate('products.productId').exec();
                // console.log("cartData", cartData);//--------------------------------
                res.render('cart', { cartData });
            } else {
                res.render('cart');
            }
        }

    } catch (error) {
        console.log(error);
    }
}

// add to Cart
const addToCart = async (req, res) => {
    try {
        console.log(" add to cart startedd>>>>>>");//-------------------
        console.log('userId', req.session.user.id);//---------------
        console.log(">>>>>>");//----------------------
        const userId = req.session.user.id;
console.log('body a cart',req.body)//--------------
        const  productId = req.body.productId;
        const quantity = req.body?.quantity ? req.body.quantity : 1;

        const productData = await products.findOne({ _id: productId });
        console.log('productId', productId)//--------------------
        // console.log('size', size)//--------------------
        // console.log('userId', userId)//--------------------
        // console.log('q', quantity)//--------------------
        const cartData = await Cart.findOne({ user: userId }).populate('products.productId');
        console.log('cartData',cartData);//-------------------
        if (cartData) {
            let product = {
                productId: productId,
                quantity: quantity,
                // size: size,
                price: productData.price,
                offerPrice: productData.offerPrice
            }
            // console.log('product from addto Cart 0', product);//-------------------
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

                }else{
                    res.json({ exist: true })
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
                price: productData.price,
                offerPrice: productData.offerPrice
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
        console.log(error);
    }
}


// remove product from Cart
const removeFromCart = async (req, res) => {
    try {
        console.log('removeFromCart', req.body);//------------------
        const id = req.session.user.id;
        let { productId} = req.body;
        productId=productId.trim()
        console.log('productId', productId)//-----------------------------
if (!mongoose.Types.ObjectId.isValid(productId)){
    return res.status(400).json({ error: 'Invalid productId' });
}
        const cartProducts = await Cart.updateOne({ user: id }, {
            $pull: {
                products: { productId: productId }
            }
        })

        res.json({ removed: true });
    } catch (error) {
        console.log(error);
    }
}
// check cart
const checkCart = async (req, res) => {
    try {
        console.log('checkCart back end');//-------------
        const userId = req.session.user.id;

        const { productId/*, size */} = req.body;
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
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}


// cart change quantity
const changeQuantity = async (req, res) => {
    try {
        console.log('im in change qty')//--------------
        const { productId, id, buttonStatus } = req.body;
        const userId = req.session.user.id;
        // console.log('req.body=', req.body);//------------
        console.log('type.stauts=', typeof req.body.buttonStatus);//------------
        console.log('id', id)//------
        const cart = await Cart.findOne({ user: userId });
        // console.log('cart =', cart);//--------
        const product = await products.findOne({ _id: productId });
        // console.log('product =', product);//--------        
        const cartProduct = await cart.products.find((n) => n._id == id)
        // console.log('cartProduct =', cartProduct);//------

        if (buttonStatus) {
            // const size = cartProduct.size;
            const cartQuantity = cartProduct.quantity;
            const productQuantity = product.totalStock;
            // console.log('cartQuantity', cartQuantity);//---------------
            // console.log('productQuantity', productQuantity);//---------------
            // console.log('size', size);//---------------
            if (buttonStatus == -1) {
                if (cartQuantity > 1) {
                    await Cart.updateOne(
                        { user: userId, products: { $elemMatch: { _id: id } } },
                        { $inc: { 'products.$.quantity': -1 } }
                    )
                    return res.json({ update: true })
                } else {
                    console.log('minimum quantity required');
                    return res.json({ min: true });
                }
            }

            if (cartQuantity == 5) {
                console.log('max qty');
                return res.json({ maxQty: true })
            }

            if (buttonStatus == 1) {
                if (cartQuantity < productQuantity) {
                    // console.log('ffggggggggggggggggggggggggggg');//---------------------

                    await Cart.updateOne(
                        { user: userId, products: { $elemMatch: { _id: id } } },
                        { $inc: { "products.$.quantity": 1 } } 
                    )
                    return res.json({ update: true })
                } else {
                    // console.log('cart quantity equal');//--------------
                    return res.json({ max: true });
                }
            }
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// load checkout
const loadCheckout = async (req, res) => {
    try {
        console.log('im in checkout');//-----------
        const userId =req.session.user.id;
        console.log('userId chsckout',userId);//------------
        const userData = await Users.findOne({_id:userId});
       const cartData= await Cart.findOne({user:userId}).populate('products.productId');
       console.log('userData',userData);//-----------------
       console.log('cartData',cartData);//-----------------
        res.render('checkout',{userData,cartData});
    } catch (error) {
        console.log(error);
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