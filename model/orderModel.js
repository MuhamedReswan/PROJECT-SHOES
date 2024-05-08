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
            price: {
                type: Number
            },
            quantity: {
                type: Number
            },
            // size: {
            //     type: Number
            // },
            description: {
                type: String
            },
            returnReason: {
                type: String
            },
            isReturned: {
                type: Boolean,
                default: false,
            },
        }
    ],
    totalAmount: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled', 'Returned'],
        default:'Pending'
    },
    orderId:{
type:String
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['COD', 'Online', 'Wallet']
    },
    deliveryAddress: {
        type: Object
    },
    paymentId: {
        type: String
    },
    couponApplied: {
        type: Number
    },
    discountedPrice:{
        type:Number
    },
    deliveryCharge: {
        type: Number,
        default: 0
    },
    cancelDetails: {
            reason: {
                type: String,
                required: true
            },
            comment: {
                type: String,
                required: false
        }
    }
})

module.exports = mongoose.model('Orders', orderSchema);