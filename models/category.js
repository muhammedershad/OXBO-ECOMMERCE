// const mongoose = require('mongoose')

// const categorySchema = new mongoose.Schema({
//     gender: {
//         type: String,
//         required: true,
//     },
//     category:{
//         type: String,
//         required: true,
//         unique: true
//     },
//     active : {
//         type: Boolean,
//         required: true
//     },
    
// })

// const category = mongoose.model('category', categorySchema);

// module.exports = category;

const mongoose = require('mongoose');
const Subcategory = require('./subcategory');

const categorySchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        unique: true
    },
    gender: {
        type: String,
        required: true,
    },
    active: {
        type: Boolean,
        required: true
    },
    subcategories: [{
        subcategory : String,
        active : Boolean,
    }],
});

const Category = mongoose.model('Category', categorySchema);

module.exports =  Category ;
