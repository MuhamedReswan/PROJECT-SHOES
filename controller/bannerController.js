const Banners = require('../model/bannerModel')

// load banners
const loadBanners = (req, res,next) => {
    try {
        res.render('banners')
    } catch (error) {
        console.log(error.message);
        next(error);   
     }
}

// add banner
 const loadAddBanner = async (req,res,next)=>{
try {
    const banners = await Banners.find({isListed:true});

    res.status(200).render("addBanner",{banners});
    
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
        console.log("req.file",req.files)//---------------------  
        const {isListed,url,description,name}= req.body;
        const imageFile = req.files[0]
name.toLowerCase()
let updatedUrl = ``
const banner = new Banners({
    name:name,
    description:description,
    url:`http://localhost:3001/single-product?id=${url}`,
    isListed:isListed
})

const savedBanner = await banner.save();
console.log('savedBanner',savedBanner)//-------------------------

if(savedBanner){
    res.status(200).json({succes:true});

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