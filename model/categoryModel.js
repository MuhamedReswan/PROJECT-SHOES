const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    description:{
type:String,
required:true
    },
    isListed:{
        type:Boolean,
        required:true,
        default:true
    }
})


module.exports = mongoose.model('Category',categorySchema);