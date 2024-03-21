const mongoose = require('mongoose');
const Products = require('./productsModel');
const objectId = mongoose.Schema.Types.ObjectId;

const orderSchema = mongoose.Schema({
    user: {
        type: objectId,
        ref: 'Users',
        required: true
    },
    products: [
        {
            productId: {
                type: objectId,
                ref: 'Products',
                required: true
            },
            name: {
                type: String
            },
            price: {
                type: Number
            },
            quantity: {
                type: Number
            },
            size: {
                type: Number
            },
            dascription: {
                type: String
            },
            status: {
                type: String,
                enum: ['placed', 'outForDelivery', 'returnRequested', 'returned', 'returnDenied', 'shipped', 'delivered', 'cancelled'],
                default: 'placed'
            },
            returnReason: {
                type: String
            }
        }
    ],
    totalAmount: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true
    },
    deliveryAddress: {
        type: String
    },
    paymentId: {
        type: String
    },
    couponApplied: {
        type: Number
    }
})

module.exports = mongoose.model('Orders', orderSchema);