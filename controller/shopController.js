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

        const product = await products.findOne({_id:id});
        console.log('single product',product)//------------------------
        const sDate= new Date();
        console.log('sDate',sDate)//----------------------
        const dDate= new Date(sDate.getTime()+7*24*60*60*1000);
        console.log('dDate',dDate)//----------------------
        const startDate =sDate.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'2-digit'}).replaceAll(',', "-");
        const deliveryDate=dDate.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'2-digit'}).replaceAll(',', "-");
        console.log('startDate ',startDate )//----------------------
        console.log('veryDate',deliveryDate)//----------------------

        console.log('product',product)//-------------------------------------------
       if(product){
        res.render('singleProduct',{product,deliveryDate,startDate});
       }else{
        console.log('no prodcut getting')//----------------------
       }
       
    } catch (error) {
        console.log();
    }
}




module.exports={
    loadShop,
    loadSingleProduct,
  
}