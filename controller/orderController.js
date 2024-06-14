const Products = require('../model/productsModel');
const Users = require('../model/userModel');
const Cart = require('../model/cartModel');
const Orders = require('../model/orderModel');
const Retruns = require('../model/orderModel')
const { createOrderPayment } = require('../controller/paymentController');


// place order
const placeOrder = async (req, res) => {
    try {
        console.log('im in place order');//-----------
        const userId = req.session.user?.id;
        // console.log('req.body=' + req.body); //-----------
        console.log('place order userId=' + userId); //-----------
        // console.log('req.body.index=' + req.body.index); //-----------
        // console.log('req.body.paymentMethod=', req.body.paymentMethod);//----------- 
        const {
            subtotal,
            paymentMethod,
            index
        } = req.body;

        console.log('index from place order', index)//------------------------------------------------------------------------------------------------------------


        const cartData = await Cart.findOne({ user: userId }).populate('products.productId');
        // console.log('car place order', cartData);//-----------
        let products = cartData?.products
        console.log('prodductssssssssssssssssssss', products);//------------------
        let lessQuantity = 0
        let size = 0
        if (products.length == 0) {
            console.log("no product in cart");

        } else {
            products.forEach((product) => {
                if (product.quantity > product.productId.totalStock) {
                    // console.log('product.productId.stock',product.productId.stock)//------------------
                    // console.log('product.productId',product.productId)//------------------
                    lessQuantity = product.productId.name;
                }
            });
        }


        // console.log('lessQuantity', lessQuantity)//--------------

        if (lessQuantity && lessQuantity !== 0) {
            console.log('within if case');//--------------------------
            return res.json({ quant: true, lessQuantity });
        } else {
            console.log('within else case');//--------------------------

            const user = await Users.findOne({ _id: userId });
            const status = paymentMethod == "COD" ? 'Placed' : 'Pending';
            let order;


            // console.log('orderd detailsnnnnnnnnnnnnnnnnn', orderDetails);//--------------------------


            // console.log('within orderDetails.status == Placed')//=----------------------------------------------------------
            for (let i = 0; i < products.length; i++) {
                const productId = products[i].productId._id;
                const productTotalStock = products[i].productId.totalStock;
                const productCartQuantity = products[i].quantity;
                // const updatedQuantity = productTotalStock-productCartQuantity;

                console.log('productTotalStock', productTotalStock);//------------
                // console.log('updatedQuantity',updatedQuantity);//------------
                console.log('productId', productId);//------------
                console.log('productCartQuantity', productCartQuantity);//------------
                // const updateProduct = await Products.findByIdAndUpdate({ _id: productId });
                // console.log("updateProduct", updateProduct);//--------------------------

                //     updateProduct.totalStock -= productCartQuantity;
                //    await updateProduct.save()
                const updatedQuantity = await Products.findByIdAndUpdate(
                    productId,
                    { $inc: { totalStock: -productCartQuantity } },
                    { new: true }
                )

                // console.log("updateProduct  111111111", updateProduct);//--------------------------
            }


            await Cart.deleteOne({ user: userId });

            if (paymentMethod == "COD") {

                const address = user.addresses[index];
                console.log('addresses', user.addresses[index]);//--------------
                console.log('status', status);//------------------------
                // console.log('order addres', address);//--------------
                const date = Date.now();
                const randomNumber = Math.floor(100000 + Math.random() * 900000);
                order = new Orders({
                    user: userId,
                    products: products,
                    totalAmount: subtotal,
                    orderStatus: status,
                    paymentMethod: paymentMethod,
                    deliveryAddress: address,
                    orderId: randomNumber
                })
                console.log('COD order in place order---------------', order);//--------------------------
                const orderDetails = await order.save();
                const orderId = orderDetails._id;
                return res.json({ paymentMethod: "COD", orderId });

            } else {
                const address = user.addresses[index];
                console.log('addresses', user.addresses[index]);//--------------
                console.log('status', status);//------------------------
                // console.log('order addres', address);//--------------
                const date = Date.now();
                const randomNumber = Math.floor(100000 + Math.random() * 900000);
                order = new Orders({
                    user: userId,
                    products: products,
                    totalAmount: subtotal,
                    orderStatus: status,
                    paymentMethod: paymentMethod,
                    deliveryAddress: address,
                    orderId: randomNumber
                })
                console.log('online order in place order-----------', order);//--------------------------
                const orderDetails = await order.save();

                console.log('place order orderDetails', orderDetails)//-------------------------

                createOrderPayment(req, res, orderDetails)
            }
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


//order success
const loadOrderSuccess = (req, res) => {
    try {
        const orderId = req.params.orderId;
        // console.log('orderId', orderId);//-----------
        res.render('orderSuccess', { orderId });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// order details
const loadOrderDetails = async (req, res) => {
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
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}



// my orders
const loadMyOrder = async (req, res) => {
    try {

        console.log('im in my orders')//--------------
        const userId = req.session.user?.id;
        if (userId) {
            const orders = await Orders.find({ user: userId }).populate('user').populate('products.productId');
            // console.log('my order orders', orders)//-----------------------
            res.render('myOrders', { orders })
        } else {
            res.status(401).json({ error: 'User id not getting' });
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal Server Error' });
    }

}



// order cancel
const orderCancel = async (req, res) => {
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
                console.log('quantity ', quantity);
                console.log('productId ', productId);

                const updateCancelledQuantity = await Products.updateOne(
                    { _id: productId },
                    { $inc: { totalStock: quantity } },
                    { new: true }
                );
                console.log('updateCancelledQuantity', updateCancelledQuantity);
            }
        }

        res.status(200).json({ orderCancel: true });

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal Server Error' });
    }
}




// single order product
const singleOrderProduct = async (req, res) => {
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
        console.log(error)
        res.status(500).json({ error: 'Internal Server Error' });
    }
}



// Return product 
const returnProduct = async (req, res) => {
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
        console.log(error)
        res.status(500).json({ error: 'Internal Server Error' });
    }
}




// razor pay failed
const razorPayFailed = async (req, res) => {
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
        console.log(error)
    }
}

























































