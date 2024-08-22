const mongoose = require('mongoose');

const cartSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Users'
    },
    couponApplied: {
        type:Boolean,
        default:false
    },
    cartTotalAmount: {
        type: Number,
        default:0
    },

    coupon: {
        type: {
            code: {
                type: String,
                required: true
            },
            couponId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Coupon',
                required: true
            }
            ,
            couponDiscount: {
                type: Number,
                required: true,
                default:0

            }
        }},
        couponDiscoundProduct:{
            type: Number,
            default:0
        },
    couponDiscountAmount:{
        type:Number,
        default:0
    },
    products: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Products'
        },
        quantity: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true,
        },
        offerPrice:{
            type:Number,
            required:true
        },
        createdAt:{
            type:Date,
            default:Date.now()
        }  

    }]
})

module.exports = mongoose.model('Cart', cartSchema);