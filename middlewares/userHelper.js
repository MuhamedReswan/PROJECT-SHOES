
const Products = require('../model/productsModel');
const Cart = require('../model/cartModel');
const Wishlist = require('../model/wishlistModel');
const Category = require('../model/categoryModel');


const countOfCartAndWishlist = async (req, res, next) => {
    try {
        console.log("in countOfCartAndWishlist")//-------------
        let user = req.session.user ?? null;

        if (!user) {
            res.locals.user = null
            return next();
        }

        let userId = req.session?.user?.id;

        let cart = await Cart.findOne({ user: userId })
        let wishlistCount = await Wishlist.countDocuments({ user: userId })

        let cartCount = cart?.products ? cart.products.length : 0;


        const categoryData =await Category.find({isListed:true});


        user = {
            wishlistCount: wishlistCount,
            cartCount: cartCount
        }

        res.locals.user = user;
        res.locals.categoryData =categoryData

        next();
    } catch (error) {
        console.log(error);
    }
}


module.exports = {
    countOfCartAndWishlist
}