const Returns = require('../model/returnModel')
const Orders = require('../model/orderModel');
const returnRequestCount = async (req, res, next) => {
    try {
        console.log("in countOfCartAndWishlist")//-------------
        let admin = req.session.admin ?? null;

        const requestedCount = await Orders.aggregate([
            {$match:{orderStatus:"Delivered"}},
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
       
if(admin){
    console.log("requestedCount[0].count",requestedCount[0].count)//-------------------------
    res.locals.requestedCount=requestedCount[0].count
}

        next();
    } catch (error) {
        console.log(error);
    }
}


module.exports = {
    returnRequestCount
}