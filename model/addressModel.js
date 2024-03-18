const mongoose = require('mongoose');

const objectId = mongoose.Schema.Types.ObjectId;

const addressSchema = mongoose.Schema({
    user: {
        type: objectId,
        required: true,
        ref: 'Users'
    },
    addresses: [{
        name: {
            type: String,
            required: true
        },
        mobile: {
            type: Number,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        distric: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
         pincode: {
            type: Number,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        }
    }]
},{timestamps:true})