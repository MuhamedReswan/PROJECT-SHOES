const Products = require('../model/productsModel');
const Category = require('../model/categoryModel');
const Wishlist = require('../model/wishlistModel');


// load shop
const loadShop = async (req,res) => {
    try {   
        const userId = req.session.user.id;
        const categoryData =await Category.find({isListed:true});
const productData = await Products.find({isListed:true}).populate('category');
const wishlistData = await Wishlist.find({user:userId});
console.log('wishlistData',wishlistData)//----------------
res.render('shop',{categoryData,productData,wishlistData});
    } catch (error) {
        console.log(error);
    }

}

// load single product 
const loadSingleProduct = async (req, res)=>{
    try {
        const id = req.query.id;
        console.log('id',id);//----------
const  userId = req.session.user.id;
        const product = await Products.findOne({_id:id});
        const sDate= new Date();
        const dDate= new Date(sDate.getTime()+7*24*60*60*1000);
        const startDate =sDate.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'2-digit'}).replaceAll(',', "-");
        const deliveryDate=dDate.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'2-digit'}).replaceAll(',', "-");
        const wishlistData = await Wishlist.findOne({user:userId,product:id});
       if(product){
        res.render('singleProduct',{product,deliveryDate,startDate,wishlistData});
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