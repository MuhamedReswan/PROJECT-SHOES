const category = require('../model/categoryModel');

// load category
const loadCategory = async (req, res) =>{ 
    try {
        const categories = await category.find({});
        res.render('category',{categories});
    } catch (error) {
        console.log(error);
    }
}

// add category
const addCategory = (req, res) => {
    try {
        console.log('adcategory');//--------------------------     
        res.render('addCategory');
    } catch (error) {
        console.log(error); 
    }
}


// insert catogery 
const insertCategory = async (req, res) => {
    try {
        const name = req.body.name
        const findName =await category.findOne({name:name});

        if (findName){            
req.flash('nameExist','This category name already exists.');
res.redirect('/admin/add-category');
        }else{

const catagoryData = new category({
    name:req.body.name,
    description:req.body.description,
    isListed:req.body.isListed
});

await catagoryData.save();
res.redirect('/admin/category');
        }   
} catch (error) {
        console.log(error);
    }
}


// edit category
const loadEditCategory = async (req, res) => {
    try {
        const id = await req.query.id;
        const editCategory = await category.findOne({_id:id});
        
        res.render('editCategory',{editCategory});       
    } catch (error) {
        console.log(error); 
    }
}

// update category
const updateCategory = async (req, res) => {
    try {
        console.log('im update')//-----------------
        const id = req.body.id
        const editName = req.body.ename;
        const editDescription= req.body.edescription;

        const nameAlready = await category.findOne({_id:{$ne:id},name:editName});
       console.log(nameAlready,'name already');
        if (nameAlready){
            req.flash({'nameExist':'Category name already exist.'});
            res.redirect('/admin/edit-category');
        }else{

            await category.findByIdAndUpdate({_id:id},{$set:{name:editName,description:editDescription}});
            res.redirect('/admin/category');
        }
    } catch (error) {
        console.log(error); 
    }
}



module.exports = {
    addCategory,
    loadCategory,
    insertCategory,
    loadEditCategory,
    updateCategory 

}