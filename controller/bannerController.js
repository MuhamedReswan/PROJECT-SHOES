const Banners = require('../model/bannerModel');
const path = require('path');
const sharp = require('sharp');
const { format } = require('date-fns');
const Category = require('../model/categoryModel');

//parse data type in to boolean
function parseBoolean(value) {
    if (typeof value === 'string') {
        return value.toLowerCase() === 'true';
    }
    return Boolean(value);
}


// load banners
const loadBanners = async (req, res, next) => {
    try {
        console.log("within load banners");//--------------------
        console.log("req.query.page", req.query.page);//----------

        let page = parseInt(req.query.page) || 1;
        let limit = 8;
        let skip = (page - 1) * limit;

        const banners = await Banners.find({})
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        let count = await Banners.countDocuments({});

        let totalPages = Math.ceil(count / limit);

        let next = page < totalPages ? page + 1 : totalPages;
        let previous = page > 1 ? page - 1 : 1;

        res.render('banners', {
            banners,
            limit,
            previous,
            next,
            page,
            url: req.originalUrl
        });
    } catch (error) {
        console.log(error.message);
        next(error);
    }
}


// add banner
const loadAddBanner = async (req, res, next) => {
    try {
        const categories = await Category.find({ isListed: true })
        // console.log("categories", categories)//---------------
        res.status(200).render("addBanner", { categories });

    } catch (error) {
        console.log(error.message);
        next(error);
    }
}



// insert banner
const insertBanners = async (req, res, next) => {
    try {
        console.log("within insert Banner")//---------------------  
        // console.log("req.body", req.body)//---------------------  
        // console.log("req.file", req.file)//---------------------  
        const { isListed, url, description, name, ExpireDate } = req.body;
        // const imageFile = req.file
        // console.log("image banner", image)//---------------------
        name.toLowerCase();
        const formatedExpire = format(ExpireDate, 'MMMM d, yyyy');


        let imageName = req.file.originalname;

        const inputPath = req.file.path;
        const outputPath = path.join(__dirname, '..', 'public', 'user', 'assets', 'images', 'banners', imageName);

        try {
            await sharp(inputPath)
                .resize(1920, 1080)
                .toFile(outputPath);

        } catch (error) {
            console.error('Error processing image:', error.message);
            throw new Error(error);
        }

        const banner = new Banners({
            title: name,
            description: description,
            url: `${url}`,
            isListed: isListed,
            image: imageName,
            expireDate: formatedExpire
        })

        const savedBanner = await banner.save();
        
        if (savedBanner) {
            res.status(200).json({ success: true });

        } else {
            res.status(400).json({ success: false, error: "banner not saved" });
        }
    } catch (error) {
        console.log(error.message);
        next(error);
    }
}



// change banner status
const changeBannerStatus = async (req, res, next) => {
    console.log("changeBannersStatus invoked"); //-----------
    try {
        const { bannerId, status } = req.body;


        // Convert status to boolean
        const currentStatus = parseBoolean(status)
        // console.log('iam curr', currentStatus)//---------------------
        const toStatus = !currentStatus;

        console.log('changeOfferStatus'); //--------------------
        console.log('req.body', req.body); //--------------------
        console.log('status', currentStatus); //--------------------
        console.log('toStatus', toStatus); //--------------------

        const updatedBanner = await Banners.findByIdAndUpdate(
            { _id: bannerId },
            { $set: { isListed: toStatus } },
            { new: true }
        );

        console.log("updatedBanner", updatedBanner); //-------------------

        if (updatedBanner) {
            console.log('ooooooooooooooooooooooooo', updatedBanner);//---------------
            res.status(200).json({ statusChanged: true });
        } else {
            res.status(404).json({ message: "Banner not found", statusChanged: false });
        }

    } catch (error) {
        console.log(error.message);
        next(error);
    }
}



// edit banner
const loadEditBanner = async (req, res, next) => {
    try {
        console.log("within loadBanner conroleer edit")//-----------------------
        const bannerId = req.query.id;
        console.log("bannerId", bannerId)//---------------------
        const categories = await Category.find({ isListed: true })


        const bannerDetails = await Banners.findOne({ _id: bannerId });
        console.log("bannerbannerDetails", bannerDetails)//---------------

        if (bannerDetails) {
            console.log("within offerDEtail if")//-----------------------------
            res.status(200).render('editBanner', { bannerDetails, categories });
        } else {
            console.log("within offerDEtail else")//-----------------------------

            throw new Error("offer not found this bannerId")
        }

    } catch (error) {
        console.log(error.message);
        next(error);
    }
}



// update banner
const updateBanner = async (req, res, next) => {
    try {
        console.log("within update Banner")//---------------------  
        console.log("req.body", req.body)//---------------------  
        console.log("req.file", req.file)//---------------------  
        const { isListed, url, description, name, ExpireDate, bannerId } = req.body;
        // const imageFile = req.file
        // console.log("image banner", image)//---------------------
        name.toLowerCase();
        const formatedExpire = format(ExpireDate, 'MMMM d, yyyy');
let updation ={
    title: name,
    description: description,
    url: `${url}`,
    isListed: isListed,
    expireDate: formatedExpire
}

if(req.file){
    let imageName = req.file.originalname;

    const inputPath = req.file.path;
    const outputPath = path.join(__dirname, '..', 'public', 'user', 'assets', 'images', 'banners', imageName);
    updation.image=imageName;
    try {
        await sharp(inputPath)
            .resize(1920, 1080)
            .toFile(outputPath);

    } catch (error) {
        console.error('Error processing image:', error.message);
        throw new Error(error);
    }
}
       


        const updatedBanner = await Banners.findByIdAndUpdate(
            { _id: bannerId },
            {
                $set:updation
            },
        )

        if (updatedBanner) {
            res.status(200).json({ success: true });

        } else {
            res.status(400).json({ success: false, error: "banner not updated" });
        }
    } catch (error) {
        console.log(error.message);
        next(error);
    }
}


module.exports = {
    loadBanners,
    loadAddBanner,
    insertBanners,
    changeBannerStatus,
    loadEditBanner,
    updateBanner
}