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
                type:  mongoose.Schema.Types.ObjectId,
                ref: 'Products',
                requied:true
                
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

            returnReason: {
                type: String,
                enam:['Product no longer required',"Item does not match the description",'Damaged goods','Wrong product shipped']
            },
            returnComment: {
                type: String
            },
            isReturned: {
                type: Boolean,
                default: false,
            },
            status: {
                type: String,
                required: true,
                enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled', 'Returned', 'Placed', 'Return Requested', 'Return Denied'],
                default: 'Placed'
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
    orderStatus: {
        type: String,
        required: true,
        enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled', 'Returned', 'Placed'],
        default: 'Placed'
    },
    orderId: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['COD', 'Online', 'Wallet']
    },
    paymentStatus: {
        type: String,
        default: 'Pending',
        enum: ['Pending', 'Paid', 'Failed', 'Refunded']
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
    coupon: {
        type: {
            couponId: {
                type: mongoose.Schema.Types.ObjectId,
        
            },
            discount:{
                type: Number,
                default:0
            }
        },
    },
    deliveryCharge: {
        type: Number,
        default: 0
    },
    cancelDetails: {
        reason: {
            type: String,
        },
        comment: {
            type: String,
            required: false
        }
    }
})

module.exports = mongoose.model('Orders', orderSchema);
