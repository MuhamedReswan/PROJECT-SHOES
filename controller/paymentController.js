const Razorpay = require('razorpay');
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;
const Orders = require('../model/orderModel');
const crypto = require('crypto')


const razorpayInstance = new Razorpay({
    key_id: RAZORPAY_ID_KEY,
    key_secret: RAZORPAY_SECRET_KEY
});



const createOrderPayment = async (req, res, myOrder,paymentMethod,next) => {
    try {
    // console.log(req, 'order123req')//------------------------
    // console.log(res, 'order123res')//------------------------
    console.log('myOrderr123------------',myOrder)//------------------------
    console.log('paymentMethod------------',paymentMethod)//------------------------
    console.log("my order._id in pyment controller==============", myOrder._id)//------------------------
   

        console.log("im in create order payment%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");//----------------------
        console.log("myOrder.totalAmount", myOrder.totalAmount);//-------------------------
        console.log("myOrder._id", myOrder._id);//-------------------------

        const amount = myOrder.totalAmount * 100

        const options = {

            amount: amount,
            currency: 'INR',
            receipt: 'muhamedreswan9917@gmail.com'

        }

        console.log('options ----s-', options);//---------------------------------

        razorpayInstance.orders.create(options,

            (err, order) => {

                console.log("order on razor pay instance", order)//----------------------------------

                if (!err) {

                    console.log("sdfsadfsdfsdfs", order.amount)//---------------------------


                    res.send({
                        order,
                        paymentMethod: paymentMethod,
                        success: true,
                        msg: 'Order Created',
                        order_id: order.id,
                        orderId: myOrder._id,
                        amount: amount,
                        key_id: RAZORPAY_ID_KEY,
                        contact: myOrder?.deliveryAddress?.mobile,
                        name: myOrder?.deliveryAddress?.name,
                        email: "customer@gmail.com"

                    });
                    // res.json({ success: true, paymentMethod: "Online", orderId: orderId, totalAmount: subtotal })
                }
                else {

                    res.status(400).json({ success: false, msg: 'Something went wrong on razorpayInstance !' });

                }
            }
        );

    } catch (error) {
        console.log(error.message);
        next(error);   
     }
}




// Verify payment razorpay
const verifyPaymentRazorpay = (async (req, res,next) => {
    try {

        console.log("verfy razopay---------------------------------------------------------", req.body)//---------------
        const userId = req.session.user?.id;
        const { payment, order } = req.body;
        console.log("verfy razopay payment--------------", payment)//---------------
        console.log("verfy razopay order--------------", order)//---------------


        const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET_KEY);
        hmac.update(payment.razorpay_order_id + "|" + payment.razorpay_payment_id);
        const hmacValue = hmac.digest("hex");

        if (hmacValue == payment.razorpay_signature) {
            console.log("order.orderId", order.orderId);//-------------

            const val = await Orders.findOneAndUpdate({ _id: order.orderId },
                { $set: { paymentStatus: "Paid", paymentId: payment.razorpay_payment_id, orderStatus: "Placed" } },
                { new: true })

            console.log('val', val);//-----------------------


            return res.json({ paymentSuccess: true, orderId: order.orderId });
        } else {
            res.json({ paymentSuccess: false, orderId: order.orderId })
        }


    } catch (error) {
        console.log(error.message);
        next(error);   
     }
})



module.exports = {
    createOrderPayment,
    verifyPaymentRazorpay
}