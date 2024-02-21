const products = require('../model/productsModel');
const category = require('../model/categoryModel');


// load shop
const loadShop = async (req,res) => {
    try {       
        console.log('im in load shop')//------------------------------------------------------------------------------------------------------
        const categoryData =await category.find({isListed:true});
const productData = await products.find({isListed:true}).populate('category');
console.log('catagoryData',categoryData)//---------------------------------
console.log('productyData',productData)//---------------------------------

res.render('shop',{categoryData,productData});
    } catch (error) {
        console.log(error);
    }

}

module.exports={
    loadShop
}