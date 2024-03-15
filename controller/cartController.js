const products = require('../model/productsModel');
const Cart = require('../model/cartModel');
const { json } = require('express');
const mongoose = require('mongoose');


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
                res.render('Cart', { cartData });
            } else {
                res.render('Cart');
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

        const { size, quantity, productId } = req.body
        const productData = await products.findOne({ _id: productId });
        console.log('productId', productId)//--------------------
        // console.log('size', size)//--------------------
        // console.log('userId', userId)//--------------------
        // console.log('q', quantity)//--------------------
        const cartData = await Cart.findOne({ user: userId }).populate('products.productId');
        // console.log('cartData',cartData);//-------------------
        if (cartData) {
            let product = {
                productId: productId,
                quantity: quantity,
                size: size,
                price: productData.price,
                offerPrice: productData.offerPrice
            }
            console.log('product from addto Cart 0', product);//-------------------
            const pro = await Cart.findOne({ user: userId, 'products.productId': productId });
            console.log(pro, 'pro');//----------------------
            if (pro !== null && typeof pro === 'object' && typeof pro.products !== 'undefined') {
                const productDetails = pro.products.find((el) => el.size == size);

                if (!productDetails) {
                    await Cart.updateOne({ user: userId }, {
                        $push: {
                            products: product,
                        }
                    })
                    console.log('product added to cart existing cart')//------------------

                }
            }
            else {
                let product = {
                    productId: productId,
                    quantity: quantity,
                    size: size,
                    price: productData.price,
                    offerPrice: productData.offerPrice
                }
                // console.log('quantity',quantity)//-----------
                // console.log('productData.price',productData.price)//-----------
                // console.log('totalOrginalPrice2', product.totalOrginalPrice);//-------------------
                console.log('product from addto Cart1', product);//-------------------
                await Cart.updateOne({ user: userId }, {
                    $push: {
                        products: product
                    }
                })
                console.log("Pro is null or undefined, or 'products' property does not exist.");//--------------

            }


        } else {
            let product = {
                productId: productId,
                quantity: quantity,
                size: size,
                price: productData.price,
                offerPrice: productData.offerPrice
            }
            console.log('product from addto Cart2', product);//-------------------

            const cartProduct = new Cart({
                user: userId,
                products: product
            })

            if (cartProduct) {
                await cartProduct.save();

            }

        }
        res.json({ added: true });

    } catch (error) {
        console.log(error);
    }
}


// remove product from Cart
const removeFromCart = async (req, res) => {
    try {
        console.log('removeFromCart', req.body);//------------------
        const id = req.session.user.id;
        let { productId, size } = req.body;
        productId=productId.trim()
        console.log('productId', productId)//-----------------------------
        console.log('size', size)//-----------------------------
if (!mongoose.Types.ObjectId.isValid(productId)){
    return res.status(400).json({ error: 'Invalid productId' });
}
        const cartProducts = await Cart.updateOne({ user: id }, {
            $pull: {
                products: { productId: productId, size: size }
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

        const { productId, size } = req.body;
        console.log(req.body, userId)//=-----------------
        if (!userId) {
            return res.json({ nouser: true })
        }
        const cart = await Cart.findOne({ user: userId, 'products.productId': productId });
        console.log('cart', cart);//----------------
        if (cart && cart.products && Array.isArray(cart.products)) {
            const product = cart.products.find((el) => el.size == size);
            // console.log(product, 'dddddddddd');//---------------
            if (product) {
                console.log('product exist', product)//-----------------
                res.json({ exist: true, })
            } else {
                res.json({ not: true, productId });
                console.log('product not exist', product)//-----------------
            }
        } else {
            res.json({ not: true, productId });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
// ================================
// cart change quantity
// const changeQuantity = async (req, res) => {
//     try {
//         console.log('im in change qty')//--------------
//         const { productId, size, qtyBtn, } = req.body
//         const quantity = parseInt(req.body.quantity);
//         console.log('req,body changepppppppppppppppppppppppppppppppppp', productId)//--------------
//         const userId = req.session.user.id;
//         console.log('userId',userId);//------------------------
//         const product = await products.findOne({ _id: productId });
//         console.log("product.stock.size", product.stock[size]);//-----------

//         console.log('product', product)//--------------------
//         if (!product) {
//             return res.status(404).json({ error: 'Product not found' });
//         } else {

//             if (qtyBtn == true) {
//                 const sizeQuantity = parseInt(product.stock[size]);
//                 console.log('qtyBtn == true')//--------------------------
//                 console.log('product.stock[size]=', product.stock[size], typeof product.stock[size], "quantity", quantity, typeof quantity);//-------------------------
//                 console.log('product.stock[size] > quantity', product.stock[size] > quantity, 'sizeQuantity', sizeQuantity)//--------------------------
//                 if (sizeQuantity > quantity) {
//                     console.log('productId from qtybtn == true', productId)//--------------------
//                     await Cart.findOneAndUpdate(
//                         { user: userId, 'products.productId': productId},  
//                         { $inc: { 'products.$.quantity': 1 } },
//                         { new: true }
//                     );
//                     res.json({ update: true })
//                 } else {
//                     console.log('true eror')//--------------------------

//                     res.json({ update: false, quantity: 'maximum' })
//                 }
//             } else if (qtyBtn == false) {
//                 console.log('qtyBtn,-----------', qtyBtn)//--------------------------
//                 console.log('qtyBtn == false')//--------------------------
//                 if (quantity > 1) {
//                     await Cart.findOneAndUpdate(
//                         { user: userId, 'products.productId': productId, 'products.size': size },
//                         { $inc: { 'products.$.quantity': -1 } },
//                         { new: true }
//                     );
//                     res.json({ update: true });
//                 } else {
//                     console.log('false eror')//--------------------------
//                     res.json({ update: false, quantity: 'minimum' });
//                 }
//             }
//         }

//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ error: 'Internal server error' });
//     }

// }
// ================================

// cart change quantity
const changeQuantity = async (req, res) => {
    try {
        console.log('im in change qty')//--------------
        const { productId, id, status } = req.body;
        const userId = req.session.user.id;
        console.log('req.body=', req.body);//------------
        console.log('type.stauts=', typeof req.body.status);//------------
        console.log('id', id)//------
        const cart = await Cart.findOne({ user: userId });
        console.log('cart =', cart);//--------
        const product = await products.findOne({ _id: productId });
        console.log('product =', product);//--------        
        const cartProduct = await cart.products.find((n) => n._id == id)
        console.log('cartProduct =', cartProduct);//------

        if (status) {
            const size = cartProduct.size;
            const cartQuantity = cartProduct.quantity;
            const productQuantity = parseInt(product.stock[size]);
            console.log('cartQuantity', cartQuantity);//---------------
            console.log('productQuantity', productQuantity);//---------------
            console.log('size', size);//---------------
            if (status == -1) {
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

            if (status == 1) {
                if (cartQuantity < productQuantity) {
                    console.log('ffggggggggggggggggggggggggggg');//---------------------

                    await Cart.updateOne(
                        { user: userId, products: { $elemMatch: { _id: id } } },
                        { $inc: { "products.$.quantity": 1 } } 
                    )
                    return res.json({ update: true })
                } else {
                    console.log('cart quantity equal');//--------------
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
const loadCheckout = (req, res) => {
    try {
        console.log('im in checkout');//-----------
        res.render('checkout');
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