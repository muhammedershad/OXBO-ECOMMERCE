const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    otp:{
        type:String,
        required:true,
    },
    createdAt: {
          type: Date,
          required: true,
    },
    expriesAt: {
        type: Date,
        required: true,
    },
})

const otp = mongoose.model('otp', otpSchema);

module.exports = otp;