const Products = require('../model/productsModel');
const Category = require('../model/categoryModel');
const Wishlist = require('../model/wishlistModel');
const Offers = require('../model/offerModel');

// Load Shop Page
const loadShop = async (req, res, next) => {
    try {
        const userId = req.session.user.id;
        const queryFilter = req.query.category;
        
        let filterConditions = { isListed: true };

        // Apply category filter if specified
        if (queryFilter) {
            const category = await Category.findOne({ name: queryFilter, isListed: true });

            if (category) {
                filterConditions.category = category._id;
            } else {
                // If no valid category found, ensure no products are returned
                filterConditions.category = null;
            }
        }

        // Count total products matching the filter
        const count = await Products.countDocuments(filterConditions);

        const limit = 8;
        const page = parseInt(req.query.page) || 1;
        const start = (page - 1) * limit;
        const totalPage = Math.ceil(count / limit);

        // Fetch filtered products with pagination
        const products = await Products.find(filterConditions)
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(start)
            .populate('appliedOffer')
            .populate({ path: 'category', populate: { path: 'appliedOffer', model: 'Offers' } });

        const categoryData = await Category.find({ isListed: true });
        const offers = await Offers.find({ isListed: true });
        const wishlistData = await Wishlist.find({ user: userId });

        // Render shop page with fetched data
        res.render('shop', {
            categoryData,
            productData: products,
            wishlistData,
            next: page + 1 > totalPage ? totalPage : page + 1,
            previous: page - 1 < 1 ? 1 : page - 1,
            totalPage,
            start,
            page,
            offers,
            queryFilter
        });
    } catch (error) {
        console.error('Error in loadShop:', error.message);
        next(error);
    }
};

// Load Single Product Page
const loadSingleProduct = async (req, res, next) => {
    try {
        const productId = req.query.id;
        const userId = req.session.user.id;

        // Fetch single product by ID with related offers and categories
        const product = await Products.findById(productId)
            .populate('appliedOffer')
            .populate({ path: 'category', populate: { path: 'appliedOffer', model: 'Offers' } });

        // Set delivery dates
        const startDate = new Date();
        const deliveryDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days later
        const formattedStartDate = startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit' }).replaceAll(',', "-");
        const formattedDeliveryDate = deliveryDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit' }).replaceAll(',', "-");

        const wishlistData = await Wishlist.findOne({ user: userId, product: productId });

        // Render single product page
        if (product) {
            res.render('singleProduct', { product, deliveryDate: formattedDeliveryDate, startDate: formattedStartDate, wishlistData });
        } else {
            console.error('Product not found');
        }
    } catch (error) {
        console.error('Error in loadSingleProduct:', error.message);
        next(error);
    }
};

// Filter Shop Products
const filterShop = async (req, res, next) => {
    try {
        const { selectedCategory, sortBy, priceRange, currentPage, buttonStatus, searchInputText } = req.body;

        let filterConditions = { isListed: true };

        // Apply category filter if selected
        if (selectedCategory && selectedCategory.length > 0) {
            filterConditions.category = { $in: selectedCategory };
        }

        // Apply search filter if input text is provided
        if (searchInputText) {
            filterConditions.name = { $regex: searchInputText, $options: 'i' };
        }

        // Apply price range filter
        let [minPrice, maxPrice] = priceRange.split('-').map(price => parseInt(price.substring(1).trim()));
        filterConditions.offerPrice = { $gte: minPrice, $lte: maxPrice };

        // Define sorting options based on the user's choice
        let sortOption = {};
        switch (sortBy) {
            case 'a-z':
                sortOption.name = 1;
                break;
            case 'z-a':
                sortOption.name = -1;
                break;
            case 'low-high':
                sortOption.price = 1;
                break;
            case 'high-low':
                sortOption.price = -1;
                break;
            default:
                sortOption.createdAt = 1;
        }

        // Count total filtered products
        const count = await Products.find(filterConditions).countDocuments();

        const limit = 8;
        let page = currentPage || 1;

        // Adjust page for next or previous button
        if (buttonStatus === 'previous') {
            page = Math.max(1, page - 1);
        } else if (buttonStatus === 'next') {
            page = Math.min(page + 1, Math.ceil(count / limit));
        }

        const start = (page - 1) * limit;

        // Fetch filtered products with pagination
        const filteredProducts = await Products.find(filterConditions)
            .sort(sortOption)
            .limit(limit)
            .skip(start)
            .populate('appliedOffer')
            .populate({ path: 'category', populate: { path: 'appliedOffer', model: 'Offers' } });

        const countOfProducts = filteredProducts.length;

        // Respond with filtered products and pagination info
        res.status(200).json({
            filteredProducts,
            countOfProducts,
            totalPage: Math.ceil(count / limit),
            page
        });
    } catch (error) {
        console.error('Error in filterShop:', error.message);
        next(error);
    }
};

module.exports = {
    loadShop,
    loadSingleProduct,
    filterShop
};
