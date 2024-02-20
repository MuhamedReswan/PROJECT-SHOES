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
        const id = req.query.id;
        console.log('editCategory id',id)//---------------------------------
        const editCategory = await category.findOne({_id:id});
        console.log('editCategory',editCategory)//---------------------------------
        
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
        console.log('id upadte category',id)//------------------
        const editName = req.body.ename;
        const editDescription= req.body.edescription;

        const nameAlready = await category.findOne({_id:{$ne:id},name:editName});
       console.log(nameAlready,'name already');
        if (nameAlready){
            req.flash('nameExist','Category name already exist.');
            res.redirect(`/admin/edit-category?id=${id}`);
        }else{

            await category.findByIdAndUpdate({_id:id},{$set:{name:editName,description:editDescription}});
            res.redirect('/admin/category');
        }
    } catch (error) {
        console.log(error); 
    }
}

// list and unlist category
const categoryListAndUnlist = async (req,res) =>{
    try {
        const catagoryId =req.body.id;
        console.log("id",catagoryId);//------------------------------------
    const catagoryData = await category.findOne({_id:catagoryId});
    console.log("catagoryData",catagoryData);//------------------------------------
    if (catagoryData.isListed===true){
        var result;
       result = await category.updateOne({_id:catagoryId},{$set:{isListed:false}})   

    }else{
        result = await category.updateOne({_id:catagoryId},{$set:{isListed:true}}) 
    console.log('result',JSON.stringify(result))
   
}
res.json({list:true})
    } catch (error) {
        console.log(error)
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