require('dotenv').config();
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const morgan = require('morgan');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const connect = require('./models/config')
const userRoute = require('./routes/user');
const adminRoute = require('./routes/admin');
const multerSetup = require('./middleware/multerSetup');


const app = express();
const PORT = process.env.PORT || 4000; 

app.use(express.static('public'));
app.use('/images', express.static('images'));
app.use('/images',express.static(path.join(__dirname, 'images')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));
app.use(multer({dest:'images',storage: multerSetup}).array('images',6)); 
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));

app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, must-revalidate');
    next();
});

connect();

app.use(expressLayouts);
app.set('layout','./layout/main');
app.set('view engine', 'ejs');

app.use('/', userRoute);
app.use('/admin',adminRoute);
app.use('*', (req,res)=>{res.render('404')})

app.listen(PORT , () => console.log(`server running in port ${PORT}`));