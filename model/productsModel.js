const mongoose = require('mongoose');

const ObjectId = mongoose.Schema.Types.ObjectId;
const productsSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    //     previousPrice:{
    // type:Number,
    // required:true
    //     },
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
    category: {
        type: ObjectId,
        required: true,
        ref: 'category'
    },
    brand: {
        type: String,
        required: true
    },
    isListed: {
        type: Boolean,
        dafault: true,
        required:true
    },
    stock: {
        type: Number,
        required: true,
        min: 0
    },
    images: {
        type: Array,
        required: true,
        validate: [arrayLimit, 'you can upload only 4 images']
    },
    size: {
        type:Array,
        required: true
        // type: String,
        // enum: ['S', 'M', 'L', 'XL'],
       
    }

})

function arrayLimit(val) {
    return val.length <= 4;

}

module.exports = mongoose.model('products', productsSchema);