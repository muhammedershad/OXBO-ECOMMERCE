const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    title : {
        type: String,
        required: true,
    },
    category:{
        type: String,
        // required: true,
    },
    subcategory:{
        type: String,
        // required: true,
    },
    paymentType : {
        type : String,
        // require : true
    },
    gender : {
        type : String,
        // require : true
    },
    shippingCharge : {
        type : Number,
        // require : true
    },
    MRP : {
        type : Number,
        // require : true
    },
    purchaseRate : {
        type : Number,
    },
    discount : {
        type : Number
    },
    brand : {
        type : String,
        // require : true
    },
    description : {
        type : String,
        // require : true
    },
    stock: {
        S: Number,
        M: Number,
        L: Number,
        XL: Number,
        XXL: Number,
    },
    image : {
        type : [String],
        // require : true
    },
    active : {
        type: Boolean
    },
    color : {
        type : String
    }
    
})

const product = mongoose.model('product', productSchema);

module.exports = product;