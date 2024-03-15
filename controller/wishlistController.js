const Products = require('../model/productsModel');
const Users = require('../model/userModel');

// load wishlist
const loadWishlist = (req,res)=>{
    try {
        res.render('wishlist');
    } catch (error) {
        console.log(error);
    }
}


module.exports={
    loadWishlist
}