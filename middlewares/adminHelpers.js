// const returnRequestCount = async (req, res, next) => {
//     try {
//         console.log("in countOfCartAndWishlist")//-------------
//         let admin = req.session.admin ?? null;

//         if (!admin) {
//             res.locals.admin = null
//             return next();
//         }

//         // let userId = req.session?.user?.id;

//         let cart = await Cart.findOne({ user: userId })
//         let wishlistCount = await Wishlist.countDocuments({ user: userId })

//         let cartCount = cart?.products ? cart.products.length : 0;

//         user = {
//             wishlistCount: wishlistCount,
//             cartCount: cartCount
//         }

//         res.locals.user = user;

//         next();
//     } catch (error) {
//         console.log(error);
//     }
// }


// module.exports = {
//     countOfCartAndWishlist
// }