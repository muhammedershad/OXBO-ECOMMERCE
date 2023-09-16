const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },

    active: {
        type: Boolean,
        required: true
    },
});

const Subcategory = mongoose.model('Subcategory', subcategorySchema);

module.exports =  Subcategory ;