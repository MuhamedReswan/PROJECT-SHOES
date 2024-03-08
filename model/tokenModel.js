const mongoose = require('mongoose');
let objectId = mongoose.Schema.Types.ObjectId
const tokenSchema = mongoose.Schema({
    token: {
        type: String,
        required: true
    },
    userId: {
        type: objectId,
        ref: 'user',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }


})
tokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 120 })
module.exports = mongoose.model('Token', tokenSchema)