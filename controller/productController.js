const products = require('../model/productsModel');
const category = require('../model/categoryModel');
const sharp = require('sharp');
const path = require('path');

// add product 
const addProducts = async (req, res) => {
    try {
        const categories = await category.find({});
        
        res.render('addProducts',{categories});
    } catch (error) {
        console.log(error);
    }

}




// insert product 
const insertProduct = async (req, res) => {
    try {       
console.log(req.body,'body');//-----------------------------------------
const details = req.body;
// console.log(req.files);//-----------------------
const arrImages = [];
if (Array.isArray(req.files)){
    for (let i=0; i<req.files.length; i++){
        arrImages[i]=req.files[i].filename;   
        console.log('req.file',req.files[i]);//------------------  
    }
}
console.log('arrimages',arrImages);//------------------


for (let i = 0; i <req.files.length; i++) {
    const inputPath = req.files[i].path;
    const outputPath = path.join(__dirname,'..', 'public', 'user', 'assets', 'images', 'product-images', 'sharpedImages', req.files[i].filename);

    try {
        await sharp(inputPath)
            .resize(500, 500)
            .toFile(outputPath);

    } catch (error) {
        console.error('Error processing image:', error);
    }
}

   const obj = {}
   const size = req.body.size;
   let totalStock=0;
for(let i = 0; i < size.length; i++) {
     if(size[i]){
         obj[size[i]] = req.body.quantity[i]; 

         totalStock += parseInt(req.body.quantity[i])    
     }   

    
}
console.log('total stock=', totalStock)//-------------------------------
console.log('obj=', obj)//-----------------------------

const product = await new products({
    name:details.name,
    description:details.description,
    price:details.price,
    offerPrice:details.offerPrice,
    category:details.category,
    brand:details.brand,
    isListed:details.isListed,
    stock: obj,
    size:details.size,
    images:arrImages,
    totalStock:totalStock

});

await product.save();
res.redirect('/admin/add-products');
console.log('product saved');

} catch (error) {
        console.log(error);
    }
}

// list product
const ProductsList = async (req, res) => {
    try {
        console.log('im in product list');//---------------------------
    const  productsData = await products.find({}).populate('category');
    console.log('products data',productsData)//---------------------------
        res.render('productsList',{productsData});
    } catch (error) {
        console.log(error);
    } 
    }

// load edit product
const loadEditProduct = async (req,res)=>{
    try {
      const id = req.params.id;
      console.log('id',id);//----------------------------------
      const productData = await products.findOne({_id:id}).populate('category');
      const categories = await category.find({});
      
      console.log('categories',categories);//----------------------------------
      console.log('productData',productData);//----------------------------------

      res.render('editProducts',{productData,categories});
    } catch (error) {
        console.log(error);
    }
}

// update edit product
const updateProduct =async (req, res) => {
    try {
        
    } catch (error) {
        console.log(error);
    }
}



module.exports = {
    insertProduct,
    addProducts,
    ProductsList,
    loadEditProduct,
    updateProduct
    


}