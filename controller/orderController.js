const Products = require('../model/productsModel');
const Users = require('../model/userModel');
const Cart = require('../model/cartModel');
const Orders = require('../model/orderModel');
const Coupons = require('../model/couponModel');
const Retruns = require('../model/orderModel');
const { createOrderPayment } = require('../controller/paymentController');
const Wallet = require('../model/walletModel');
const mongoose = require('mongoose');


// place order
const placeOrder = async (req, res,next) => {
    try {
        console.log('im in place order');//-----------
        const userId = req.session.user?.id;

        // console.log('req.subtotal=' + req.body.subtotal); //-----------
        // console.log('place order userId=' + userId); //-----------
        // console.log('req.body.index=' + req.body.index); //-----------
        // console.log('req.body.paymentMethod=', req.body.paymentMethod);//-----------

        const {
            subtotal,
            paymentMethod,
            index
        } = req.body;


        const cartData = await Cart.findOne({ user: userId }).populate('products.productId');
        console.log('car place order', cartData);//-----------
        if (cartData) {

            let products = cartData?.products
            let productCount = cartData?.products.length;
            // // ------------------------------------------------------------------------------------------------------------------------
            //         console.log("cart products. from place order")//--------------
            //         cartData.products.price=cartData.products.offerPrice;

            //         console.log("cart products 2. from place order")//--------------
            //         // -------------------------------------------------------
            // console.log('prodductssssssssssssssssssss', products);//------------------
            let lessQuantity = 0
            let unListedProduct;
            let size = 0
            if (products.length == 0) {
                console.log("no product in cart");
                return res.json({ cartProduct: false })

            } else {
                products.forEach((product) => {
                    if (product?.quantity > product?.productId?.totalStock) {
                        lessQuantity = product.productId.name;
                    }
                    if (product?.productId?.isListed == false) {
                        unListedProduct = product?.productId?.name;
                    }

                });
            }


            if (lessQuantity && lessQuantity !== 0) {
                console.log('within if case');//--------------------------
                return res.json({ quant: true, lessQuantity });

            } else if (unListedProduct) {
                return res.json({ notListedProduct: true, unListedProduct });

            } else {
                console.log('within else case');//--------------------------

                const user = await Users.findOne({ _id: userId });
                const status = paymentMethod == "COD" ? 'Placed' : 'Pending';
                let order;

                const address = user.addresses[index];

                const randomNumber = Math.floor(100000 + Math.random() * 900000);


                console.log(' order status', status);//------------------------              
                console.log('order addres', address);//--------------


                // console.log('within orderDetails.status == Placed')//=----------------------------------------------------------
                for (let i = 0; i < products.length; i++) {
                    const productId = products[i].productId._id;
                    const productTotalStock = products[i].productId.totalStock;
                    const productCartQuantity = products[i].quantity;

                    console.log('productTotalStock', productTotalStock);//------------
                    console.log('productId', productId);//------------
                    console.log('productCartQuantity', productCartQuantity);//------------


                    const updatedQuantity = await Products.findByIdAndUpdate(
                        productId,
                        { $inc: { totalStock: -productCartQuantity } },
                        { new: true }
                    )

                    // console.log("updateProduct  111111111", updateProduct);//--------------------------
                }

                const couponId = cartData?.coupon?.couponId;
                console.log("coupon id from placeOrder", couponId)//-------------------------

                if (couponId) {
                    const updateCoupon = await Coupons.findByIdAndUpdate({ _id: couponId },
                        {
                            $inc: { limit: -1 },
                            $push: { appliedUsers: userId }
                        },
                        { new: true }
                    );
                }

                let couponDiscountProduct = Math.round(cartData?.coupon?.couponDiscount / productCount) ? Math.round(cartData?.coupon?.couponDiscount / productCount) : 0;

                const couponDetails = {
                    couponId: couponId,
                    discount: cartData?.coupon?.couponDiscount,
                    couponDiscountOnProduct: couponDiscountProduct
                }

                if (paymentMethod == "COD") {

                    order = new Orders({
                        user: userId,
                        products: products,
                        totalAmount: subtotal,
                        orderStatus: status,
                        paymentMethod: paymentMethod,
                        deliveryAddress: address,
                        orderId: randomNumber,
                        coupon: couponDetails
                    })
                    console.log('COD order in place order---------------', order);//--------------------------
                    const orderDetails = await order.save();
                    const orderId = orderDetails._id;
                    await Cart.deleteOne({ user: userId });

                    return res.json({ paymentMethod: "COD", orderId });

                } else if (paymentMethod == "Online") {

                    order = new Orders({
                        user: userId,
                        products: products,
                        totalAmount: subtotal,
                        orderStatus: status,
                        paymentMethod: paymentMethod,
                        deliveryAddress: address,
                        orderId: randomNumber,
                        coupon: couponDetails
                    })
                    console.log('online order in place order-----------', order);//--------------------------
                    const orderDetails = await order.save();

                    // console.log('place order orderDetails', orderDetails)//-------------------------

                    await Cart.deleteOne({ user: userId });

                    createOrderPayment(req, res, orderDetails, paymentMethod)


                } else if (paymentMethod == "Wallet") {

                    console.log('in wallet paymetnt in place order-------------')//---------------

                    const walletDetails = await Wallet.findOne({ user: userId });

                    console.log("walletDetails", walletDetails)//----------
                    if (walletDetails) {

                        if (walletDetails.balance == 0) {
                            res.json({ paymentMethod: "Wallet", walletBalance: false, message: "Sorry! your wallet is empty !", subtotal, index, empty: true });

                        } else if (walletDetails.balance < subtotal) {
                            return res.json({ paymentMethod: "Wallet", walletBalance: false, message: "Sorry! insufficent balance in wallet you can pay with online !", subtotal, index, empty: false });
                        } else {


                            const transactions = {
                                amount: subtotal,
                                mode: "Debit",
                                description: "Order amount paid by wallet"
                            }

                            const updation = {
                                $inc:
                                    { balance: -subtotal },
                                $push: {
                                    transactions
                                }

                            }

                            await Cart.deleteOne({ user: userId });


                            const updatedWallet = await Wallet.updateOne({ user: userId }, updation, { new: true });

                            console.log('updated wallet =======', updatedWallet)//-----------------------



                            order = new Orders({
                                user: userId,
                                products: products,
                                totalAmount: subtotal,
                                orderStatus: status,
                                paymentMethod: paymentMethod,
                                deliveryAddress: address,
                                orderId: randomNumber,
                                coupon: couponDetails
                            })
                            console.log('wallet order in place order-----------', order);//--------------------------
                            const orderDetails = await order.save();

                            console.log('place order orderDetails', orderDetails)//-------------------------
                            const orderId = orderDetails._id;

                            const updatedOrder = await Orders.findByIdAndUpdate({ _id: orderId },
                                {
                                    $set: {
                                        paymentStatus: "Paid",
                                        orderStatus: "Placed"

                                    }
                                }
                            )

                            console.log("updatedOrder", updatedOrder)//======================

                            return res.json({ paymentMethod: "Wallet", walletBalance: true, orderId: orderId });

                        }



                    } else {
                        const userWallet = new Wallet({
                            user: userId
                        })

                        const userWalletDetails = await userWallet.save();
                        return res.json({ paymentMethod: "Wallet", walletBalance: false, message: "Sorry! insufficent balance in wallet!" });

                    }



                } else if (paymentMethod == "Wallet With Online") {
                    console.log("Wallet With Online")//------------------------

                    const userWallet = await Wallet.findOne({ user: userId });
                    let userWalletAmount = userWallet.balance;
                    let WalletId = userWallet._id;

                    console.log("userWallet", userWallet)//---------------
                    console.log("userWalletAmount", userWalletAmount)//---------------



                    const transactions = {
                        amount: userWalletAmount,
                        mode: "Debit",
                        description: "Splited order Amount paid by wallet"
                    }

                    const updation = {
                        $inc:
                            { balance: - userWalletAmount },
                        $push: {
                            transactions
                        }
                    }

                    let balanceAmountToPay = subtotal - userWalletAmount;
                    const updateWallet = await Wallet.findByIdAndUpdate({ _id: WalletId }, updation, { new: true });

                    console.log("updateWallet", updateWallet)//------------------------
                    console.log("balanceAmountToPay", balanceAmountToPay)//------------------------


                    order = new Orders({
                        user: userId,
                        products: products,
                        totalAmount: balanceAmountToPay,
                        orderStatus: status,
                        paymentMethod: paymentMethod,
                        deliveryAddress: address,
                        orderId: randomNumber,
                        coupon: couponDetails
                    })

                    const orderDetails = await order.save();
                    console.log("order", order)//------------------------
                    console.log("orderDetails", orderDetails)//------------------------


                    await Cart.deleteOne({ user: userId });

                    createOrderPayment(req, res, orderDetails, paymentMethod)



                }
            }
        } else {

            const cart = new Cart({
                user: userId,
            })

            await cart.save;

            console.log("no cart for this user2---") //-----------------
            return res.json({ cartProduct: false })


        }
    } catch (error) {
        console.log(error.message);
        next(error);   
     }
}


