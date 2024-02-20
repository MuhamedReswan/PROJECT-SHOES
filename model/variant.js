const mongoose= require('mongoose');

 const variantSchema= mongoose.Schema({
    size:{
        type:Number,
        required:true
    },
    stock:{
        type:Number,
        required:true
    }
})

module.exports = mongoose.model('variant',variantSchema)