const products = require('../model/productsModel');
const category = require('../model/categoryModel');
const sharp = require('sharp');
const path = require('path');
const { log } = require('console');

// add product 
const addProducts = async (req, res) => {
    try {
        const categories = await category.find({});
        
        // res.render('addProducts',{categories});
        res.render('cropAddproduct',{categories});
    } catch (error) {
        console.log(error);
    }

}




// insert product 
const 
insertProduct = async (req, res) => {
    try {       
        console.log('im in insertProduct')//------------------------------------------------
console.log(req.body,'body');//-----------------------------------------
// const details = req.body;
// const arrImages = [];
// if (Array.isArray(req.files)){
//     for (let i=0; i<req.files.length; i++){
//         arrImages[i]=req.files[i].filename;   
//         console.log('req.file',req.files[i]);//------------------  
//     }
// }
// console.log('arrimages',arrImages);//------------------


// for (let i = 0; i <req.files.length; i++) {
//     const inputPath = req.files[i].path;
//     const outputPath = path.join(__dirname,'..', 'public', 'user', 'assets', 'images', 'product-images', 'sharpedImages', req.files[i].filename);

//     try {
//         await sharp(inputPath)
//             .resize(500,500,)
//             .toFile(outputPath);

//     } catch (error) {
//         console.error('Error processing image:', error);
//     }
// }
// const product = await new products({
//         name:details.name,
//         description:details.description,
//         price:details.price,
//         offerPrice:details.offerPrice,
//         category:details.category,
//         brand:details.brand,
//         isListed:details.isListed,
//         images:arrImages,
//         totalStock:details.quantity,
// });
// const productAlready = await products.findOne({name:details.name})
// if(productAlready){
// console.log('Product alredy exist');
// req.flash('already','Product name already exist !')
// res.redirect('/admin/add-products')
// }else{
//     await product.save();
// res.redirect('/admin/add-products');
// console.log('product saved');
// }


} catch (error) {
        console.log(error);
    }
}

// update edit product
const updateProduct =async (req, res) => {
    try {
        console.log(req.body,'body update');//-----------------------------------------
        const updateData = req.body;
        const arrImages = [];

        if (Array.isArray(req.files)){
            for (let i=0; i<req.files.length; i++){
                arrImages[i]=req.files[i].filename;   
                console.log('req.file update',req.files[i]);//------------------  
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
        
       const dbData = await products.findOne({name:updateData.name})
        // console.log('dbData',dbData);//----------------
        const dbImages = [...dbData.images];
        // console.log('dbImages',dbImages);//-----------
for(let i=0; i<arrImages.length; i++){
    dbImages[parseInt(updateData.index[i])] =arrImages[i]
}
// console.log('dbImages',dbImages);//-----------

const productUpdate = await products.updateOne({_id:updateData.id},{
    $set:{
        name:updateData.name,
        description:updateData.description,
        price:updateData.price,
        offerPrice:updateData.offerPrice,
        category:updateData.category,
        brand:updateData.brand,
        isListed:updateData.isListed,
        images:dbImages,
        totalStock:updateData.quantity,
    }
})

        res.redirect('/admin/products-list');
        console.log('product updated');//---------------------------
        
        } catch (error) {
                console.log(error);
            }
        }
        



// list product
const ProductsList = async (req, res) => {
    try {
    const  productsData = await products.find({}).populate('category');
        res.render('productsList',{productsData});
    } catch (error) {
        console.log(error);
    } 
    }

// load edit product
const loadEditProduct = async (req,res)=>{
    try {
      const id = req.params.id;
      const productData = await products.findOne({_id:id}).populate('category');
      const categories = await category.find({});

      res.render('editProducts',{productData,categories});
    } catch (error) {
        console.log(error);
    }
}


// product list and unlist
const productListAndUnlist = async (req, res) => {
    try {
        const productId = req.body.productId;
        const productData = await products.findOne({ _id: productId });

        if (productData) {
            if (productData.isListed == true) {

                await products.findByIdAndUpdate({ _id: productId }, {
                    $set: {
                        isListed: false
                    }
                });
            } else {
                await products.findByIdAndUpdate({ _id: productId }, {
                    $set: {
                        isListed: true
                    }
                });
            }
            res.json({result:true});
        }
    } catch (error) {
        console.log(error);
    }
}


module.exports = {
    insertProduct,
    addProducts,
    ProductsList,
    loadEditProduct,
    updateProduct,
    productListAndUnlist
    


}