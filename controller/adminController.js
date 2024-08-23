require('dotenv').config();
const Users = require('../model/userModel');
const Products = require('../model/productsModel');
const Offers = require('../model/offerModel');
const Orders = require('../model/orderModel');
const Category = require('../model/categoryModel');


// Load dashboard
const loadDashboard = async (req, res, next) => {
    try {
        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
        const startOfThisYear = new Date(currentDate.getFullYear(), 0, 1);

        // Order Status Counts
        const orders = await Orders.find({});
        let orderProductStatus = {
            delivered: 0,
            cancelled: 0,
            placed: 0,
            returned: 0,
            returnRequested: 0,
            pending: 0
        };

        orders.forEach(order => {
            order.products.forEach(product => {
                switch (product.status) {
                    case 'Delivered':
                        orderProductStatus.delivered++;
                        break;
                    case 'Placed':
                        orderProductStatus.placed++;
                        break;
                    case 'Cancelled':
                        orderProductStatus.cancelled++;
                        break;
                    case 'Returned':
                        orderProductStatus.returned++;
                        break;
                    case 'Return Requested':
                        orderProductStatus.returnRequested++;
                        break;
                    case 'Pending':
                        orderProductStatus.pending++;
                        break;
                }
            });
        });

        // Monthly Users Count
        const monthlyUsers = new Array(12).fill(0);
        const users = await Users.aggregate([
            { $match: { date: { $gte: startOfThisYear } } },
            { $group: { _id: { $month: "$date" }, totalUsers: { $sum: 1 } } }
        ]);

        users.forEach(user => {
            monthlyUsers[user._id - 1] = user.totalUsers;
        });

        // Total Revenue
        const [total] = await Orders.aggregate([
            { $match: { orderStatus: "Delivered" } },
            { $unwind: '$products' },
            { $match: { 'products.status': { $ne: "Returned" } } },
            {
                $project: {
                    Revenue: {
                        $subtract: [
                            { $multiply: ['$products.offerPrice', '$products.quantity'] },
                            '$coupon.couponDiscountOnProduct'
                        ]
                    }
                }
            },
            { $group: { _id: null, totalRevenue: { $sum: '$Revenue' } } }
        ]);

        const totalRevenue = total?.totalRevenue || 0;

        // Monthly Revenue
        const [monthly] = await Orders.aggregate([
            { $match: { orderStatus: "Delivered", date: { $gte: startOfMonth, $lt: endOfMonth } } },
            { $unwind: '$products' },
            { $match: { 'products.status': "Delivered" } },
            {
                $project: {
                    productTotal: {
                        $subtract: [
                            { $multiply: ['$products.offerPrice', '$products.quantity'] },
                            '$coupon.couponDiscountOnProduct'
                        ]
                    }
                }
            },
            { $group: { _id: null, monthlyTotalAmount: { $sum: '$productTotal' } } }
        ]);

        const monthlyRevenue = monthly?.monthlyTotalAmount || 0;

        // Counts
        const orderCount = await Orders.countDocuments({});
        const productCount = await Products.countDocuments({});
        const categoryCount = await Category.countDocuments({});
        const usersCount = await Users.countDocuments({ verified: true });

        // Monthly Sales Data
        const defaultMonthly = Array.from({ length: 12 }, (_, i) => ({
            month: i + 1,
            total: 0,
            count: 0
        }));

        const monthlySalesData = await Orders.aggregate([
            { $match: { orderStatus: 'Delivered' } },
            { $unwind: '$products' },
            { $match: { 'products.status': { $ne: 'Returned' } } },
            {
                $project: {
                    monthTotal: {
                        $subtract: [
                            { $multiply: ['$products.offerPrice', '$products.quantity'] },
                            '$coupon.couponDiscountOnProduct'
                        ]
                    },
                    date: 1
                }
            },
            {
                $group: {
                    _id: { $month: '$date' },
                    total: { $sum: "$monthTotal" },
                    count: { $sum: 1 }
                }
            },
            { $project: { _id: 0, month: '$_id', total: '$total', count: '$count' } }
        ]);

        const updatedMonthlyDetails = defaultMonthly.map(defaultMonth => {
            return monthlySalesData.find(monthData => monthData.month === defaultMonth.month) || defaultMonth;
        });

        // Revenue and Users per Day
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const startOfFilter = new Date(year, month - 1, 1);
        const endOfFilter = new Date(year, month, 0);
        const daysInMonth = endOfFilter.getDate();
        const currentSelectedMonth = `${year}-${month.toString().padStart(2, '0')}`;
        const daysArr = Array.from({ length: daysInMonth }, (_, i) => i + 1);

        let revenuePerDay = new Array(daysInMonth).fill(0);
        let usersPerDay = new Array(daysInMonth).fill(0);

        const revenueByDay = await Orders.aggregate([
            { $match: { orderStatus: "Delivered", date: { $gte: startOfFilter, $lte: endOfFilter } } },
            { $unwind: '$products' },
            { $match: { 'products.status': "Delivered" } },
            {
                $project: {
                    date: 1,
                    totalAmount: {
                        $subtract: [
                            { $multiply: ['$products.quantity', '$products.offerPrice'] },
                            '$coupon.couponDiscountOnProduct'
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: { $dayOfMonth: '$date' },
                    totalRevenue: { $sum: '$totalAmount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        const dailyUsers = await Users.aggregate([
            { $match: { date: { $gte: startOfFilter, $lte: endOfFilter } } },
            {
                $group: {
                    _id: { $dayOfMonth: "$date" },
                    totalUsers: { $sum: 1 }
                }
            }
        ]);

        revenueByDay.forEach(item => {
            revenuePerDay[item._id - 1] = item.totalRevenue;
        });

        dailyUsers.forEach(item => {
            usersPerDay[item._id - 1] = item.totalUsers;
        });

        // Top Selling Products
        const topFiveSellingProduct = await Orders.aggregate([
            { $match: { orderStatus: "Delivered" } },
            { $unwind: '$products' },
            { $match: { 'products.status': "Delivered" } },
            {
                $lookup: {
                    from: 'products',
                    localField: "products.productId",
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            { $unwind: '$productDetails' },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'productDetails.category',
                    foreignField: '_id',
                    as: 'categoryDetails'
                }
            },
            { $unwind: '$categoryDetails' },
            {
                $group: {
                    _id: '$productDetails._id',
                    productName: { $first: '$productDetails.name' },
                    brand: { $first: '$productDetails.brand' },
                    category: { $first: '$categoryDetails.name' },
                    image: { $first: { '$arrayElemAt': ['$productDetails.images', 0] } },
                    soldCount: { $sum: 1 }
                }
            },
            { $sort: { soldCount: -1 } },
            { $limit: 5 }
        ]);

        // Render dashboard
        res.render('dashboard', {
            totalRevenue,
            orderCount,
            productCount,
            categoryCount,
            currentDate,
            startOfMonth,
            endOfMonth,
            monthlyRevenue,
            usersCount,
            updatedMonthlyDetails,
            monthlyUsers,
            usersPerDay,
            revenuePerDay,
            daysArr,
            currentSelectedMonth,
            topFiveSellingProduct,
            orderProductStatus
        });

    } catch (error) {
        console.error("Dashboard error:", error.message);
        next(error);
    }
};

// Chart Filter
const filterYearlyMonthly = async (req, res, next) => {
    try {
        console.log("Within filter chart");

        // Extract and parse the monthYear from the request body
        const { monthYear } = req.body;
        const [year, month] = monthYear.split("-").map(Number);
        const startOfFilter = new Date(year, month - 1, 1);
        const endOfFilter = new Date(year, month, 0);
        const daysInMonth = endOfFilter.getDate();
        const daysArr = Array.from({ length: daysInMonth }, (_, i) => i + 1);

        // Initialize arrays to hold revenue and user data per day
        const revenuePerDay = new Array(daysInMonth).fill(0);
        const usersPerDay = new Array(daysInMonth).fill(0);

        // Aggregation pipeline to get revenue per day
        const revenuebyDay = await Orders.aggregate([
            { $match: { orderStatus: "Delivered", date: { $gte: startOfFilter, $lte: endOfFilter } } },
            { $unwind: '$products' },
            { $match: { 'products.status': "Delivered" } },
            {
                $project: {
                    date: 1,
                    totalAmount: {
                        $subtract: [
                            { $multiply: ['$products.quantity', '$products.offerPrice'] },
                            '$coupon.couponDiscountOnProduct'
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: { $dayOfMonth: '$date' },
                    totalRevenue: { $sum: '$totalAmount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Aggregation pipeline to get users per day
        const user = await Users.aggregate([
            { $match: { date: { $gte: startOfFilter, $lte: endOfFilter } } },
            {
                $group: {
                    _id: { $dayOfMonth: "$date" },
                    totalUsers: { $sum: 1 }
                }
            }
        ]);

        // Populate revenuePerDay and usersPerDay arrays based on aggregation results
        revenuebyDay.forEach(item => revenuePerDay[item._id - 1] = item.totalRevenue);
        user.forEach(item => usersPerDay[item._id - 1] = item.totalUsers);

        console.log("Revenue by Day:", revenuebyDay);
        console.log("Users:", user);
        console.log("Users Per Day:", usersPerDay);
        console.log("Revenue Per Day:", revenuePerDay);

        // Send response with filtered data
        res.json({ filter: true, revenuePerDay, usersPerDay, daysArr });

    } catch (error) {
        console.log(error.message);
        next(error);
    }
};

// Admin Login
const adminLoginLoad = (req, res, next) => {
    try {
        // Render the admin login page
        res.render('admin-login');
    } catch (error) {
        console.log(error.message);
        next(error);
    }
};

const verifyAdminLogin = (req, res, next) => {
    try {
        // Get credentials from environment variables and request body
        const { EMAIL: envEmail, PASSWORD: envPassword } = process.env;
        const { Email: email, Password: password } = req.body;

        // Check if the provided email and password match the environment variables
        if (envEmail === email) {
            if (envPassword === password) {
                req.session.admin = { email, password };
                console.log('Session from admin control:', req.session.admin);
                res.redirect('/admin');
            } else {
                req.flash('passwordError', 'Incorrect Password');
                res.redirect('/admin/login');
            }
        } else {
            req.flash('emailError', 'Invalid Email');
            res.redirect('/admin/login');
        }
    } catch (error) {
        console.log(error.message);
        next(error);
    }
};

const loadLogout = (req, res, next) => {
    try {
        console.log('In logout admin');
        console.log('Admin session before:', req.session.admin);
        req.session.admin = null;
        console.log('Admin session after:', req.session.admin);

        // Redirect to the admin dashboard
        res.redirect('/admin');
    } catch (error) {
        console.log(error.message);
        next(error);
    }
};

// Load Customers
const customersLoad = async (req, res, next) => {
    try {
        // Pagination logic
        let page = parseInt(req.query.id) || 1;
        const limit = 6;
        const start = (page - 1) * limit;
        const count = await Users.countDocuments();

        const totalPage = Math.ceil(count / limit);
        const next = Math.min(page + 1, totalPage);
        const previous = Math.max(page - 1, 1);

        // Fetch user data with pagination
        const userData = await Users.find({})
            .limit(limit)
            .sort({ date: -1 })
            .skip(start)
            .exec();

        res.render("userManagement", {
            users: userData,
            page,
            previous,
            next,
            totalPage,
            start
        });
    } catch (error) {
        console.log(error.message);
        next(error);
    }
};

// Block User
const blockUser = async (req, res, next) => {
    try {
        const { id } = req.body;

        if (id) {
            const user = await Users.findById(id);

            if (user) {
                // Toggle block status
                const updatedStatus = !user.isBlocked;
                await Users.updateOne({ _id: id }, { $set: { isBlocked: updatedStatus } });
                console.log(`User ${updatedStatus ? 'blocked' : 'unblocked'}`);
                res.json({ block: true });
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        } else {
            res.status(404).json({ error: 'ID not provided' });
        }
    } catch (error) {
        console.log(error.message);
        next(error);
    }
};

// Load Offers
const loadOffers = async (req, res, next) => {
    try {
        // Pagination logic
        const page = parseInt(req.query.page) || 1;
        const limit = 8;
        const count = await Offers.countDocuments();

        const totalPage = Math.ceil(count / limit);
        const next = Math.min(page + 1, totalPage);
        const previous = Math.max(page - 1, 1);

        // Fetch offers with pagination
        const offers = await Offers.find({})
            .limit(limit)
            .sort({ createdAt: -1 })
            .exec();

        res.render('offers', {
            offers,
            totalPage,
            previous,
            next,
            page
        });
    } catch (error) {
        console.log(error.message);
        next(error);
    }
};

// Add Offer
const addOffer = (req, res, next) => {
    try {
        // Render the add offer page
        res.render('addOffer');
    } catch (error) {
        console.log(error.message);
        next(error);
    }
};

// Insert Offer
const insertOffer = async (req, res, next) => {
    try {
        console.log('Within insert offer');

        let { name, endDate, discount, isListed } = req.body;
        name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
        console.log("Name:", name);

        // Check if the offer name already exists
        const existingOffer = await Offers.findOne({ name });

        if (existingOffer) {
            res.json({ already: "This name already exists!" });
        } else {
            // Create and save the new offer
            const offer = new Offers({ name, discount, endDate, isListed });
            await offer.save();
            console.log("Offer saved");
            res.status(200).json({ success: true });
        }
    } catch (error) {
        console.log(error.message);
        next(error);
    }
};

// Edit Offer
const editOffer = async (req, res, next) => {
    try {
        const { id: offerId } = req.query;
        console.log("Offer ID:", offerId);

        // Fetch offer details by ID
        const offerDetails = await Offers.findById(offerId);

        if (offerDetails) {
            console.log("Offer details found");
            res.render('editOffer', { offerDetails });
        } else {
            throw new Error("Offer not found");
        }
    } catch (error) {
        console.log(error.message);
        next(error);
    }
};




//update offer
const updateOffer = async (req, res, next) => {
    try {
        console.log("within update offer");
        let { name, endDate, discount, offerId } = req.body;
        name = name.toLowerCase();
        name = name.charAt(0).toUpperCase() + name.slice(1);

        const nameAlready = await Offers.findOne({ name: name, _id: { $ne: offerId } });

        if (nameAlready) {
            res.json({ already: "This name already exists !" });
        } else {
            const updatedOffer = await Offers.findByIdAndUpdate(
                { _id: offerId },
                { $set: { name: name, endDate: endDate, discount: discount } },
                { new: true }
            );

            console.log("updatedOffer", updatedOffer);
            res.status(200).json({ success: true });
        }
    } catch (error) {
        console.log(error.message);
        next(error);
    }
}

function parseBoolean(value) {
    return Boolean(value === 'true');
}

// change offer status
const changeOfferStatus = async (req, res, next) => {
    try {
        console.log("changeOfferStatus invoked");
        const { offerId, status } = req.body;

        // Convert status to boolean
        const currentStatus = parseBoolean(status);
        const toStatus = !currentStatus;

        const updatedOffer = await Offers.findByIdAndUpdate(
            { _id: offerId },
            { $set: { isListed: toStatus } },
            { new: true }
        );

        if (updatedOffer) {
            res.json({ statusChanged: true });
        } else {
            res.json({ message: "Offer not found", statusChanged: false });
        }
    } catch (error) {
        console.log(error.message);
        next(error);
    }
}

// apply offer on product
const applyProductOffer = async (req, res, next) => {
    try {
        const { productId, offerId } = req.body;

        const addOfferProduct = await Products.findByIdAndUpdate(
            { _id: productId },
            { $set: { appliedOffer: offerId } },
            { new: true }
        );

        const updateAppliedProduct = await Offers.findByIdAndUpdate(
            { _id: offerId },
            { $addToSet: { productId: productId } },
            { new: true }
        );

        if (addOfferProduct && updateAppliedProduct) {
            res.status(200).json({ success: true, message: "Offer added successfully!" });
        } else {
            res.status(400).json({ success: false, message: "Failed to update offer!" });
        }
    } catch (error) {
        console.log(error.message);
        next(error);
    }
}

// remove product offer

const removeProductOffer = async (req, res, next) => {
    try {
        const { productId, offerId } = req.body;

        const removeProductOffer = await Products.findByIdAndUpdate(
            { _id: productId },
            { $unset: { appliedOffer: "" } },
            { new: true }
        );

        const updatedOffer = await Offers.findByIdAndUpdate(
            { _id: offerId },
            { $pull: { productId: productId } },
            { new: true }
        );

        if (removeProductOffer && updatedOffer) {
            res.status(200).json({ removed: true, message: "Product offer successfully removed" });
        } else {
            res.status(404).json({ removed: false, message: "Failed to update offer or product" });
        }
    } catch (error) {
        console.log(error.message);
        next(error);
    }
}

// load category, product offers
const loadOfferForApply = async (req, res, next) => {
    try {
        let categoryId = req.query.category || null;
        let productId = req.query.product || null;

        const currentdate = Date.now();

        const totalOffer = await Offers.find({ isListed: true, endDate: { $gte: currentdate } });
        let page = parseInt(req.query.page) || 1;
        let limit = 8;
        let next = page + 1;
        let previous = page > 1 ? page - 1 : 1;
        let count = totalOffer.length;

        let totalPage = Math.ceil(count / limit);
        if (next > totalPage) {
            next = totalPage;
        }

        const offers = await Offers.find({ isListed: true, endDate: { $gte: currentdate } })
            .limit(limit)
            .sort({ createdAt: -1 });

        res.status(200).render('applyOffers', {
            offers,
            categoryId,
            productId,
            totalPage,
            previous,
            next,
            page
        });
    } catch (error) {
        console.log(error.message);
        next(error);
    }
}

// apply offer on category
const applyCategoryOffer = async (req, res, next) => {
    try {
        const { categoryId, offerId } = req.body;

        const addOfferCategory = await Category.findByIdAndUpdate(
            { _id: categoryId },
            { $set: { appliedOffer: offerId } },
            { new: true }
        );

        const updateAppliedCategory = await Offers.findByIdAndUpdate(
            { _id: offerId },
            { $addToSet: { appliedCategory: categoryId } },
            { new: true }
        );

        if (addOfferCategory && updateAppliedCategory) {
            res.status(200).json({ success: true, message: "Offer added successfully!" });
        } else {
            res.status(400).json({ success: false, message: "Failed to update offer category!" });
        }
    } catch (error) {
        console.log(error.message);
        next(error);
    }
}



// remove offer from category
const removeCategoryOffer = async (req, res, next) => {
    try {
        const { categoryId, offerId } = req.body;

        // Find and update category by removing the applied offer
        const offerRemovedCategory = await Category.findByIdAndUpdate(
            { _id: categoryId },
            { $unset: { appliedOffer: "" } },
            { new: true }
        );

        // Find and update offer by pulling the category from appliedCategory
        const updateOffer = await Offers.findByIdAndUpdate(
            { _id: offerId },
            { $pull: { appliedCategory: categoryId } },
            { new: true }
        );

        if (offerRemovedCategory) {
            if (updateOffer) {
                res.status(200).json({ removed: true, message: "Offer successfully removed" });
            } else {
                res.status(400).json({ removed: false, message: "Offer not found or failed to update" });
            }
        } else {
            res.status(400).json({ removed: false, message: "Category not found or failed to update" });
        }
    } catch (error) {
        console.log(error.message);
        next(error);
    }
}


// ====================================================================  saleReport    =================================================

// load sales report
const loadSalesReport = async (req, res, next) => {
    try {
        let startDate = new Date(req.query?.start);
        let endDate = new Date(req.query?.end);
        let dateRange = req.query?.date;
        let currentDate = new Date();

        // Adjust endDate to include the entire end day by setting the time to the end of the day
        endDate.setHours(23, 59, 59, 999);

        let filterConditions = {
            orderStatus: { $nin: ['Cancelled', 'Pending'] },
        };

        if (startDate && endDate) {
            filterConditions.date = { $gte: startDate, $lte: endDate };
        }

        if (dateRange) {
            let year = currentDate.getFullYear();
            let month = currentDate.getMonth();

            if (dateRange === "All") {
                const orders = await Orders.find(filterConditions).populate('user').populate('products.productId');
                return res.status(200).render("salesReport", { orders, dateRange });
            }

            if (dateRange === "Day") {
                startDate = new Date(currentDate.setHours(0, 0, 0, 0));
                endDate = new Date(currentDate.setHours(23, 59, 59, 999));
                filterConditions.date = { $gte: startDate, $lte: endDate };
            }

            if (dateRange === "Week") {
                startDate = new Date(year, month, currentDate.getDate() - currentDate.getDay() - 7);
                endDate = new Date(year, month, currentDate.getDate() - currentDate.getDay() - 1);
                filterConditions.date = { $gte: startDate, $lte: endDate };
            }

            if (dateRange === "Month") {
                startDate = new Date(year, month, 1).setHours(0, 0, 0, 0);
                endDate = new Date(year, month + 1, 0).setHours(23, 59, 59, 999);
                filterConditions.date = { $gte: startDate, $lte: endDate };
            }

            if (dateRange === "Year") {
                startDate = new Date(year, 0, 1).setHours(0, 0, 0, 0);
                endDate = new Date(year, 11, 31).setHours(23, 59, 59, 999);
                filterConditions.date = { $gte: startDate, $lte: endDate };
            }
        }

        const orders = await Orders.find(filterConditions).populate('user').populate('products.productId');
        res.status(200).render("salesReport", { orders, dateRange });
    } catch (error) {
        console.log(error.message);
        next(error);
    }
}

// load 404 page
const loadError404 = (req, res, next) => {
    try {
        res.render("admin-404");
    } catch (error) {
        console.log(error.message);
        next(error);
    }
}


module.exports = {
    adminLoginLoad,
    loadDashboard,
    verifyAdminLogin,
    customersLoad,
    blockUser,
    loadLogout,
    loadError404,

    loadOffers,
    addOffer,
    insertOffer,
    editOffer,
    updateOffer,
    changeOfferStatus,

    applyProductOffer,
    removeProductOffer,
    loadOfferForApply,
    applyCategoryOffer,
    removeCategoryOffer,

    loadSalesReport,
    filterYearlyMonthly
}