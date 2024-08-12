const Banners = require('../model/bannerModel');
const path = require('path');
const sharp = require('sharp');
const { format } = require('date-fns');
const Category = require('../model/categoryModel');




// load banners
const loadBanners = async(req, res,next) => {
    try {
        const banners = await Banners.find({isListed:true}).sort({createdAt:-1});
        console.log("banners form controllers",banners)//---------------------
        res.render('banners',{banners})
    } catch (error) {
        console.log(error.message);
        next(error);   
     }
}

// add banner
 const loadAddBanner = async (req,res,next)=>{
try {
const categories = await Category.find({isListed:true})
console.log("categories",categories)//---------------
    res.status(200).render("addBanner",{categories});
    
} catch (error) {
    console.log(error.message);
    next(error);   
 }
 }



 // insert banner
  const insertBanners = async (req, res,next)=>{
    try {
        console.log("within insert Banner")//---------------------  
        console.log("req.body",req.body)//---------------------  
        console.log("req.file",req.file)//---------------------  
        const {isListed,url,description,name,ExpireDate}= req.body;
        // const imageFile = req.file
        // console.log("image banner", image)//---------------------
name.toLowerCase();
const formatedExpire = format(ExpireDate, 'MMMM d, yyyy');


let imageName = req.file.originalname;

const inputPath = req.file.path;
const outputPath = path.join(__dirname, '..', 'public', 'user', 'assets', 'images','banners', imageName);

try {
    await sharp(inputPath)
        .resize(1024, 768,)
        .toFile(outputPath);

} catch (error) {
    console.error('Error processing image:', error.message);
    throw new Error(error);
}

let updatedUrl = `665b1ea34bf856131341a8dd`
const banner = new Banners({
    title:name,
    description:description,
    url:`${url}`,
    isListed:isListed,
    image:imageName,
    expireDate:formatedExpire
})

const savedBanner = await banner.save();
console.log('savedBanner',savedBanner)//-------------------------

if(savedBanner){
    res.status(200).json({success:true});

}else{
    res.status(400).json({success:false,error:"banner not saved"});
}
    } catch (error) {
        console.log(error.message);
        next(error);  
    }
  }


module.exports={
    loadBanners,
    loadAddBanner,
    insertBanners
}