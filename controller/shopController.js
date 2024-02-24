const products = require('../model/productsModel');
const category = require('../model/categoryModel');


// load shop
const loadShop = async (req,res) => {
    try {       
        const categoryData =await category.find({isListed:true});
const productData = await products.find({isListed:true}).populate('category');

res.render('shop',{categoryData,productData});
    } catch (error) {
        console.log(error);
    }

}

// load single product 
const loadSingleProduct = async (req, res)=>{
    try {
        const id = req.query.id;
        console.log('id',id);

        const product = await products.findOne({_id:id})
        console.log('product',product)//-------------------------------------------
       if(product){
        res.render('singleProduct',{product});
       }else{
        console.log('no prodcut getting')//----------------------
       }
       
    } catch (error) {
        console.log();
    }
}

module.exports={
    loadShop,
    loadSingleProduct
}