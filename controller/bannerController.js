const Banners = require('../model/bannerModel');
const path = require('path');
const sharp = require('sharp');
const { format } = require('date-fns');
const Category = require('../model/categoryModel');

// Utility function to parse string booleans to actual boolean values
function parseBoolean(value) {
    if (typeof value === 'string') {
        return value.toLowerCase() === 'true';
    }
    return Boolean(value);
}

// Load banners with pagination
const loadBanners = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 8;
        const skip = (page - 1) * limit;

        // Fetch banners with pagination and sorting by creation date
        const banners = await Banners.find({})
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const count = await Banners.countDocuments({});
        const totalPages = Math.ceil(count / limit);
        const next = page < totalPages ? page + 1 : totalPages;
        const previous = page > 1 ? page - 1 : 1;

        res.render('banners', {
            banners,
            limit,
            previous,
            next,
            page,
            url: req.originalUrl
        });
    } catch (error) {
        console.error(error.message);
        next(error);
    }
};

// Load form to add a new banner
const loadAddBanner = async (req, res, next) => {
    try {
        const categories = await Category.find({ isListed: true });
        res.status(200).render("addBanner", { categories });
    } catch (error) {
        console.error(error.message);
        next(error);
    }
};

// Insert a new banner
const insertBanners = async (req, res, next) => {
    try {
        const { isListed, url, description, name, ExpireDate } = req.body;

        // Format banner title and expiration date
        const formattedName = name.toLowerCase();
        const formattedExpireDate = format(ExpireDate, 'MMMM d, yyyy');
        const imageName = req.file.originalname;
        const inputPath = req.file.path;
        const outputPath = path.join(__dirname, '..', 'public', 'user', 'assets', 'images', 'banners', imageName);

        // Resize and save the image using sharp
        await sharp(inputPath)
            .resize(1920, 1080)
            .toFile(outputPath);

        // Save the banner data
        const banner = new Banners({
            title: formattedName,
            description,
            url,
            isListed,
            image: imageName,
            expireDate: formattedExpireDate
        });

        const savedBanner = await banner.save();
        if (savedBanner) {
            res.status(200).json({ success: true });
        } else {
            res.status(400).json({ success: false, error: "Banner not saved" });
        }
    } catch (error) {
        console.error(error.message);
        next(error);
    }
};

// Change the status of a banner (list/unlist)
const changeBannerStatus = async (req, res, next) => {
    try {
        const { bannerId, status } = req.body;
        const currentStatus = parseBoolean(status);
        const updatedBanner = await Banners.findByIdAndUpdate(
            { _id: bannerId },
            { $set: { isListed: !currentStatus } },
            { new: true }
        );

        if (updatedBanner) {
            res.status(200).json({ statusChanged: true });
        } else {
            res.status(404).json({ message: "Banner not found", statusChanged: false });
        }
    } catch (error) {
        console.error(error.message);
        next(error);
    }
};

// Load banner details for editing
const loadEditBanner = async (req, res, next) => {
    try {
        const bannerId = req.query.id;
        const categories = await Category.find({ isListed: true });
        const bannerDetails = await Banners.findOne({ _id: bannerId });

        if (bannerDetails) {
            res.status(200).render('editBanner', { bannerDetails, categories });
        } else {
            throw new Error("Banner not found for the given ID");
        }
    } catch (error) {
        console.error(error.message);
        next(error);
    }
};

// Update a banner
const updateBanner = async (req, res, next) => {
    try {
        const { isListed, url, description, name, ExpireDate, bannerId } = req.body;
        const formattedName = name.toLowerCase();
        const formattedExpireDate = format(ExpireDate, 'MMMM d, yyyy');
        
        let updateData = {
            title: formattedName,
            description,
            url,
            isListed,
            expireDate: formattedExpireDate
        };

        // If a new image is uploaded, process it
        if (req.file) {
            const imageName = req.file.originalname;
            const inputPath = req.file.path;
            const outputPath = path.join(__dirname, '..', 'public', 'user', 'assets', 'images', 'banners', imageName);
            
            await sharp(inputPath)
                .resize(1920, 1080)
                .toFile(outputPath);

            updateData.image = imageName;
        }

        // Update banner
        const updatedBanner = await Banners.findByIdAndUpdate(
            { _id: bannerId },
            { $set: updateData },
            { new: true }
        );

        if (updatedBanner) {
            res.status(200).json({ success: true });
        } else {
            res.status(400).json({ success: false, error: "Banner not updated" });
        }
    } catch (error) {
        console.error(error.message);
        next(error);
    }
};

module.exports = {
    loadBanners,
    loadAddBanner,
    insertBanners,
    changeBannerStatus,
    loadEditBanner,
    updateBanner
};
