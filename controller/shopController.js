const Products = require('../model/productsModel');
const Category = require('../model/categoryModel');
const Wishlist = require('../model/wishlistModel');
const { populate } = require('dotenv');
const Offers = require('../model/offerModel');


// load shop
const loadShop = async (req, res, next) => {
    try {
        const userId = req.session.user.id;
        const queryFilter = req.query.category;
        
        let filterConditions = { isListed: true };

        if (queryFilter) {
            // Find the category by name
            const category = await Category.findOne({ name: queryFilter, isListed: true });

            if (category) {
                // If the category is found, filter products by this category's ID
                filterConditions.category = category._id;
            } else {
                // If no such category is found, return no products
                filterConditions.category = null; // Ensures no products are returned
            }
        }

        // Get the count of products that match the filter conditions
        let count = await Products.countDocuments(filterConditions);

        let limit = 8;
        let page = parseInt(req.query.page) || 1;
        let start = (page - 1) * limit;
        let totalPage = Math.ceil(count / limit);

        // Fetch the products that match the filter conditions
        let products = await Products.find(filterConditions)
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(start)
            .populate('appliedOffer')
            .populate({ path: 'category', populate: { path: 'appliedOffer', model: 'Offers' } });

        const categoryData = await Category.find({ isListed: true });
        const offers = await Offers.find({ isListed: true });
        const wishlistData = await Wishlist.find({ user: userId });

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
        console.log(error.message);
        next(error);
    }
};


// load single product 
const loadSingleProduct = async (req, res,next) => {
    try {
        const id = req.query.id;
        // console.log('id', id);//----------
        const userId = req.session.user.id;
        const product = await Products.findOne({ _id: id }).populate('appliedOffer').populate({ path: 'category', populate: { path: 'appliedOffer', model: 'Offers' } });
        const sDate = new Date();
        const dDate = new Date(sDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        const startDate = sDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit' }).replaceAll(',', "-");
        const deliveryDate = dDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit' }).replaceAll(',', "-");
        const wishlistData = await Wishlist.findOne({ user: userId, product: id });
        if (product) {
            res.render('singleProduct', { product, deliveryDate, startDate, wishlistData });
        } else {
            console.log('no prodcut getting')//----------------------
        }

    } catch (error) {
        console.log(error.message);
        next(error);   
     }
}



//filter shop 
const filterShop = async (req, res,next) => {
    try {
        console.log('imi filter-shop')//---------------
        // console.log('req.body filterShop', req.body)//--------------
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
        // let previous = page - 1
        // let next = page + 1
        let totalPage = Math.ceil(count / limit);
        // previous = previous > 1 ? page - 1 : 1
        // next = next > totalPage ? totalPage : page + 1

        if (buttonStatus !== undefined && buttonStatus === 'previous') {
            page = page - 1 > 1 ? page - 1 : 1
            // console.log('previous if')//------------
        }

        if (buttonStatus !== undefined && buttonStatus === 'next') {
            page = page + 1 > totalPage ? totalPage : page + 1
            // console.log('next if')//-------------
        }

        let start = (page - 1) * limit
        // console.log('start1', start)//-------------
        start = Math.abs(start)
        // console.log('start2', start)//-------------


        // console.log('price', price)//-------------
        // console.log('min', min)//-------------
        // console.log('max', max)//-------------
        // console.log('currentPage', currentPage)//-------------
        // console.log('filter', filterTerms)//-------------
        // console.log('count', count)//-------------
        // console.log('start', start)//-------------
        // console.log('buttonStatus', buttonStatus)//-------------



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
                // .populate('category')
                .populate('appliedOffer').populate({ path: 'category', populate: { path: 'appliedOffer', model: 'Offers' } })

        }

        let countOfProducts = filterdProduct.length;

        // console.log('filterdProductax', filterdProduct)//-------------
        // console.log('countOfProducts', countOfProducts)//-------------

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

}