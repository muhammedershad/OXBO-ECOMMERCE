const mongoose = require('mongoose');
const product = require('./product');

const orderSchema = new mongoose.Schema({
    products: [{
        product : {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product',
            required: true,
        },
        
        quantity:{
            type:Number,
            required:true,
        },

        size : {
            type : String,
            required : true
        }
    }],

    orderDate: {
        type: Date,
        required: true
    },

    paymentMethod : {
        type: String,
        required : true
    },

    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },

    orderStatus : {
        type : String,
    },

    address : {
        type : Object,
        required : true
    },
    
    discount : {
        type : Number,
    },

    total : {
        type : Number
    },

    active : {
        type : Boolean
    },

    changeDate : {
        type : Date
    }
})

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;