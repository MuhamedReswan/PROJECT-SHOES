const Products = require('../model/productsModel');
const Users = require('../model/userModel');
const Cart = require('../model/cartModel');
const Orders = require('../model/orderModel');
const Coupons = require('../model/couponModel');
const Retruns = require('../model/orderModel');
const { createOrderPayment } = require('../controller/paymentController');
const Wallet = require('../model/walletModel');
const mongoose = require('mongoose');

// Place order
const placeOrder = async (req, res,next) => {
    try {
        console.log('im in place order');//-----------
        const userId = req.session.user?.id;
        const { subtotal, paymentMethod, index } = req.body;

        const cartData = await Cart.findOne({ user: userId }).populate('products.productId');
        console.log('car place order', cartData);//-----------
        if (cartData) {

            let products = cartData?.products
            let productCount = cartData?.products.length;
  
            let lessQuantity = 0
            let unListedProduct=null;

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
                return res.json({ quant: true, lessQuantity });

            } else if (unListedProduct) {
                return res.json({ notListedProduct: true, unListedProduct });

            } else {

                const user = await Users.findOne({ _id: userId });
                const status = paymentMethod == "COD" ? 'Placed' : 'Pending';
                let order;

                const address = user.addresses[index];

                const randomNumber = Math.floor(100000 + Math.random() * 900000);

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
                }

                const couponId = cartData?.coupon?.couponId;

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
                    const orderDetails = await order.save();

                    await Cart.deleteOne({ user: userId });
                    createOrderPayment(req, res, orderDetails, paymentMethod)

                } else if (paymentMethod == "Wallet") {

                    const walletDetails = await Wallet.findOne({ user: userId });

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

                            const orderDetails = await order.save();
                            const orderId = orderDetails._id;

                            const updatedOrder = await Orders.findByIdAndUpdate({ _id: orderId },
                                {
                                    $set: {
                                        paymentStatus: "Paid",
                                        orderStatus: "Placed"

                                    }
                                }
                            )


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

                    const userWallet = await Wallet.findOne({ user: userId });
                    let userWalletAmount = userWallet.balance;
                    let WalletId = userWallet._id;

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

                    await Cart.deleteOne({ user: userId });

                    createOrderPayment(req, res, orderDetails, paymentMethod)

                }
            }
        } else {

            const cart = new Cart({
                user: userId,
            })

            await cart.save;
            return res.json({ cartProduct: false })

        }
    } catch (error) {
        console.log(error.message);
        next(error);   
     }
}



// Load order success page
const loadOrderSuccess = (req, res, next) => {
    try {
        const orderId = req.params.orderId;
        res.render('orderSuccess', { orderId });
    } catch (error) {
        console.log(error.message);
        next(error);
    }
};



// Load order details
const loadOrderDetails = async (req, res, next) => {
    try {
        const orderId = req.query.id;
        const userId = req.session.user.id;
        const orderDetails = await Orders.findOne({ user: userId, _id: orderId }).populate('user').populate('products.productId');
        res.render('orderDetails', { orderDetails });
    } catch (error) {
        console.log(error.message);
        next(error);
    }
};



// my orders
const loadMyOrder = async (req, res, next) => {
    try {
        const userId = req.session.user?.id;

        let page = parseInt(req.query.page) || 1;
        const limit = 8;
        const nextPage = page + 1;
        const previousPage = page > 1 ? page - 1 : 1;

        // Count the total number of orders for pagination
        const count = await Orders.countDocuments({ user: userId });
        const totalPage = Math.ceil(count / limit);
        const next = nextPage > totalPage ? totalPage : nextPage;

        if (userId) {
            const orders = await Orders.find({ user: userId })
                .populate('user')
                .populate('products.productId')
                .sort({ date: -1 })
                .limit(limit)
                .skip((page - 1) * limit)
                .exec();

            res.render('myOrders', {
                orders,
                totalPage,
                previous: previousPage,
                next,
                page
            });
        } else {
            res.status(401).json({ error: 'User id not getting' });
        }
    } catch (error) {
        console.log(`Error in loadMyOrder: ${error.message}`);
        next(error);
    }
};



