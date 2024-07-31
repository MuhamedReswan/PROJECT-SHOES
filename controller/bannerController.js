// load banners
const loadBanners = (req, res,next) => {
    try {
        res.render('banners')
    } catch (error) {
        console.log(error.message);
        next(error);   
     }
}


module.exports={
    loadBanners
}