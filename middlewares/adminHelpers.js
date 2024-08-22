const Orders = require('../model/orderModel');

const returnRequestCount = async (req, res, next) => {
    try {
        console.log("In returnRequestCount middleware"); 
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
            console.log("Requested Count:", requestedCount[0].count); 
            res.locals.requestedCount = requestedCount[0].count;
        }else{
            res.locals.requestedCount = 0;
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
