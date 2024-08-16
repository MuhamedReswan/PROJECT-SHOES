const Products = require('../model/productsModel');
const Category = require('../model/categoryModel');
const sharp = require('sharp');
const path = require('path');

// Load add product page
const addProducts = async (req, res, next) => {
    try {
        const categories = await Category.find({});
        res.render('cropAddproduct', { categories });
    } catch (error) {
        console.error("Error loading add product page:", error.message);
        next(error);
    }
}

// Add a new product
const insertProduct = async (req, res, next) => {
    try {
        const details = req.body;
        const arrImages = [];

        // Process image files if present
        if (Array.isArray(req.files)) {
            req.files.splice(0, 4); // Adjusting the files list if necessary
            req.files.forEach(file => arrImages.push(file.filename));

            // Resize and save images
            for (const file of req.files) {
                const inputPath = file.path;
                const outputPath = path.join(__dirname, '..', 'public', 'user', 'assets', 'images', 'product-images', 'sharpedImages', file.filename);

                await sharp(inputPath)
                    .resize(500, 500)
                    .toFile(outputPath);
            }
        }

        // Check if the product already exists
        const productAlready = await Products.findOne({ name: details.name });
        if (productAlready) {
            return res.status(409).json({ success: false, message: "Product name already exists!" });
        }

        // Create and save the new product
        const product = new Products({
            name: details.name,
            description: details.description,
            offerPrice: details.offerPrice,
            category: details.category,
            brand: details.brand,
            isListed: details.isListed,
            images: arrImages,
            totalStock: details.quantity,
        });

        await product.save();
        return res.status(200).json({ success: true, message: 'Product added successfully' });

    } catch (error) {
        console.error("Error inserting product:", error.message);
        next(error);
    }
}

// Update a product
const updateProduct = async (req, res, next) => {
    try {
        const updateData = req.body;
        const arrImages = [];

        // Process updated images
        if (Array.isArray(req.files)) {
            req.files.forEach(file => arrImages.push(file.filename));

            for (const file of req.files) {
                const inputPath = file.path;
                const outputPath = path.join(__dirname, '..', 'public', 'user', 'assets', 'images', 'product-images', 'sharpedImages', file.filename);

                await sharp(inputPath)
                    .resize(500, 500)
                    .toFile(outputPath);
            }
        }

        const product = await Products.findOne({ name: updateData.name });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const dbImages = [...product.images];
        arrImages.forEach((img, i) => {
            dbImages[parseInt(updateData.index[i])] = img;
        });

        // Update the product details
        await Products.updateOne({ _id: updateData.id }, {
            $set: {
                ...updateData,
                images: dbImages,
            }
        });

        res.redirect('/admin/products-list');
    } catch (error) {
        console.error("Error updating product:", error.message);
        next(error);
    }
}

// Display product list
const ProductsList = async (req, res, next) => {
    try {
        let page = parseInt(req.query.page) || 1;
        const limit = 8;

        const count = await Products.countDocuments();
        const totalPage = Math.ceil(count / limit);
        const productsData = await Products.find({})
            .populate('category')
            .limit(limit)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        res.render('productsList', {
            productsData,
            totalPage,
            page,
            previous: page > 1 ? page - 1 : 1,
            next: page < totalPage ? page + 1 : totalPage
        });
    } catch (error) {
        console.error("Error fetching product list:", error.message);
        next(error);
    }
}

// Load edit product page
const loadEditProduct = async (req, res, next) => {
    try {
        const productData = await Products.findOne({ _id: req.params.id }).populate('category');
        const categories = await Category.find({});

        res.render('editProducts', { productData, categories });
    } catch (error) {
        console.error("Error loading edit product page:", error.message);
        next(error);
    }
}

// Toggle product listing status
const productListAndUnlist = async (req, res, next) => {
    try {
        const product = await Products.findById(req.body.productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        product.isListed = !product.isListed;
        await product.save();

        res.json({ result: true });
    } catch (error) {
        console.error("Error updating product listing status:", error.message);
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
