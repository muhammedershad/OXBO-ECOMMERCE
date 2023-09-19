const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        // unique:true,
    },
    phoneNumber:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    },
    Blocked: {
        type: Boolean,
        required: true,
    },
    created : {
        type:Date,
    },
    cart: [{
        product: {
            type: Object,
            required: true,
        },
        quantity: {
            type: Number,
            default: 1, // Default quantity if not specified
        },
        size : {
            type : String,
            required : true
        },
        subTotal : {
            type : Number,
            require : true
        }
    }],
    address: [{
        name: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        },
        pincode: {
            type: Number,
            required: true
        },
        mobileNumber: {
            type: Number,
        },

    }],
    wishlist: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product',
            required: true,
        }
    ],
    wallet: {
        type : Number
    }

})

const User = mongoose.model('User', userSchema);

module.exports = User;