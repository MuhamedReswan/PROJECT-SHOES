const category = require('../model/categoryModel');

// Load Category with Pagination
const loadCategory = async (req, res, next) => {
    try {
        let page = parseInt(req.query.page) || 1;
        const limit = 8;
        const start = (page - 1) * limit;
        const count = await category.countDocuments();

        const totalPage = Math.ceil(count / limit);
        const next = page < totalPage ? page + 1 : totalPage;
        const previous = page > 1 ? page - 1 : 1;

        const categories = await category.find({})
            .limit(limit)
            .skip(start);

        res.render('category', {
            categories,
            totalPage,
            previous,
            next,
            page
        });
    } catch (error) {
        next(error);   
    }
}

// Load Add Category Page
const addCategory = async (req, res, next) => {
    try {
        const categories = await category.find({});
        res.render('addCategory', { categories });
    } catch (error) {
        next(error);   
    }
}

// Insert New Category
const insertCategory = async (req, res, next) => {
    try {
        const { name, description, isListed } = req.body;
        const findName = await category.findOne({ name });

        if (findName) {
            req.flash('nameExist', 'This category name already exists.');
            res.redirect('/admin/add-category');
        } else {
            const categoryData = new category({
                name,
                description,
                isListed
            });

            await categoryData.save();
            res.redirect('/admin/category');
        }
    } catch (error) {
        next(error);   
    }
}

// Load Edit Category Page
const loadEditCategory = async (req, res, next) => {
    try {
        const { id } = req.query;
        const editCategory = await category.findById(id);

        res.render('editCategory', { editCategory });
    } catch (error) {
        next(error);   
    }
}

// Update Existing Category
const updateCategory = async (req, res, next) => {
    try {
        const { id, ename: editName, edescription: editDescription } = req.body;

        // Check if the category name already exists for a different category
        const nameAlready = await category.findOne({ _id: { $ne: id }, name: editName });

        if (nameAlready) {
            req.flash('nameExist', 'Category name already exists.');
            res.redirect(`/admin/edit-category?id=${id}`);
        } else {
            await category.findByIdAndUpdate(id, {
                $set: {
                    name: editName,
                    description: editDescription
                }
            });
            res.redirect('/admin/category');
        }
    } catch (error) {
        next(error);   
    }
}

// Toggle Category Listing Status
const categoryListAndUnlist = async (req, res, next) => {
    try {
        const { id: categoryId } = req.body;
        const categoryData = await category.findById(categoryId);

        // Toggle the listing status of the category
        const updatedCategory = await category.updateOne(
            { _id: categoryId },
            { $set: { isListed: !categoryData.isListed } }
        );

        res.json({ list: true });
    } catch (error) {
        next(error);   
    }
}

module.exports = {
    addCategory,
    loadCategory,
    insertCategory,
    loadEditCategory,
    updateCategory,
    categoryListAndUnlist
}
