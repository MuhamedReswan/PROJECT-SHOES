const Products = require('../model/productsModel');
const Cart = require('../model/cartModel');
const Wishlist = require('../model/wishlistModel');
const Category = require('../model/categoryModel');

const countOfCartAndWishlist = async (req, res, next) => {
    try {
        console.log("Executing countOfCartAndWishlist middleware..."); // Debugging log

        // Retrieve the user from the session if it exists
        let user = req.session?.user ?? null;

        if (!user) {
            // If there's no user session, set res.locals.user to null and proceed
            res.locals.user = null;
            return next();
        }

        let userId = user.id;

        // Fetch the user's cart and wishlist counts
        let cart = await Cart.findOne({ user: userId });
        let wishlistCount = await Wishlist.countDocuments({ user: userId });

        // Determine the number of items in the cart
        let cartCount = cart?.products ? cart.products.length : 0;

        // Fetch the listed categories
        const categoryData = await Category.find({ isListed: true });

        // Prepare the user object with wishlist and cart counts
        user = {
            wishlistCount: wishlistCount,
            cartCount: cartCount
        };

        // Set the user and category data in res.locals for access in views
        res.locals.user = user;
        res.locals.categoryData = categoryData;

        // Proceed to the next middleware or route handler
        next();
    } catch (error) {
        console.error("Error in countOfCartAndWishlist middleware:", error);
        res.status(500).send('Internal Server Error'); // Handle any errors
    }
};

module.exports = {
    countOfCartAndWishlist
};