//order success
const loadOrderSuccess = (req, res,next) => {
    try {
        const orderId = req.params.orderId;
        // console.log('orderId', orderId);//-----------
        res.render('orderSuccess', { orderId });
    } catch (error) {
        console.log(error.message);
        next(error);   
     }
}

// order details
const loadOrderDetails = async (req, res,next) => {
    try {
        console.log('im in order details'); //--------------
        const orderId = req.query.id;
        const userId = req.session.user.id;
        console.log('userId', userId); //--------------
        console.log('query id', orderId); //--------------
        const orderDetails = await Orders.findOne({ user: userId, _id: orderId }).populate('user').populate('products.productId');
        console.log('orderDetails=', orderDetails)//-------------
        res.render('orderDetails', { orderDetails });
    } catch (error) {
        console.log(error.message);
        next(error);   
     }
}



// my orders
const loadMyOrder = async (req, res,next) => {
    try {

        console.log('im in my orders')//--------------
        const userId = req.session.user?.id;

        let page = 1;
        if (req.query.page) {
            page = req.query.page;
        }
        let limit = 8;
        let next = page + 1;
        let previous = page > 1 ? page - 1 : 1;
        let count = await Orders.find({ user: userId })
        console.log("count", count.length)//------------

        let totalPage = Math.ceil(count.length / limit);
        if (next > totalPage) {
            next = totalPage
        }

        if (userId) {
            const orders = await Orders.find({ user: userId })
                .populate('user')
                .populate('products.productId')
                .sort({ date: -1 })
                .limit(limit)
                .skip((page - 1) * limit)
                .exec();

            // console.log('my order orders', orders)//-----------------------

            // console.log("totalPage",totalPage)//-------------------------------
            // console.log("next",next)//-------------------------------
            // console.log("previous",previous)//-------------------------------
            // console.log("page",page)//-------------------------------


            res.render('myOrders', {
                orders: orders,
                totalPage: totalPage,
                previous: previous,
                next: next,
                page: page
            })

        } else {
            res.status(401).json({ error: 'User id not getting' });
        }
    } catch (error) {
        console.log(error.message);
        next(error);   
     }
}



