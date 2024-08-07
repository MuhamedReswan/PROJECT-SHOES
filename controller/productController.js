const products = require('../model/productsModel');
const category = require('../model/categoryModel');
const sharp = require('sharp');
const path = require('path');
const { log } = require('console');

// add product 
const addProducts = async (req, res,next) => {
    try {
        const categories = await category.find({});

        // res.render('addProducts',{categories});
        res.render('cropAddproduct', { categories });
    } catch (error) {
        console.log(error.message);
        next(error);   
     }
}




// insert product 
const
    insertProduct = async (req, res,next) => {
        try {
            console.log('im in insertProduct')//------------------------------------------------
            console.log(req.body, 'body');//-----------------------------------------
            console.log("files", req.files)//---------------------------
            // res.status(200).json({added:true});
            const details = req.body;
            const arrImages = [];
            if (Array.isArray(req.files)) {
                req.files.splice(0, 4)
                for (let i = 0; i < req.files.length; i++) {
                    arrImages[i] = req.files[i].filename;
                    console.log('req.file', req.files[i]);//------------------  
                }
            }
            console.log('arrimages', arrImages);//------------------


            for (let i = 0; i < req.files.length; i++) {
                const inputPath = req.files[i].path;
                const outputPath = path.join(__dirname, '..', 'public', 'user', 'assets', 'images', 'product-images', 'sharpedImages', req.files[i].filename);

                try {
                    await sharp(inputPath)
                        .resize(500, 500,)
                        .toFile(outputPath);

                } catch (error) {
                    console.error('Error processing image:', error.message);
                    throw new Error(error);
                }
            }

            const product = await new products({
                name: details.name,
                description: details.description,
                // price:details.price,
                offerPrice: details.offerPrice,
                category: details.category,
                brand: details.brand,
                isListed: details.isListed,
                images: arrImages,
                totalStock: details.quantity,
            });
            const productAlready = await products.findOne({ name: details.name })
            console.log(productAlready, 'producttttttttttttttttttttttttttttt');//-----------------------
            if (productAlready) {
                console.log('Product alredy exist');//--------------------
                // req.flash('already','Product name already exist !')
                return res.json({ success: false, message: "Product name already exist !" });
                console.log('Product alredy exist sended');//----------------------------

                // res.redirect('/admin/add-products')
            } else {
                await product.save();
                // res.redirect('/admin/add-products');
                console.log('product saved');
                return res.status(200).json({ success: true, message: 'Product added successfully' });
            }

        } catch (error) {
            console.log(error.message);
            next(error);
            }
    }

// update edit product
const updateProduct = async (req, res,next) => {
    try {
        console.log(req.body, 'body update');//-----------------------------------------
        const updateData = req.body;
        const arrImages = [];


        if (Array.isArray(req.files)) {
            for (let i = 0; i < req.files.length; i++) {
                console.log("mime type", req.files[i].mimetype)//----------------------------
                arrImages[i] = req.files[i].filename;
                console.log('req.file update', req.files[i]);//------------------  
            }
        }
        console.log('arrimages', arrImages);//------------------

        for (let i = 0; i < req.files.length; i++) {
            const inputPath = req.files[i].path;
            const outputPath = path.join(__dirname, '..', 'public', 'user', 'assets', 'images', 'product-images', 'sharpedImages', req.files[i].filename);

            try {
                await sharp(inputPath)
                    .resize(500, 500)
                    .toFile(outputPath);

            } catch (error) {
                console.error('Error processing image:', error);
            }
        }

        const dbData = await products.findOne({ name: updateData.name })
        // console.log('dbData',dbData);//----------------
        const dbImages = [...dbData.images];
        // console.log('dbImages',dbImages);//-----------
        for (let i = 0; i < arrImages.length; i++) {
            dbImages[parseInt(updateData.index[i])] = arrImages[i]
        }
        // console.log('dbImages',dbImages);//-----------

        const productUpdate = await products.updateOne({ _id: updateData.id }, {
            $set: {
                name: updateData.name,
                description: updateData.description,
                // price:updateData.price,
                offerPrice: updateData.offerPrice,
                category: updateData.category,
                brand: updateData.brand,
                isListed: updateData.isListed,
                images: dbImages,
                totalStock: updateData.quantity,
            }
        })

        res.redirect('/admin/products-list');
        console.log('product updated');//---------------------------

    } catch (error) {
        console.log(error.message);
        next(error);
        }
}




// list product
const ProductsList = async (req, res,next) => {
    try {
        let page = 1;
        if (req.query.page) {
            page = req.query.page
        }
        let limit = 8;
        let next = page + 1;
        let previous = page > 1 ? page - 1 : 1;
        let count = await products.find({}).count();

        let totalPage = Math.ceil(count / limit);
        if (next > totalPage) {
            next = totalPage
        }

        const productsData = await products.find({})
            .populate('category')
            .limit(limit)
            .sort({ created: -1 })
            .skip((page - 1) * limit)
            .exec()

        console.log('productssssssssssssssssssssssssssssssssssss................................', productsData)//----------------------------
        res.render('productsList', {
            productsData: productsData,
            totalPage: totalPage,
            previous: previous,
            next: next,
            page: page
        });
    } catch (error) {
        console.log(error.message);
        next(error);
        }
}

// load edit product
const loadEditProduct = async (req, res,next) => {
    try {
        const id = req.params.id;
        const productData = await products.findOne({ _id: id }).populate('category');
        const categories = await category.find({});

        res.render('editProducts', { productData, categories });
    } catch (error) {
        console.log(error.message);
        next(error);
        }
}


// product list and unlist
const productListAndUnlist = async (req, res,next) => {
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
            res.json({ result: true });
        }
    } catch (error) {
        console.log(error.message);
        next(error);
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