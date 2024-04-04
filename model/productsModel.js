const mongoose = require('mongoose');

const ObjectId = mongoose.Schema.Types.ObjectId;
const productsSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0

    },
    offerPrice: {
        type: Number,
        required: false,
        min: 0
    },
    discountedPrice:{
        type: Number,
    },
    category: {
        type: ObjectId,
        required: true,
        ref: 'Category'
    },
    brand: {
        type: String,
        required: true
    },
    isListed: {
        type: Boolean,
        default: true,
        required: true
    },

    images: {
        type: Array,
        required: true,
        validate: [arrayLimit, 'you can upload only 4 images']
    },

    totalStock:{
type:Number
    },

    // stock: {
    //     type: Object,
    //     required: true,
    // },

    // size:{
    //     type:Array,
    //     required:true
    // },

    created: {
        type: Date,
        default: Date.now  
    },
})

function arrayLimit(val) {
    return val.length <= 4;

}

module.exports = mongoose.model('Products', productsSchema);