// order cancel
const orderCancel = async (req, res,next) => {
    try {
        const { reason, comment, orderId } = req.body;
        console.log('im in order cancel')//---------------
        console.log('req order cancel', req.body)//-----
        const userId = req.session.user?.id;
        const obj = { reason, comment }
        const orderDetails = await Orders.findOneAndUpdate(
            { _id: orderId, user: userId },
            {
                $set: {
                    orderStatus: 'Cancelled',
                    cancelDetails: obj,
                    'products.$[element].status': 'Cancelled'
                }
            },
            {
                arrayFilters: [{ 'element.status': { $exists: true } }],
                new: true
            }
        );

        if (orderDetails) {
            let productId;
            let quantity;

            for (const product of orderDetails.products) {

                productId = product.productId;
                quantity = product.quantity;
                console.log('quantity ', quantity);//--------------------
                console.log('productId ', productId);//-----------------

                const updateCancelledQuantity = await Products.updateOne(
                    { _id: productId },
                    { $inc: { totalStock: quantity } },
                    { new: true }
                );
                console.log('updateCancelledQuantity', updateCancelledQuantity);//----------------------
            }
        }

        const order = await Orders.findOne({ _id: orderId, user: userId })

        const orderAmount = order.totalAmount;
        const transactions = {
            amount: orderAmount,
            mode: "Credited",
            description: "Returned amount of canceled order"
        }

        const updation = {
            $inc:
                { balance: orderAmount },
            $push: {
                transactions
            }

        }



        const updatedWallet = await Wallet.updateOne({ user: userId }, updation, { new: true });

        console.log("updatedwaalert in cancelorder", updatedWallet)//----------------------


        res.status(200).json({ orderCancel: true });

    } catch (error) {
        console.log(error.message);
        next(error);   
     }
}




// single order product
const singleOrderProduct = async (req, res,next) => {
    try {
        const orderId = req.query.orderid;
        const userId = req.session.user.id;

        console.log("orderId singlePRoduct", orderId);//--------------------------
        console.log("userId singlePRoduct", userId);//------------------------------


        const singleOrder = await Orders.findOne({ _id: orderId, user: userId })
            .populate('user').
            populate('products.productId');

        console.log('single order orderId', orderId)//-----------------
        console.log('single order userId', userId)//-----------------
        console.log('single order singleOrder', singleOrder)//-----------------
        res.status(200).render('singleOrderProducts', { singleOrder });
    } catch (error) {
        console.log(error.message);
        next(error);   
     }
}



