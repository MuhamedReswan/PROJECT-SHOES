const Razorpay = require('razorpay');
const crypto = require('crypto');
const Orders = require('../model/orderModel');
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;

// Initialize Razorpay instance
const razorpayInstance = new Razorpay({
    key_id: RAZORPAY_ID_KEY,
    key_secret: RAZORPAY_SECRET_KEY
});

// Create an order payment with Razorpay
const createOrderPayment = async (req, res, myOrder, paymentMethod, next) => {
    try {
        console.log('Creating order payment for:', myOrder._id);

        const amount = myOrder.totalAmount * 100; // Convert amount to paise
        const options = {
            amount: amount,
            currency: 'INR',
            receipt: myOrder._id.toString() // Use order ID as receipt
        };

        // Create order with Razorpay
        razorpayInstance.orders.create(options, (err, order) => {
            if (err) {
                console.error('Error creating order with Razorpay:', err);
                return res.status(400).json({ success: false, msg: 'Something went wrong with Razorpay!' });
            }

            console.log('Order created:', order);
            res.send({
                success: true,
                order,
                paymentMethod,
                msg: 'Order Created',
                order_id: order.id,
                orderId: myOrder._id,
                amount,
                key_id: RAZORPAY_ID_KEY,
                contact: myOrder?.deliveryAddress?.mobile,
                name: myOrder?.deliveryAddress?.name,
                email: "customer@gmail.com"
            });
        });

    } catch (error) {
        console.error('Error in createOrderPayment:', error.message);
        next(error);
    }
};

// Verify Razorpay payment
const verifyPaymentRazorpay = async (req, res, next) => {
    try {
        console.log('Verifying Razorpay payment:', req.body);

        const { payment, order } = req.body;

        // Generate HMAC for validation
        const hmac = crypto.createHmac('sha256', RAZORPAY_SECRET_KEY);
        hmac.update(`${payment.razorpay_order_id}|${payment.razorpay_payment_id}`);
        const hmacValue = hmac.digest('hex');

        // Validate HMAC
        if (hmacValue === payment.razorpay_signature) {
            console.log('Payment verified for order:', order.orderId);

            // Update order status in database
            const updatedOrder = await Orders.findOneAndUpdate(
                { _id: order.orderId },
                { $set: { paymentStatus: 'Paid', paymentId: payment.razorpay_payment_id, orderStatus: 'Placed' } },
                { new: true }
            );

            console.log('Updated order:', updatedOrder);
            return res.json({ paymentSuccess: true, orderId: order.orderId });
        } else {
            return res.json({ paymentSuccess: false, orderId: order.orderId });
        }

    } catch (error) {
        console.error('Error verifying payment with Razorpay:', error.message);
        next(error);
    }
};

module.exports = {
    createOrderPayment,
    verifyPaymentRazorpay
};
