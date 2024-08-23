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

//filter shop 
const filterShop = async (req, res, next) => {
    try {
        console.log('imi filter-shop')//---------------
        const { selectedCategory, sortBy, priceRange, currentPage, buttonStatus, searchInputText } = req.body
        let filterTerms = { isListed: true }
        if (selectedCategory && selectedCategory.length > 0) {
            filterTerms.category = { $in: selectedCategory }
        }
        if (searchInputText) {
            filterTerms.name = { $regex: searchInputText, $options: 'i' }
        }

        let price = priceRange.split('-');
        let min = parseInt(price[0].substring(1).trim());
        let max = parseInt(price[1].substring(1).replace('₹', ""));
        filterTerms.offerPrice = { $gte: min, $lte: max }

        let sortOption = {}
        if (sortBy === 'all') {
            sortOption = { createdAt: 1 }
        } else if (sortBy === 'a-z') {
            sortOption = { name: 1 }
        } else if (sortBy === 'z-a') {
            sortOption = { name: -1 }
        } else if (sortBy === 'low-high') {
            sortOption = { price: 1 }
        } else if (sortBy === 'high-low') {
            sortOption = { price: -1 }
        }

        const count = await Products.find(filterTerms).count()

        let limit = 8
        let page = 1
        if (currentPage > 1) {
            page = currentPage;
        }

        let totalPage = Math.ceil(count / limit);

        if (buttonStatus !== undefined && buttonStatus === 'previous') {
            page = page - 1 > 1 ? page - 1 : 1
        }

        if (buttonStatus !== undefined && buttonStatus === 'next') {
            page = page + 1 > totalPage ? totalPage : page + 1
        }

        let start = (page - 1) * limit
        start = Math.abs(start)
        let filterdProduct;

        if (searchInputText) {
            filterdProduct = await Products.find(filterTerms)
                .sort(sortOption)
                .populate('category');
        } else {
            filterdProduct = await Products.find(filterTerms)
                .sort(sortOption)
                .limit(limit)
                .skip(start)
                .populate('appliedOffer').populate({ path: 'category', populate: { path: 'appliedOffer', model: 'Offers' } })
        }

        let countOfProducts = filterdProduct.length;

        res.status(200)
            .json({
                filterdProduct,
                countOfProducts,
                totalPage,
                page
            })
    } catch (error) {
        console.log(error.message);
        next(error);
    }
}


module.exports = {
    loadShop,
    loadSingleProduct,
    filterShop
};