//admin---------------------------------------------------------------------------------------------


//admin order 
const adminOrders = async (req, res) => {
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
            .populate('user').populate('products.productId')
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
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}



//single order admin
const singleOrderDetails = async (req, res) => {
    try {
        console.log('in single orders');//------------------
        const orderId = req.query.id;
        const singleOrder = await Orders.findOne({ _id: orderId }).populate('user').populate('products.productId');
        console.log('orderDetails-single', JSON.stringify(singleOrder));//-----------------
        res.render('singleOrders', { singleOrder });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}



// change order status 
const changeOrderStatus = async (req, res) => {
    try {
        const orderId = req.query.id;
        const chanagedStatus = req.body.orderStatus;

        console.log('im in change-order-status')//---------------
        console.log('req.body', req.body)//---------------

        const orderStatusChange = await Orders.findOneAndUpdate({
            _id: orderId
        },
            {
                $set:
                {
                    orderStatus: chanagedStatus,
                    'products.$[].status': chanagedStatus
                }
            },
            { new: true })
            .populate('user')
            .populate('products.productId')
        console.log('orderStatusChange', orderStatusChange)//---------------
        res.status(200).json({ statusUpdated: true })

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal Server Error' });
    }
}



//return request 
const loadReturnRequest = async (req, res) => {
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
        console.log(error)
        res.status(500).json({ error: 'Internal Server Error' });
    }
}



// change return product status
const changeRetrunProductStatus = async (req, res) => {
    try {
        console.log('im in changeRetrunProductStatus');//-------------
        console.log('req.body', req.body)//---------------------------
        let { status, orderId, quantity, productId } = req.body
        let isReturned;

        status === 'Accepted' ? status = 'Returned' : status = 'Return Denied'
        status === 'Accepted' ? isReturned = true : isReturned = false

        console.log('statav isreturnd', isReturned)//-------------------------------
        console.log('status', status)//--------------------
        console.log('quantity', quantity)//--------------------

        const statusChanged = await Orders.updateOne(
            { _id: orderId, 'products.productId': productId },
            {
                $set:
                {
                    'products.$.status': status
                }
            }
        )

        if (status === 'Returned') {
            console.log('within if(status===Accepted')//-----------------------------------------------
            const updateReturnedQuantity = await Products.findByIdAndUpdate(
                productId,
                { $inc: { totalStock: quantity } },
                { new: true }
            )
        }
        res.status(200).json({ statusChanged: true })

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });

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
    // changeStatusSingle,
    // orderSingleProduct,
    // updateSingleOrderStatus,



    adminOrders,
    loadReturnRequest,
    loadOrderDetails,
    singleOrderDetails,
    changeOrderStatus,
    changeRetrunProductStatus

}