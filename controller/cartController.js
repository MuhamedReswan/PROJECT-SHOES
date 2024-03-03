const products = require('../model/productsModel');
const Cart = require('../model/cartModel');


//load Cart
const loadCart = async (req, res) => {
    try {
        console.log('im in caert');//-----------------------------
        const userId = req.session.user.id;
        if (userId) {
            const cartData = await Cart.findOne({ user: userId }).populate('products.productId');
            console.log("cartData", cartData);//--------------------------------
            res.render('Cart', { cartData });
        } else {
            res.render('Cart');
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
        console.log('size', size)//--------------------
        console.log('userId', userId)//--------------------
        console.log('q', quantity)//--------------------
        const cartData = await Cart.findOne({ user: userId });

        if (cartData) {
            let product = {
                productId: productId,
                quantity: quantity,
                size: size,
                price: productData.offerPrice,
                totalPrice: productData.offerPrice * quantity
            }
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
            } else {
                let product = {
                    productId: productId,
                    quantity: quantity,
                    size: size,
                    price: productData.offerPrice,
                    totalPrice: productData.offerPrice * quantity
                }
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
                price: productData.offerPrice,
                totalPrice: productData.offerPrice * quantity
            }
            console.log('product from addto Cart', product);//-------------------

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
        const {productId,size}=req.body;
        console.log('productId',productId)//-----------------------------
        console.log('size',size)//-----------------------------
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
            console.log(product, 'dddddddddd');//---------------
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

module.exports = {
    loadCart,
    addToCart,
    removeFromCart,
    checkCart
}