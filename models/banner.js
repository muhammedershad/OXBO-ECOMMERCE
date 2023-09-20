const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    title : {
        type:String,
        required:true,
    },
    
    subtitle : {
        type: String,
        required:true,
    },

    image : {
        type: String,
        require : true
    },
    
    category : {
        type: String,
        required: true,
    },

    active : {
        type : Boolean
    }
})

const banner = mongoose.model('banner', bannerSchema);

module.exports = banner;