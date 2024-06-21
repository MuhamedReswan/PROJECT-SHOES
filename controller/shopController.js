const Products = require('../model/productsModel');
const Category = require('../model/categoryModel');
const Wishlist = require('../model/wishlistModel');


// load shop
const loadShop = async (req, res) => {
    try {
        const userId = req.session.user.id;
        // console.log('req.body', req.body)//-------------
        // console.log('req.query.page', req.query.page)//-------------
        let count = await Products.find({ isListed: true }).count();
        let limit = 8
        let page = 1
        if (req.query.page) {
            page = req.query.page;
        }
        let previous = page - 1
        let next = page + 1
        let totalPage = Math.ceil(count / limit);
        previous = previous > 1 ? page - 1 : 1
        next = next > totalPage ? totalPage : page + 1
        let start = (page - 1) * limit

        const categoryData = await Category.find({ isListed: true });
        const productData = await Products.find({ isListed: true })
            .sort({ createdAt: 1 })
            .limit(limit)
            .skip(start)
            .populate('category');
        const wishlistData = await Wishlist.find({ user: userId });
        // console.log('wishlistData', wishlistData)//----------------
        // console.log('count', count)//----------------
        // console.log('totalPage', totalPage)//----------------
        // console.log('previous', previous)//----------------
        // console.log('next', next)//----------------

        res.render('shop', {
            categoryData: categoryData,
            productData: productData,
            wishlistData: wishlistData,
            next: next,
            previous: previous,
            totalPage: totalPage,
            start: start,
            page: page
        });
    } catch (error) {
        console.log(error);
    }

}

// load single product 
const loadSingleProduct = async (req, res) => {
    try {
        const id = req.query.id;
        console.log('id', id);//----------
        const userId = req.session.user.id;
        const product = await Products.findOne({ _id: id });
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
        console.log();
    }
}



//filter shop 
const filterShop = async (req, res) => {
    try {
        console.log('imi filter-shop')//---------------
        console.log('req.body filterShop', req.body)//--------------
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
        filterTerms.price = { $gte: min, $lte: max }

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
        start=Math.abs(start)
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

            if(searchInputText){
                filterdProduct = await Products.find(filterTerms)
                .sort(sortOption)
                .populate('category');
            } else {
             filterdProduct = await Products.find(filterTerms)
            .sort(sortOption)
            .limit(limit)
            .skip(start)
            .populate('category');

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
        console.log(error)
    }
}



module.exports = {
    loadShop,
    loadSingleProduct,
    filterShop

}