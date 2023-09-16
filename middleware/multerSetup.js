const multer = require('multer');

const fileStorage = multer.diskStorage({
    destination: (req,file,callback) => {
        callback(null,'images')
    },
    filename: (req,file,callback) => {
        const suffix = `${Date.now()}-${file.originalname}`
        callback(null,suffix )
    }
})

module.exports = fileStorage