// Return product 
const returnProduct = async (req, res,next) => {
    try {
        console.log('im in return product ordet--------');//------------------------
        console.log('req.body', req.body);//---------------------
        const { returnReason, returnComment, orderId, productId } = req.body
        const userId = req.session.user.id;

        const ReturnRequested = await Orders.findOneAndUpdate(
            {
                _id: orderId,
                'products.productId': productId
            },
            {
                $set: {
                    'products.$.returnReason': returnReason,
                    'products.$.returnComment': returnComment,
                    'products.$.status': 'Return Requested'
                }
            },
            { new: true }
        );

        res.status(200).json({ returnRequested: true })
    } catch (error) {
        console.log(error.message);
        next(error);   
     }
}




// razor pay failed
const razorPayFailed = async (req, res,next) => {
    try {
        const orderId = req.body.orderId

        const orderDetails = await Orders.findOneAndUpdate({ _id: orderId },
            {
                $set:
                {
                    paymentStatus: "Failed",
                    orderStatus: "Pending"

                }
            },
            { new: true })

        const singleOrderDetails = await Orders.findOne({ _id: orderId }).populate('products.productId');

        if (singleOrderDetails.products.length > 0) {
            let products = singleOrderDetails?.products;

            for (let i = 0; i < products.length; i++) {

                const productId = products[i].productId._id;
                const productTotalStock = products[i].productId.totalStock;
                const productCartQuantity = products[i].quantity;

                const updatedQuantity = await Products.findByIdAndUpdate(
                    productId,
                    { $inc: { totalStock: productCartQuantity } },
                    { new: true }
                )
            }
        }

        res.status(200).json({ orderDetails });

    } catch (error) {
        console.log(error.message);
        next(error);   
     }
}




// load invoice
const loadInvoice = async (req, res,next) => {
    try {
        console.log("within load invoice")///-------------------------
        console.log("req.body", req.quer)///-------------------------

        const orderId = req.query.id;
        console.log("orderId", orderId)//----------
        const order = await Orders.findOne({ _id: orderId }).populate('products.productId').populate('user');
        console.log("order", order)//-------------------------

        res.status(200).render('invoiceNew', { order });
    } catch (error) {
        console.log(error.message);
        next(error);   
     }
}

// retry payment 
const retryPayment = async (req, res,next) => {
    try {
        console.log("within ths controller of retry payment ")//---------------------------
        const { orderId } = req.body;
        console.log('orderId-----------', orderId);//--------------------------

        const orderDetails = await Orders.findOne({ _id: orderId });
        let paymentMethod = orderDetails.paymentMethod;


        console.log(' orderDetails', orderDetails)//-------------------------
        console.log(' paymentMethod', paymentMethod)//-------------------------


        createOrderPayment(req, res, orderDetails, paymentMethod);


    } catch (error) {
        console.log(error.message);
        next(error);   
     }
}

























































//admin---------------------------------------------------------------------------------------------


//admin order 
const adminOrders = async (req, res, next) => {
    try {

        let page = 1;
        if (req.query.page) {
            page = req.query.page
        }
        let limit = 8;
        let next = page + 1;
        let previous = page > 1 ? page - 1 : 1;
        let count = await Orders.find({}).count();

        let totalPage = Math.ceil(count / limit);
        if (next > totalPage) {
            next = totalPage
        }

        const ordersDetails = await Orders.find({})
            .populate('user')
            .populate('products.productId')
            .sort({ date: -1 })
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();

        console.log('admin ordersDetails', ordersDetails);//------------------
        res.render('orders', {
            ordersDetails: ordersDetails,
            totalPage: totalPage,
            previous: previous,
            next: next,
            page: page
        })
    } catch (error) {
        console.log(error.message);
        next(error);   
     }
}



//single order admin
const singleOrderDetails = async (req, res,next) => {
    try {
        console.log('in single orders');//------------------
        const orderId = req.query.id;
        const singleOrder = await Orders.findOne({ _id: orderId }).populate('user').populate('products.productId');
        console.log('orderDetails-single', JSON.stringify(singleOrder));//-----------------
        res.render('singleOrders', { singleOrder });
    } catch (error) {
        console.log(error.message);
        next(error);   
     }
}



