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
    addresses:[{
        name:{
            type:String
        },
        state:{
            type:String
        },
        city:{
            type:String
        },
        phoneNo:{
            type:Number
        },
        pinNo:{
            type:Number
        }
    }],
    date:{
        type:Date,
        default:Date.now

    }
})


module.exports = mongoose.model("Users", userSchema)