// order cancel
const orderCancel = async (req, res, next) => {
    try {
        const { reason, comment, orderId } = req.body;
        const userId = req.session.user?.id;

        const orderDetails = await Orders.findOneAndUpdate(
            { _id: orderId, user: userId },
            {
                $set: {
                    orderStatus: 'Cancelled',
                    cancelDetails: { reason, comment },
                    'products.$[element].status': 'Cancelled'
                }
            },
            {
                arrayFilters: [{ 'element.status': { $exists: true } }],
                new: true
            }
        );

        if (orderDetails) {
            for (const product of orderDetails.products) {
                const { productId, quantity } = product;

                await Products.updateOne(
                    { _id: productId },
                    { $inc: { totalStock: quantity } },
                    { new: true }
                );
            }

            const order = await Orders.findOne({ _id: orderId, user: userId });
            const orderAmount = order.totalAmount;
            const transactions = {
                amount: orderAmount,
                mode: "Credited",
                description: "Returned amount of canceled order"
            };

            await Wallet.updateOne(
                { user: userId },
                {
                    $inc: { balance: orderAmount },
                    $push: { transactions }
                },
                { new: true }
            );

            console.log(`Order Cancelled - Amount Credited: ${orderAmount}`);

            res.status(200).json({ orderCancel: true });
        }
    } catch (error) {
        console.log(`Error in orderCancel: ${error.message}`);
        next(error);
    }
};



// single order product
const singleOrderProduct = async (req, res, next) => {
    try {
        const orderId = req.query.orderid;
        const userId = req.session.user.id;

        const userWallet = await Wallet.findOne({user: userId});
        console.log("wallet from single order =", userWallet);//--------------
        
        let lastWalletPayment = 0;
        
        if (userWallet && userWallet.transactions && userWallet.transactions.length > 0) {
            lastWalletPayment = userWallet.transactions[userWallet.transactions.length - 1].amount;
        }
        
        console.log("wallet from single order lastWalletPayment =", lastWalletPayment);//--------------

        

        const singleOrder = await Orders.findOne({ _id: orderId, user: userId })
            .populate('user')
            .populate('products.productId');

        res.status(200).render('singleOrderProducts', { singleOrder,lastWalletPayment });
    } catch (error) {
        console.log(`Error in singleOrderProduct: ${error.message}`);
        next(error);
    }
};



