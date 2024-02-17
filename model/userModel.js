const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    isBlocked: {
        type: Boolean,
        default:false
    },

    verified: {
        type: Boolean
    },

    isAdmin: {
        type: Boolean
    },
    date:{
        type:Date,
        default:Date.now

    }
})


module.exports = mongoose.model("Users", userSchema)