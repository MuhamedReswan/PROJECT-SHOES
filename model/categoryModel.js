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
    },
    appliedOffer:{
        type:mongoose.Types.ObjectId,
        ref:'Offers',
        required:false
    }
})


module.exports = mongoose.model('Category',categorySchema);