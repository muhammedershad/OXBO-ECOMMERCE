const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code:{
        type:String,
        required:true,
    },
    amount:{
        type:Number,
        required:true,
    },
    minPurchaseAmount : {
        type: Number,
        require : true
    },
    createdAt: {
        type: Date,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    type : {
        type : String,
        require : true
    },
    active : {
        type: Boolean,
        require : true
    },
    maxRedimableAmount : {
        type : Number,
        required : true
    }
})

const coupon = mongoose.model('coupon', couponSchema);

module.exports = coupon;