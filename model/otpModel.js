const mongoose = require('mongoose');

const otpSchema = mongoose.Schema({

    email: {
        type: String,

    },
    otp: {
        type: String,
        require: true

    },
    createdAt: {
        type: Date,
        default: Date.now

    }
});

otpSchema.index({createdAt:1},{expireAfterSeconds:60});

module.exports = mongoose.model("OTP",otpSchema)

