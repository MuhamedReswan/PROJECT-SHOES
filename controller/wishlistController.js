const Products = require('../model/productsModel');
const Users = require('../model/userModel');
const Wishlist = require('../model/wishlistModel');

// load wishlist
const loadWishlist = async (req,res,next)=>{
    try {
        console.log('loadwishilist');//-------------
        const userId = req.session.user.id;       
         console.log('userId',userId);//-------------
        // res.render('addAddress');
        // res.render('invoice');
        // res.render('invoiceNew');
const wishlistData = await Wishlist.find({user:userId}).populate('product');
console.log('wishlistData.......',wishlistData);//-----------------------
        res.render('wishlist',{wishlistData});
    } catch (error) {
        console.log(error.message);
        next(error); 
    }
}

// add to wishlist 
const addToWishlist = async (req,res,next)=>{
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
console.log('productId',productId)//-----------
console.log('userId',userId)//-----------

const wishlistData = await Wishlist.findOne({user:userId,product:productId});

if(wishlistData){
    console.log('exist wishlit')//--------------
await Wishlist.deleteOne({user:userId,product:productId});
res.status(200).json({removed: true}); 

}else{
    console.log('not wishlit ')//--------------

    const wishlistProduct =new Wishlist({
        user:userId,
        product:productId
    })
    await wishlistProduct.save();
    console.log('wishlistProduct',wishlistProduct)///-------------------
    res.status(200).json({added:true});
}
    }
} catch (error) {
    console.log(error.message);
        next(error); 
}
}

// remove from wishlist
const removeFromWishlist = async (req,res,next)=>{
    try {
        const {productId}=req.body;
        const userId = req.session.user.id;

        await Wishlist.deleteOne({user:userId,product:productId})
        res.status(200).json({removed:true})
    } catch (error) {
        console.log(error.message);
        next(error); 
    }
}

module.exports={
    loadWishlist,
    addToWishlist,
    removeFromWishlist
}