const multer = require('multer');
const path = require('path');

// Configure storage for Multer
const storage = multer.diskStorage({
    // Define the destination folder for uploaded files
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/user/assets/images/product-images/products/'));
    },
    // Define the naming convention for uploaded files
    filename: (req, file, cb) => {
        const formattedDate = Date.now(); // Get the current timestamp
        const name = `${formattedDate}-${file.originalname}`; // Combine timestamp with original file name
        cb(null, name);
    }
});

// Initialize Multer with the configured storage settings
const upload = multer({ storage: storage });

// Export the configured Multer instance for use in other modules
module.exports = upload;
