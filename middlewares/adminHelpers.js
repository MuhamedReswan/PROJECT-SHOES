const Orders = require('../model/orderModel');

const returnRequestCount = async (req, res, next) => {
    try {
        console.log("In returnRequestCount middleware"); // For debugging
        const admin = req.session.admin || null;

        const requestedCount = await Orders.aggregate([
            { $match: { orderStatus: "Delivered" } },
            {
                $lookup: {
                    from: 'products',
                    localField: 'products.productId',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: "$products" },
            { 
                $match: { 
                    "products.status": "Return Requested" 
                }
            },
            { 
                $group: {
                    _id: null,
                    count: { $sum: 1 }  
                }
            }
        ]);

        if (admin && requestedCount.length > 0) {
            console.log("Requested Count:", requestedCount[0].count); // For debugging
            res.locals.requestedCount = requestedCount[0].count;
        }

        next();
    } catch (error) {
        console.error("Error in returnRequestCount middleware:", error);
        res.status(500).send("Internal Server Error");
    }
};

module.exports = {
    returnRequestCount
};
