const Products = require('../model/productsModel');
const Users = require('../model/userModel');
const Wishlist = require('../model/wishlistModel');

// load wishlist
const loadWishlist = (req,res)=>{
    try {
        res.render('account');
        // res.render('wishlist');
    } catch (error) {
        console.log(error);
    }
}

// add to wishlist 
const addToWishlist = async (req,res)=>{
try {
    console.log('im in add wishlist back');//--------------
    console.log('req.body',req.body);//------------
    console.log('req.session.user._id',req.session.user.id);//------------
    if(! req.session.user || ! req.session.user.id ){
        req.flash('error', 'please Login then only service');
        res.redirect('/login')
    }else{
        const userId = req.session.user.id;
        const productId = req.body.productId;
        const user = await Users.findOne({_id:userId});
console.log('user',user)//-----------
console.log('productId',productId)//-----------
console.log('userId',userId)//-----------

    }
} catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');

}
}

module.exports={
    loadWishlist,
    addToWishlist
}