// change order status 
const changeOrderStatus = async (req, res,next) => {
    try {
        const orderId = req.query.id;
        const chanagedStatus = req.body.orderStatus;

        console.log('im in change-order-status')//---------------

        let filterConditons = {
            orderStatus: chanagedStatus,
            'products.$[].status': chanagedStatus
        }

        const order = await Orders.findOne({ _id: orderId });

        if (chanagedStatus == "Delivered" && order.paymentMethod == 'COD') {
            filterConditons.paymentStatus = 'Paid'
        }

        const orderStatusChange = await Orders.findOneAndUpdate({
            _id: orderId
        },
            {
                $set: filterConditons
            },
            { new: true })
            .populate('user')
            .populate('products.productId');

        res.status(200).json({ statusUpdated: true })

    } catch (error) {
        console.log(error.message);
        next(error);   
     }
}



//return request 
const loadReturnRequest = async (req, res,next) => {
    try {
        console.log('in requst admin return ')//---------------------

        const returnRequestedProducts = await Orders.aggregate([
            {
                $unwind: '$products'
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'products.productId',
                    foreignField: '_id',
                    as: 'products.productId'
                }
            },
            { $unwind: '$products.productId' },
            { $match: { 'products.status': "Return Requested" } }
        ])
        console.log('returnedOrders', returnRequestedProducts);  //-----------------
        if (returnRequestedProducts) {
            res.render('returnRequest', { returnRequestedProducts })
        } else {
            console.log('returnRequestedProducts is undefined or null');
        }

    } catch (error) {
        console.log(error.message);
        next(error);   
     }
}



// change return product status
const changeRetrunProductStatus = async (req, res,next) => {
    try {
        console.log('im in changeRetrunProductStatus');//-------------
        console.log('req.body', req.body)//---------------------------
        let { status, orderId, quantity, productId } = req.body
        let isReturned;

        status == 'Accepted' ? isReturned = true : isReturned = false
        status === 'Accepted' ? status = 'Returned' : status = 'Delivered'

        const statusChanged = await Orders.updateOne(
            { _id: orderId, 'products.productId': productId },
            {
                $set:
                {
                    'products.$.status': status,
                    'products.$.isReturned': isReturned
                }
            }, {
            new: true
        });

        console.log("statusChanged+++++++++++++++++++=====================================", statusChanged)//----------------

        if (status === 'Returned') {

            const updateReturnedQuantity = await Products.findByIdAndUpdate(
                { _id: productId },
                { $inc: { totalStock: quantity } },
                { new: true }
            )


            const orderDetails = await Orders.findOne({ _id: orderId });
            const userId = orderDetails.user;
            // console.log("orderDetails",orderDetails)//-------------------------

            let product = orderDetails.products.find(product => product.productId.toString() === productId);

            // console.log("product from loop",product)//-------------------------

            let DiscountedPrice = orderDetails?.coupon.discount;
            let DiscountedPriceEachProduct = DiscountedPrice / orderDetails?.products.length
                ? DiscountedPrice / orderDetails?.products.length : 0

            // console.log("DiscountedPrice",DiscountedPrice)//-------------------------
            // console.log("DiscountedPriceEachProduct",DiscountedPriceEachProduct)//-------------------------


            let amount = Math.round((product.offerPrice * quantity) - DiscountedPriceEachProduct);

            // console.log("amount validated",amount);//--------------------------------

            amount = amount > 0 ? amount : 0

            // console.log("product",product);//--------------------------------
            // console.log("amount validated",amount);//--------------------------------


            const transactions = {
                amount: amount,
                mode: "Credited",
                description: "Refunded Amount of rerturn Product"
            }

            const updation = {
                $inc:
                    { balance: amount },
                $push: {
                    transactions
                }
            }

            let returnAmountToWallet = await Wallet.updateOne({ user: userId }, updation, { new: true });

            // console.log("returnAmountToWallet--------------------",returnAmountToWallet)//--------------------
            if (!returnAmountToWallet) {

                console.log("---------------------------------------------------in new wallet")//------------------------

                const userWallet = new Wallet({
                    user: userId
                })
                const userWalletDetails = await userWallet.save();

                returnAmountToWallet = await Wallet.updateOne({ user: userId }, updation, { new: true });


            }
            console.log("---------------------------------------------------returnAmountToWallet", returnAmountToWallet)//------------------------

        }


        res.status(200).json({ statusChanged: true })

    } catch (error) {
        console.log(error.message);
        next(error);   
     }
}

module.exports = {
    placeOrder,
    loadOrderSuccess,
    loadMyOrder,
    orderCancel,
    singleOrderProduct,
    returnProduct,
    razorPayFailed,
    retryPayment,
    // changeStatusSingle,
    // orderSingleProduct,
    // updateSingleOrderStatus,

    loadInvoice,



    adminOrders,
    loadReturnRequest,
    loadOrderDetails,
    singleOrderDetails,
    changeOrderStatus,
    changeRetrunProductStatus

}