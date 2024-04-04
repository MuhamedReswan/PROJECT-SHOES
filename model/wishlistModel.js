const mongoose = require('mongoose');
const objectId = mongoose.Schema.Types.ObjectId;

const wishlistSchema = mongoose.Schema({
    user: {
        type: objectId,
        required: true,
        ref: 'Users'
    },
    products:[{
        product: {
            type: objectId,
            required: true,
            ref: 'Products'
        }
    }]
   
})

module.exports = mongoose.model('Wishlist', wishlistSchema);