const Products = require('../model/productsModel');
const Users = require('../model/userModel');
const Wishlist = require('../model/wishlistModel');

// Show user's wishlist
const loadWishlist = async (req, res, next) => {
    try {
        const userId = req.session.user.id;
        const wishlistData = await Wishlist.find({ user: userId }).populate('product');
        
        // Display wishlist page with data
        res.render('wishlist', { wishlistData });
    } catch (error) {
        console.error('Error loading wishlist:', error.message);
        next(error);
    }
}

// Add product to wishlist
const addToWishlist = async (req, res, next) => {
    try {
        if (!req.session.user || !req.session.user.id) {
            req.flash('error', 'Please log in to use the wishlist.');
            return res.redirect('/login');
        }

        const userId = req.session.user.id;
        const productId = req.body.productId;

        // Check if the product is already in the wishlist
        const wishlistData = await Wishlist.findOne({ user: userId, product: productId });

        if (wishlistData) {
            // If exists, remove from wishlist
            await Wishlist.deleteOne({ user: userId, product: productId });
            return res.status(200).json({ removed: true });
        } else {
            // If not, add to wishlist
            const wishlistProduct = new Wishlist({
                user: userId,
                product: productId
            });
            await wishlistProduct.save();
            return res.status(200).json({ added: true });
        }
    } catch (error) {
        console.error('Error adding to wishlist:', error.message);
        next(error);
    }
}

// Remove product from wishlist
const removeFromWishlist = async (req, res, next) => {
    try {
        const { productId } = req.body;
        const userId = req.session.user.id;

        // Delete product from wishlist
        await Wishlist.deleteOne({ user: userId, product: productId });
        return res.status(200).json({ removed: true });
    } catch (error) {
        console.error('Error removing from wishlist:', error.message);
        next(error);
    }
}

module.exports = {
    loadWishlist,      // Show user's wishlist
    addToWishlist,     // Add product to wishlist
    removeFromWishlist // Remove product from wishlist
}
