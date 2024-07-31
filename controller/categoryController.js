const category = require('../model/categoryModel');

// load category
const loadCategory = async (req, res,next) => {
    try {

        let page = 1;
        if (req.query.page) {
            page = req.query.page
        }
        let limit = 8;
        let next = page + 1;
        let previous = page > 1 ? page - 1 : 1;
        let count = await category.find({}).count();

        let totalPage = Math.ceil(count / limit);
        if (next > totalPage) {
            next = totalPage
        }


        const categories = await category.find({})
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();

        res.render('category', {
            categories: categories,
            totalPage: totalPage,
            previous: previous,
            next: next,
            page: page
        })

    } catch (error) {
        console.log(error.message);
        next(error);   
     }
}

// add category
const addCategory = async (req, res,next) => {
    try {
        const categories = await category.find({});
        res.render('addCategory', { categories });
    } catch (error) {
        console.log(error.message);
        next(error);   
     }
}


// insert catogery 
const insertCategory = async (req, res,next) => {
    try {
        const name = req.body.name
        const findName = await category.findOne({ name: name });

        if (findName) {
            req.flash('nameExist', 'This category name already exists.');
            res.redirect('/admin/add-category');
        } else {

            const catagoryData = new category({
                name: req.body.name,
                description: req.body.description,
                isListed: req.body.isListed
            });

            await catagoryData.save();
            res.redirect('/admin/category');
        }
    } catch (error) {
        console.log(error.message);
        next(error);   
     }
}


// edit category
const loadEditCategory = async (req, res,next) => {
    try {
        const id = req.query.id;
        const editCategory = await category.findOne({ _id: id });

        res.render('editCategory', { editCategory });
    } catch (error) {
        console.log(error.message);
        next(error);   
     }
}

// update category
const updateCategory = async (req, res,next) => {
    try {
        const id = req.body.id
        const editName = req.body.ename;
        const editDescription = req.body.edescription;

        const nameAlready = await category.findOne({ _id: { $ne: id }, name: editName });
        console.log(nameAlready, 'name already');
        if (nameAlready) {
            req.flash('nameExist', 'Category name already exist.');
            res.redirect(`/admin/edit-category?id=${id}`);
        } else {

            await category.findByIdAndUpdate({ _id: id }, { $set: { name: editName, description: editDescription } });
            res.redirect('/admin/category');
        }
    } catch (error) {
        console.log(error.message);
        next(error);   
     }
}

// list and unlist category
const categoryListAndUnlist = async (req, res,next) => {
    try {
        const catagoryId = req.body.id;
        const catagoryData = await category.findOne({ _id: catagoryId });

        if (catagoryData.isListed === true) {
            var result;
            result = await category.updateOne({ _id: catagoryId }, { $set: { isListed: false } })
        } else {

            result = await category.updateOne({ _id: catagoryId }, { $set: { isListed: true } })
            console.log('result', JSON.stringify(result));
        }
        res.json({ list: true })
    } catch (error) {
        console.log(error.message);
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