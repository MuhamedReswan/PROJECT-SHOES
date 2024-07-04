const mongoose = require('mongoose');

const offerSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,

    },
     endDate: {
        type: Date,
        required: true,

    }, discount: {
        type: Number,
        required: true,

    }, isListed: {
        type: Boolean,
        default: true

    },appliedCategory: {
        type: Array,
    },
    productId:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product'
    }],

},
{
    timestamps: true
}
);

const Offers = mongoose.model('Offer', offerSchema);

module.exports = Offers;