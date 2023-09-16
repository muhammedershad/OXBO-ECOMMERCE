const mongoose = require('mongoose');
require('dotenv').config();

module.exports = async function connect(){
    try {
        const dbURI = process.env.dbURI;
        await mongoose.connect(dbURI,{
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        console.log('connected to MongoDB');
    } catch (error) {
        console.log('error in mongodb connnecting',error);
    }
}