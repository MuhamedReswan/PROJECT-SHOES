// const Returns = require('../model/returnModel')

// const returnRequestCount = async (req, res, next) => {
//     try {
//         console.log("in countOfCartAndWishlist")//-------------
//         let admin = req.session.admin ?? null;
// if(admin){
//     const returnCount = await Returns.countDocuments({})
//     console.log("returnCount",returnCount)//----------------------
//     req.session.returnCount=returnCount
// }

//         next();
//     } catch (error) {
//         console.log(error);
//     }
// }


// module.exports = {
//     returnRequestCount
// }