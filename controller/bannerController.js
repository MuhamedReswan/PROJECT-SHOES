// load banners
const loadBanners = (req,res)=>{
    try {
        res.render('banners')
    } catch (error) {
        console.log(error);
    }
}


module.exports={
    loadBanners
}