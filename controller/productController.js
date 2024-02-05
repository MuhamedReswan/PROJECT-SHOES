const products = require('../model/productsModel');
const category = require('../model/categoryModel');
const sharp = require('sharp');
const path = require('path');

// add product 
const addProducts =  (req, res) => {
    try {
        res.render('addProducts');
    } catch (error) {
        console.log(error);
    }

}




// insert product 
const insertProduct = async (req, res) => {
    try {       
console.log(req.body,'body');//-----------------------------------------
// console.log(req.body.isListed,'islidted');//-----------------------------------------
// console.log(req.body.catagory,"category");//-----------------------------------------

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


// for (i=0; i<arrImages.length; i++){
//     console.log('arrimages',arrImages[i]);//-----------------------
//     await sharp('/public/user/assets/images/product-images/products/'+arrImages[i])
//     .resize(500,500)
//     .toFile('/public/user/assets/images/product-images/sharpedImages/'+arrImages[i])
// }

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


const product = await new products({
    name:details.name,
    description:details.description,
    price:details.price,
    offerPrice:details.offerPrice,
    category:details.category,
    brand:details.brand,
    isListed:details.isListed,
    stock:details.stock,
    size:details.size,
    images:arrImages
});

await product.save();
res.redirect('/add-product');
console.log('product saved');

} catch (error) {
        console.log(error);
    }
}




module.exports = {
    insertProduct,
    addProducts

}