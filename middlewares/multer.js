const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb (null, path.join(__dirname,'../public/user/assets/images/product-images/products/'))
    },
    filename : (req, file, cb) => {
        const formattedDate =Date.now()
        const name = formattedDate+'-'+file.originalname;
cb(null, name)

    }
})

const upload = multer({storage:storage});


module.exports = upload;