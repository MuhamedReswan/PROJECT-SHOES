const mongoose = require('mongoose');

let walletSchema = new mongoose.Schema({
    
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    balance: {
        type: Number,
        default: 0
    },
    tansactions: [{
        amount: {
            type: Number,
            required: true
        },
        mode: {
            type: String,
            enum: ['Debit', 'Credit'],
        },
        description: {
            type: String,

        },
        date: {
            type: Date,
            default: Date.now(),
        }
    }]
}, {
    timestamps: true
})


module.exports = mongoose.model('Wallet', walletSchema);

