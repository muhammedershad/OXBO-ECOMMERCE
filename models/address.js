const mongoose = require('mongoose')

const addressSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        // unique:true,
    },
    alternativeNumber: {
        type: Number,
    },
    address: {
        type: String,
        required: true,
        // unique:true,
    },
    country: {
        type: String,
        required: true,
        // unique:true,
    },
    state:{
        type:String,
        required:true,
    },
    town:{
        type:String,
        required:true,
    },
    pincode: {
        type: Number,
        required: true,
    },
})

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;