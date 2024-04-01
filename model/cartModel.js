const mongoose = require('mongoose');

const cartSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Users'
    },
    products: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'products'
        },
        quantity: {
            type: Number,
            required: true
        },
        // size: {
        //     type: Number,
        //     required: true
        // },
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

module.exports = mongoose.model('cart', cartSchema);