// Return product
const returnProduct = async (req, res, next) => {
    try {
        const { returnReason, returnComment, orderId, productId } = req.body;
        const userId = req.session.user.id;

        await Orders.findOneAndUpdate(
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

        res.status(200).json({ returnRequested: true });
    } catch (error) {
        console.log(`Error in returnProduct: ${error.message}`);
        next(error);
    }
};



// razor pay failed
const razorPayFailed = async (req, res, next) => {
    try {
        const orderId = req.body.orderId;

        // Update order payment status to Failed
        const orderDetails = await Orders.findOneAndUpdate(
            { _id: orderId },
            {
                $set: {
                    paymentStatus: "Failed",
                    orderStatus: "Pending"
                }
            },
            { new: true }
        );

        // Fetch and update stock for products in the failed order
        const singleOrderDetails = await Orders.findOne({ _id: orderId }).populate('products.productId');
        if (singleOrderDetails.products.length > 0) {
            for (const product of singleOrderDetails.products) {
                const productId = product.productId._id;
                const productCartQuantity = product.quantity;

                await Products.findByIdAndUpdate(
                    productId,
                    { $inc: { totalStock: productCartQuantity } },
                    { new: true }
                );
            }
        }

        res.status(200).json({ orderDetails });

    } catch (error) {
        console.log(`Error in razorPayFailed: ${error.message}`);
        next(error);
    }
};



// load invoice
const loadInvoice = async (req, res, next) => {
    try {
        const orderId = req.query.id;
        const userId = req.session.user.id;
        
        console.log("Order ID for invoice:", orderId);

        const order = await Orders.findOne({ _id: orderId })
            .populate('products.productId')
            .populate('user');
        
            const userWallet = await Wallet.findOne({user: userId});
            
            let lastWalletPayment = 0;
            
            if (userWallet && userWallet.transactions && userWallet.transactions.length > 0) {
                lastWalletPayment = userWallet.transactions[userWallet.transactions.length - 1].amount;
            }
            

        console.log("Order details:", order);

        res.status(200).render('invoice', { order,lastWalletPayment });
    } catch (error) {
        console.log(`Error in loadInvoice: ${error.message}`);
        next(error);
    }
};



// retry payment
const retryPayment = async (req, res, next) => {
    try {
        const { orderId } = req.body;
        console.log('Order ID for retry payment:', orderId);

        const orderDetails = await Orders.findOne({ _id: orderId });
        const paymentMethod = orderDetails.paymentMethod;

        console.log('Order Details:', orderDetails);
        console.log('Payment Method:', paymentMethod);

        createOrderPayment(req, res, orderDetails, paymentMethod);

    } catch (error) {
        console.log(`Error in retryPayment: ${error.message}`);
        next(error);
    }
};






// ==================================================================   ADMIN   ======================================================================== 

// admin order
const adminOrders = async (req, res, next) => {
    try {
        let page = 1;
        if (req.query.page) {
            page = req.query.page;
        }
        let limit = 8;
        let next = page + 1;
        let previous = page > 1 ? page - 1 : 1;
        let count = await Orders.find({}).count();

        let totalPage = Math.ceil(count / limit);
        if (next > totalPage) {
            next = totalPage;
        }

        const ordersDetails = await Orders.find({})
            .populate('user')
            .populate('products.productId')
            .sort({ date: -1 })
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();

        res.render('orders', {
            ordersDetails: ordersDetails,
            totalPage: totalPage,
            previous: previous,
            next: next,
            page: page
        });
    } catch (error) {
        console.log(`Error in adminOrders: ${error.message}`);
        next(error);
    }
}



// single order admin
const singleOrderDetails = async (req, res, next) => {
    try {
        const orderId = req.query.id;
        const singleOrder = await Orders.findOne({ _id: orderId }).populate('user').populate('products.productId');
        
        res.render('singleOrders', { singleOrder });
    } catch (error) {
        console.log(`Error in singleOrderDetails: ${error.message}`);
        next(error);
    }
}



// change order status
const changeOrderStatus = async (req, res, next) => {
    try {
        const orderId = req.query.id;
        const chanagedStatus = req.body.orderStatus;

        let filterConditons = {
            orderStatus: chanagedStatus,
            'products.$[].status': chanagedStatus
        };

        const order = await Orders.findOne({ _id: orderId });

        if (chanagedStatus === "Delivered" && order.paymentMethod === 'COD') {
            filterConditons.paymentStatus = 'Paid';
        }

        await Orders.findOneAndUpdate(
            { _id: orderId },
            { $set: filterConditons },
            { new: true }
        ).populate('user').populate('products.productId');

        res.status(200).json({ statusUpdated: true });

    } catch (error) {
        console.log(`Error in changeOrderStatus: ${error.message}`);
        next(error);
    }
}



// return request
const loadReturnRequest = async (req, res, next) => {
    try {
        const returnRequestedProducts = await Orders.aggregate([
            { $unwind: '$products' },
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
        ]);

        if (returnRequestedProducts) {
            res.render('returnRequest', { returnRequestedProducts });
        }

    } catch (error) {
        console.log(`Error in loadReturnRequest: ${error.message}`);
        next(error);
    }
}



// change return product status
const changeReturnProductStatus = async (req, res, next) => {
    try {
        let { status, orderId, quantity, productId } = req.body;
        let isReturned = status === 'Accepted';
        status = status === 'Accepted' ? 'Returned' : 'Delivered';

        const statusChanged = await Orders.updateOne(
            { _id: orderId, 'products.productId': productId },
            {
                $set: {
                    'products.$.status': status,
                    'products.$.isReturned': isReturned
                }
            },
            { new: true }
        );

        if (status === 'Returned') {
            await Products.findByIdAndUpdate(
                { _id: productId },
                { $inc: { totalStock: quantity } },
                { new: true }
            );

            const orderDetails = await Orders.findOne({ _id: orderId });
            const userId = orderDetails.user;

            let product = orderDetails.products.find(product => product.productId.toString() === productId);

            let DiscountedPrice = orderDetails?.coupon.discount;
            let DiscountedPriceEachProduct = DiscountedPrice / orderDetails?.products.length || 0;

            let amount = Math.round((product.offerPrice * quantity) - DiscountedPriceEachProduct);
            amount = amount > 0 ? amount : 0;

            const transactions = {
                amount: amount,
                mode: "Credited",
                description: "Refunded Amount of return Product"
            };

            const updation = {
                $inc: { balance: amount },
                $push: { transactions }
            };

            let returnAmountToWallet = await Wallet.updateOne({ user: userId }, updation, { new: true });

            if (!returnAmountToWallet) {
                const userWallet = new Wallet({ user: userId });
                await userWallet.save();

                returnAmountToWallet = await Wallet.updateOne({ user: userId }, updation, { new: true });
            }
        }

        res.status(200).json({ statusChanged: true });

    } catch (error) {
        console.log(`Error in changeReturnProductStatus: ${error.message}`);
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
    loadInvoice,




    adminOrders,
    loadReturnRequest,
    loadOrderDetails,
    singleOrderDetails,
    changeOrderStatus,
    changeReturnProductStatus
}