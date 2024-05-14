const mongoose = require('mongoose');
const Products = require('./productsModel');
const objectId = mongoose.Schema.Types.ObjectId;


const returnSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    returnOrderId: {
type:Number,
        required: true
    },
    returnOrderItem: {
        type: String,
        requied: true
    },
    returnProductId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Products',
        required:false
    },
    returnReason: {
        type: String,
        requied: true
    },
    returnComment: {
        type: String,
        requied: false
    }
})


module.exports = mongoose.model('Returns',retrunSchema)