
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
