const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  isListed: {
    type: Boolean,
    default: true,
  },
  expireDate:{
    type:Date,
    required:false
  }
},
{timestamps:true});

module.exports = mongoose.model("Banner", bannerSchema);