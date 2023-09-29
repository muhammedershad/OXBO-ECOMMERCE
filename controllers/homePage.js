const userData = require('../models/user');
const otpData = require('../models/otp');
require('dotenv').config();
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const productData = require('../models/product');
const { category } = require('./adminHome');
const categoryData = require('../models/category');
const { response } = require('express');
const orderData = require('../models/orders')
const couponData = require('../models/coupon')
const RazorPay = require('razorpay');
const bannerData = require('../models/banner');
const PDFDocument = require('pdfkit');
const puppeteer = require('puppeteer');
const ejs = require('ejs');
const path = require('path');
const pdfkit = require('pdfkit');
const fs = require('fs'); 
const pdf = require('pdf-creator-node');



async function sendOTP(email) {

    // Generate a random OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    // console.log('otp:',otp);
    try {
        stringOTP = otp.toString();
        const hashedOTP = await bcrypt.hash(stringOTP,10);
        // console.log('otp hashed');

        await otpData.deleteMany({ email : email });
        const otph = new otpData({
        email: email,
        otp: hashedOTP,
        createdAt: Date.now(),
        expriesAt: Date.now() + (60000 * 2) // Expires in 2 minutes
        });

        await otph.save();

    } catch (error) {
        console.log(error);
    }

    const transporter = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
            user: process.env.AUTH_EMAIL,
            pass: process.env.AUTH_PASS
        }
    });

    // Email configuration
    const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP is: ${otp}`
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        // console.log('Email sent:', info.response);
        return { success: true, message: 'OTP sent successfully' };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, message: 'Failed to send OTP' };
    }
}

const instance = new RazorPay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

function isValidEmail(email) {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email);
}


module.exports = {

    HomePage : async (req,res,next) => {
        try {
            const banner = await bannerData.find({active : true});

            let user
            if (req.session.user) {
                user = await userData.findOne({ email: req.session.user });
            }
            
            const locals = {
                title : 'OXBO',
                banner,
                user
            }
            res.render('userSide/home',locals);
        } catch (error) {
            const err = new Error(error)
            err.statusCode = 500
            err.error = 'Error in loading home page'
            return next(err)
        }
    
    },

    loginPage : async (req,res,next) => {
        try {
            let user
            const email = req.session.user
            const locals = {
                title : 'Login',
                error: '',
                user
            }
            if(req.query.message){
                locals.error = req.query.message
            }
            res.render('login',locals);

        } catch (error) {
            const err = new Error(error)
            err.statusCode = 500
            err.error = 'Error in loading login page.'
            return next(err)
        }
    },

    postLogin: async (req, res, next) => {

        try {
            const {email , password} = req.body;

            if (!isValidEmail(email)) {
                return res.redirect('/login?message=invalid_email')
            }

            const user = await userData.findOne({email : email});
            if(!user){
                return res.redirect('login?message=user_not_found')
            }
            
            const passMatch = await bcrypt.compare(password, user.password);
            if (passMatch) {

                if(user.Blocked){
                    return res.redirect('login?message=user_blocked')

                } else {
                    
                    req.session.user = email;
                    res.cookie('name', 'express');

                    res.redirect('/');
                }
                
            } else {

                return res.redirect('login?message=incorrect_pass')
            }

        } catch (error) {
            const err = new Error(error)
            err.statusCode = 500
            err.error = 'Error in user login.'
            return next(err)
        }

    },

    signupPage : async (req,res,next) => {
        try {
            let user
            const locals = {
                title : 'SignUp',
                error:'',
                user
            }
            if(req.query.message){
                locals.error = req.query.message
            }
            res.render('signup',locals);
        } catch (error) {
            const err = new Error(error)
            err.statusCode = 500
            err.error = 'Error in loading signup page.'
            return next(err)
        }
    },

    otpPage : async (req,res,next) => {
        try {
            let user
            const locals = {
                title : 'SignUp',
                error: '',
                user
            }
            if(req.query.message){
                locals.error = req.query.message
            }
            res.render('otp',locals);
        } catch (error) {
            const err = new Error(error)
            err.statusCode = 500
            err.error = 'Error in otp verification page.'
            return next(err)
        }
    },

    postSignup : async (req,res,next) => {
        const { email, phoneNumber, password, rePassword } = req.body;

        try {

            if (!isValidEmail(email)) {
                return res.redirect('/signup?message=invalid_email')
            } else {
                const existingUser = await userData.findOne({ email });
                if(existingUser){
                    return res.redirect('/signup?message=email_already_exists')
                }
            }

            const phonePattern = /^[0-9]{10}$/;

            if (!phonePattern.test(phoneNumber.trim())) {
                return res.redirect('/signup?message=invalid_phoneNumber')
            } 

            if (password.trim().length < 8) {
                return res.redirect('/signup?message=invalid_password')
            } 
            if (password.trim() !== rePassword.trim()) {
                return res.redirect('/signup?message=password_not_matching')
            } 


            const hashedPassword = await bcrypt.hash(password,10);
            req.session.formData = { email, phoneNumber, password : hashedPassword}

            await sendOTP(email);

            await res.redirect('/otp');

        } catch (error) {
            console.log(error);
            const err = new Error(error)
            err.statusCode = 500
            err.error = 'Error in loading signup page.'
            return next(err)
        }

    },

    checkEmailExists : async (req, res, next) => {
        const { email } = req.query;
        try {
            const existingUser = await userData.findOne({ email });
            res.json({ exists: !!existingUser });
        } catch (error) {
            const err = new Error(error)
            err.statusCode = 500
            err.error = 'Error in checking email.'
            return next(err)
        }
    },

    verifyOTP : async (req, res, next) => {

        const { enteredOTP } = req.body;
        // console.log(req.session.formData);
        const userSession = req.session.formData;

        if (enteredOTP.trim().length !== 6 || isNaN(enteredOTP)) {
            return res.redirect('/otp?message=incorrect_otp');
        }
        
        // console.log('entered otp:',enteredOTP);

        try {
            const user = await otpData.findOne({ email: userSession.email });
        
            if (!user) {
              console.log('User not found');
              return;
            }

            // console.log(user);
            const hashedOTP = user.otp;
            const otpExpiryTime = user.expriesAt;

            
            // Use hashedOTP and otpExpiryTime as needed
            // console.log('Hashed OTP:', hashedOTP);
            // console.log('OTP Expiry Time:', otpExpiryTime);

            const otpMatch = await bcrypt.compare(enteredOTP, hashedOTP);

            if(otpMatch){
                if(Date.now() < otpExpiryTime){
                    const newUser = new userData({
                    email: userSession.email,
                    phoneNumber: userSession.phoneNumber,
                    password: userSession.password,
                    Blocked: false,
                    created: Date(),
                    wallet: 0,
                    });
                    await newUser.save();
                    // console.log('user data saved');
                    await res.redirect('/login');
                } else {
                    return res.render('otp', { error: 'timeout_otp' });
                }
    
            }else{
                // console.log('Entered OTP is incorrect');
                // Redirect to the OTP page with an error message
                res.redirect('/otp?message=incorrect_otp');
            }

        } catch (error) {
            console.log(error);
            const err = new Error(error)
            err.statusCode = 500
            err.error = 'Error in verifying otp.'
            return next(err)
        }

        
    },

    resendOTP : async (req,res,next) => {
        try {
            const email = req.session.formData.email;
            await sendOTP(email);
            await res.redirect('/otp');
        } catch (error) {
            const err = new Error(error)
            err.statusCode = 500
            err.error = 'Error in resending otp.'
            return next(err)
        }
    },

    forgotPassPage: async (req, res, next) => {
        try {
            let User
            const locals = {
                title : 'Login',
                error : '',
                user
            }
            res.render('forgotPass',locals)
        } catch (error) {
            const err = new Error(error)
            err.statusCode = 500
            err.error = 'Error in loading forgot password page.'
            return next(err)
        }
    },

    forgotPass : async (req, res, next) => {
        try {
            const {email} = req.body;
            const user = await userData.findOne({email:email});
            if(!user){
                return res.render('forgotpass',{error:'user_not_found'});
            }

            req.session.formData = { email }
            await sendOTP(email);
            
            await res.redirect('/forgotPassOTP')

        } catch (error) {
            const err = new Error(error)
            err.statusCode = 500
            err.error = 'Error in loading signup page.'
            return next(err)
        }
    },
    
    forgotPassOTP : async (req, res, next) => {
        try {
            let user
            const locals = {
                error : '',
                title : 'login',
                user
            }
            res.render('forgotPassOTP',locals);
        } catch (error) {
            const err = new Error(error)
            err.statusCode = 500
            err.error = 'Error in verifying otp page.'
            return next(err)
        }
    },

    forgotPassVerifyOTP : async (req, res, next) => {
        const { enteredOTP } = req.body;
        const userSession = req.session.formData;

        try {
            const user = await otpData.findOne({ email: userSession.email });
        
            if (!user) {
              console.log('User not found');
              return res.render('forgotPassOTP',{error: 'user_not_found' })
            }

            // console.log(user);
            const hashedOTP = user.otp;
            const otpExpiryTime = user.expriesAt;

            
            // Use hashedOTP and otpExpiryTime as needed
            // console.log('Hashed OTP:', hashedOTP);
            // console.log('OTP Expiry Time:', otpExpiryTime);

            const otpMatch = await bcrypt.compare(enteredOTP, hashedOTP);

            if(otpMatch){
                if(Date.now() < otpExpiryTime){
                    
                    await res.redirect('/changePass');
                } else {
                    return res.render('forgotPassOTP', { error: 'timeout_otp' });
                }
    
            }else{
                console.log('Entered OTP is incorrect');
                // Redirect to the OTP page with an error message
                res.render('forgotPassOTP', { error: 'incorrect_otp' });
            }

        } catch (error) {
            const err = new Error(error)
            err.statusCode = 500
            err.error = 'Error in otp verification.'
            return next(err)

        }
    },

    changePassPage : async (req, res, next) => {
        try {
            let user
            res.render('changePass',{error : '',user})
        } catch (error) {
            const err = new Error(error)
            err.statusCode = 500
            err.error = 'Error in loading password change page.'
            return next(err)
        }
    },
    
    changePass : async (req, res, next) => {
        try {
            const {password} = req.body;
            const hashedPassword = await bcrypt.hash(password,10);
            const userSession = req.session.formData;
            await userData.findOneAndUpdate({email:userSession.email},{$set:{password:hashedPassword}});
            await res.redirect('/login');
        } catch (error) {
            res.redirect('/changePass');
            const err = new Error(error)
            err.statusCode = 500
            err.error = 'Error in changing password.'
            return next(err)
        }
    },

    productPage: async (req, res, next) => {
        try {
            const { encodedCategory, encodedSubCategory, number, encodedSearch, gender, min, max } = req.query;

            let minNum
            let maxNum
            if(min && max){
                minNum = parseFloat(min)
                maxNum = parseFloat(max)
            }

            let search;
            if (encodedSearch) {
                search = decodeURIComponent(encodedSearch);
            }

            let category
            if(encodedCategory){
                 category = decodeURIComponent(encodedCategory);
            }

            let subCategory
            if(encodedSubCategory){
                 subCategory = decodeURIComponent(encodedSubCategory);
            }

            let regexPattern
            let filter ={}
            if (search) {
                const regexPattern = new RegExp(search, 'i');
                filter = {
                    active : true,
                    title: {
                        $regex: regexPattern,
                    },
                }
            }

            if(gender){
                filter.gender = gender
            }

            if(category){
                filter.category = category
            }

            if(subCategory){
                filter.subcategory = subCategory
            }

            if (typeof minNum === 'number' && typeof maxNum === 'number') {
                filter.MRP = {
                    $gte: minNum,
                    $lte: maxNum
                };
            }

            const perPage = 12; 
            const currentPage = parseInt(req.query.page) || 1; // Get the current page number from the query parameter
    
            // Calculate the skip value based on the current page and products per page
            const skip = (currentPage - 1) * perPage;

            let sort = {};
    
            if (number === '1') {
                sort = { MRP: 1 }; 
            } else if (number === '-1') {
                sort = { MRP: -1 }; 
            }
    
            const productlist = await productData
                .find(filter)
                .sort(sort)
                .skip(skip)
                .limit(perPage)
                .exec();
    
            const totalProducts = await productData
                .countDocuments(filter)
                .exec();
    
            const totalPages = Math.ceil(totalProducts / perPage);

            let categorylist
            if(gender){
                categorylist = await categoryData.find({ active: true, gender: gender });
            } else {
                categorylist = await categoryData.find({ active: true });
            }

            let user
            if(req.session.user){
                const {email} = req.session.user
                user = await userData.findOne({ email : email})
            }
            const locals = {
                min,
                max,
                encodedSearch,
                number,
                gender,
                category,
                categorylist: categorylist,
                productlist: productlist,
                title: 'Mens',
                currentPage: currentPage,
                totalPages: totalPages,
                user
            };
    
            res.render('userSide/products', locals);
        } catch (error) {
            const err = new Error(error)
            err.statusCode = 500
            err.error = 'Error in loading product page.'
            return next(err)
        }
    },

    productPage2 : async (req, res, next) => {
        try {
            const productlist = await productData.find({active:true,gender:'Female'});
            const categorylist = await categoryData.find({active:true,gender:'Female'});
            const locals = {
                categorylist: categorylist,
                productlist : productlist,
                title : 'Mens',
            }
            res.render('products',locals);
        } catch (error) {
            const err = new Error(error)
            err.statusCode = 500
            err.error = 'Error in loading product page.'
            return next(err)
        }
    },
    
    productDetail : async (req, res, next) => {
        try {
            let user
            if(req.session.user){
                const {email} = req.session.user
                user = await userData.findOne({ email : email})
            }
            const {productId} = req.query;
            // console.log(productId);
            const product = await productData.findById(productId)
            // console.log(product);
            res.render('userSide/productDetail',{product,user})
        } catch (error) {
            const err = new Error(error)
            err.statusCode = 500
            err.error = 'Error in loading product details page.'
            return next(err)
        }
    },

    addToCart : async (req, res, next) => {
        try {
            const {productId, size} = req.query;
            const email = req.session.user

            const user = await userData.findOne({email:email});
            const product = await productData.findOne({_id:productId});

            if(!user)
                console.log('user not found');
            else{
                const existingProductIndex = user.cart.findIndex(item => item.product._id.toString() === productId && item.size === size);

                if (existingProductIndex !== -1) {
                  
                    user.cart[existingProductIndex].quantity += 1;
                    user.cart[existingProductIndex].subTotal += product.MRP;
                    const productAdded = await user.save();
                    // res.json({ message:!! productAdded });
                    return res.json({success : true})
                } else {
                  
                    const product = await productData.findOne({ _id: productId });
                    if (!product) {
                        console.log('Product not found');
                    } else {
                        oneProduct = {
                            product : product,
                            size : size,
                            subTotal : product.MRP
                        }
                        const productAdded = await userData.findOneAndUpdate({email:email},{$push:{cart:oneProduct}});
                        // res.json({ message:!! productAdded });
                        return res.json({success : true})
                    }
                }
                return res.json({success : true})
            }
            
        } catch (error) {
            const err = new Error(error)
            err.statusCode = 500
            err.error = 'Error in product adding to cart.'
            return next(err)
        }
    },
    
    accountPage: async (req, res, next) => {
        try {
            const email = req.session.user
            const user = await userData.findOne({email:email});
            res.render('myAccount',{user});
        } catch (error) {
            const err = new Error(error)
            err.statusCode = 500
            err.error = 'Error in loading account page.'
            return next(err)
        }
    },

    newAddressPage : async (req, res, next) => {
        try {
            const email = req.session.user
            const user = await userData.findOne({email:email});
            res.render('newAddress',)
        } catch (error) {
            const err = new Error(error)
            err.statusCode = 500
            err.error = 'Error in loading address page.'
            return next(err)
        }
    },

    cartPage : async (req, res, next) => {
        try {
            const email = req.session.user
            const user = await userData.findOne({email:email})
            const coupon = await couponData.find({ active: true, expiresAt: { $gt: Date.now() } });
            const banner = await bannerData.find({active : true})
            const offerlist = {};
            
            res.render('cart',{user,coupon})
        } catch (error) {
            const err = new Error(error)
            err.statusCode = 500
            err.error = 'Error in loading cart page.'
            return next(err)
        }
    },

    cartRemoveProduct : async (req, res, next) => {
        const {userId,index} = req.query;
        try {
            // console.log(productId,index);
            const user = await userData.findById(userId)
            // console.log(user);
            await user.cart.splice(index, 1);
            const productAdded = await user.save();
            res.redirect('/cart')

        } catch (error) {
            const err = new Error(error)
            err.statusCode = 500
            err.error = 'Error in removing prodcut from cart.'
            return next(err)
        }
    },

    cartUpdateProductQuantity: async (req, res, next) => {
        try {
          const { userId, index, quantity } = req.query;
          const oneUser = await userData.findById(userId);
      
          // Calculate the subtotal
          const subTotal = oneUser.cart[index].product.MRP * quantity;
      
          // Update the user's cart with the new quantity and subtotal
          const updatedUser = await userData.findOneAndUpdate(
            { _id: userId },
            {
              $set: {
                [`cart.${index}.quantity`]: quantity,
                [`cart.${index}.subTotal`]: subTotal,
              },
            },
            { new: true } // To return the updated user document
          );
      
          // Send the updated user document as a response
          res.json(updatedUser);
        } catch (error) {
            const err = new Error(error)
            err.statusCode = 500
            err.error = 'Error in updating product quantity in cart'
            return next(err)
        }
      },
      

    ckeckoutPage : async (req, res, next) => {
        try {
            const email = req.session.user
            const couponAmount = req.session.coupon || 0.00;
            // console.log(couponAmount);
            const user = await userData.findOne({email:email});
            res.render('checkOut',{user,couponAmount})
        } catch (error) {
            const err = new Error(error)
            err.statusCode = 500
            err.error = 'Error in loading checkout page.'
            return next(err)
        }
    },

    addAddress : async (req, res, next) => {
        try {
            const { name, address, city, state, country, pincode, mobileNumber } = req.body;
            const email = req.session.user;
            console.log(name, address, city, state, country, pincode, mobileNumber, email);
            const user = await userData.findOneAndUpdate(
                { email: email },
                {
                    $push: {
                        address: {
                            name: name,
                            address: address,
                            city: city,
                            state: state,
                            country: country, 
                            pincode: pincode,
                            mobileNumber: mobileNumber
                        }
                    }
                }
            );
            // if(user.address.length === 0){
            //     const user = await userData.findOneAndUpdate(
            //         { email: email },
            //         {
            //             $set: {
            //                 defaultAddress: {
            //                     name: name,
            //                     address: address,
            //                     city: city,
            //                     state: state,
            //                     country: country, 
            //                     pincode: pincode,
            //                     mobileNumber: mobileNumber
            //                 }
            //             }
            //         }
            //     );
            // }
            // console.log(user);
            res.redirect('/checkout');
        } catch (error) {
            const err = new Error(error)
            err.statusCode = 500
            err.error = 'Error in adding new address.'
            return next(err)
        }
    },

    editAddress : async (req, res, next) => {
        try {
            // console.log(req.query);
            // console.log(req.body);
            const {userId,index} = req.query
            const { name, address, city, state, country, pincode, mobileNumber } = req.body;

            const user = await userData.findOneAndUpdate(
                {_id:userId},
                {$set:{
                    [`address.${index}.name`]: name,
                    [`address.${index}.address`]: address,
                    [`address.${index}.city`]: city,
                    [`address.${index}.state`]: state,
                    [`address.${index}.country`]: country,
                    [`address.${index}.pincode`]: pincode,
                    [`address.${index}.mobileNumber`]: mobileNumber,
                }})
                res.redirect('/cart')
        } catch (error) {
            const err = new Error(error)
            err.statusCode = 500
            err.error = 'Error in editing address.'
            return next(err)
        }
    },

    deleteAddress : async (req, res, next) => {
        try {
            // console.log(req.query);
            const {userId, index} = req.query
            const user = await userData.findOne({_id:userId})
            user.address.splice(index,1);
            await user.save();
            res.redirect('/checkout')
        } catch (error) {
            const err = new Error(error)
            err.statusCode = 500
            err.error = 'Error in deleting address.'
            return next(err)
        }
    },

    makeDefaultAddress : async (req, res, next) => {
        try {
            const {userId, index} = req.query
            // console.log(userId,index);
            const user = await userData.findOne({_id:userId})
            user.address.unshift(user.address.splice(index,1)[0]);
            await user.save();
            res.redirect('/checkout')

        } catch (error) {
            const err = new Error(error)
            err.statusCode = 500
            err.error = 'Error in making address default.'
            return next(err)
        }
    },

    placeOrder : async (req, res, next) => {
        try {
            const {walletSelected, paymentMethod,addressIndex,userId, discount, total} = req.body
            // console.log(paymentMethod,addressIndex,userId, discount, total);

            const user = await userData.findOne({_id : userId});

                const order = await new orderData({
                    user : user._id,
                    paymentMethod : paymentMethod,
                    orderStatus : 'Order confirmed',
                    orderDate : Date.now(),
                    address : user.address[addressIndex],
                    discount : discount,
                    total : total,
                    products: [],
                    active : false,
                    refunded : false,
                    changeDate : Date.now()

                })
                await user.save();

                for (let index = 0; index < user.cart.length; index++) {
                    const cartItem = user.cart[index];
                    const productDatas = {
                      product: cartItem.product._id,
                      quantity: cartItem.quantity,
                      size: cartItem.size,
                    };
                    order.products.push(productDatas);
                  
                    
                    const product = await productData.findById(cartItem.product._id);
                  
                    if (product) {
                    //   console.log(product);
                  
                      // Dynamically update the stock based on cartItem.size
                      product.stock[cartItem.size] -= cartItem.quantity;
                  
                      // Save the updated product
                      await product.save();
                    }
                }
                  
                await order.save();
    
    
                delete req.session.coupon

            if(paymentMethod === 'cashOnDelivery'){
                
                order.active = true;
                await order.save();
                user.cart.splice(0);
                await user.save();
    
                res.json({ success: true });

            }  else if (paymentMethod === 'onlinePayment') {

                let amount = 0
                if(walletSelected){
                    amount = total - user.wallet
                    if (amount < 0){
                        amount = 0;
                    } else {
                        amount = amount * 100;
                    }
                } else {
                    amount = total*100
                }

                if (amount === 0){
                    user.wallet = user.wallet - total
                    order.active = true;
                    await order.save();
                    user.cart.splice(0);
                    await user.save();
                    res.json({ success: true });
                }

                
                let options = {
                    amount: amount,  // amount in the smallest currency unit
                    currency: "INR",
                    receipt: order._id
                  };

                  instance.orders.create(options, (err, order) => {
                    if(!err){

                        res.status(200).json({order})
                        console.log(order);
                    } else {
                        console.log(err);
                    }
                });
            }


            

        } catch (error) {
            const err = new Error(error)
            err.statusCode = 500
            err.error = 'Error in placing order.'
            return next(err)
        }
    },

    orderListPage : async (req, res, next) => {
        try {
            const email = req.session.user
            // console.log(email);
            
            const user = await userData.findOne({email : email})
            const orders = await orderData.find({user:user._id, active : true}).populate("products.product").sort({ orderDate: -1 })
            
            res.render('orderlist',{user,orders})
        } catch (error) {
            // console.log(error);
            const err = new Error(error)
            err.statusCode = 500
            err.error = 'Some error occured in order list page loading'
            return next(err)
        }
    },

    logout : async (req, res, next) => {
        try {
            req.session.destroy((err) => {
                if (err) {
                    console.log(err);
                }
                res.redirect('/login');
            });
        } catch (error) {
            const err = new Error(error)
            err.statusCode = 500
            err.error = 'Error in logouting user.'
            return next(err)
        }
    },

    OrderDetailsPage : async (req, res, next) => {
        try {
            const {orderId} = req.query
            const orders = await orderData.findById(orderId).populate("products.product")

            let subtotal = 0;
            for (let index = 0; index < orders.products.length; index++) {
                const product = orders.products[index].product;
                const quantity = orders.products[index].quantity;
                
                subtotal += product.MRP * quantity;
            }

            res.render('userSide/orderDetails',{orders,subtotal})
        } catch (error) {
            const err = new Error(error)
            err.statusCode = 500
            err.error = 'Error in loading order details page.'
            return next(err)
        }
    },

    cancelOrder : async (req, res, next) => {
        try {
            console.log('cancel');
            const {orderId} = req.query
            const {reason,orderStatus} = req.body
   
            const order = await orderData.findById(orderId)
            
            if(orderStatus === 'Delivered'){
                order.orderStatus = 'Return Requested'
            } else {
                order.orderStatus = 'Cancel Requested'
            }

            order.changeDate = Date.now();
            order.reason = reason

            await order.save();
            res.redirect(`/orderDetails?orderId=${orderId}`)

        } catch (error) {
            const err = new Error(error)
            err.statusCode = 500
            err.error = 'Error in cancelling order.'
            return next(err)
        }
    },

    addToWishlist: async (req, res, next) => {
        try {
            console.log(req.body);
          const { productId } = req.body;
          const email = req.session.user;
      
          const user = await userData.findOne({ email: email });
      
          if (user) {
            if (!user.wishlist.includes(productId)) {

              user.wishlist.push(productId);
              await user.save();
              console.log('Product added to wishlist successfully.');
              res.status(200).json({ message: 'Product added to wishlist successfully' });

            } else {

              console.log('Product already exists in the wishlist.');
              res.status(200).json({ message: 'Product already exists in the wishlist' });
            }
          } else {

            console.log('User not found.');
            res.status(404).json({ message: 'User not found' });
          }
        } catch (error) {
            const err = new Error(error)
            err.statusCode = 500
            err.error = 'Error in product adding to wishlist.'
            return next(err)
        }
    },

    confirmOrder : async (req, res, next) => {
        try {
            const {response, orderId} = req.query;
            const email = req.session.user

            const oneOrder = await orderData.findOne({_id : orderId})
            oneOrder.active = true
            oneOrder.save();

            const user = await userData.findOne({email: email});
            user.cart.splice(0);
            user.wallet = 0;
            await user.save();

        } catch (error) {
            // console.log(error);
            const err = new Error(error)
            err.statusCode = 500
            err.error = 'Error in confirm Order'
            return next(err)
        }
    },

    invoicePage : async (req, res, next) => {
        try {
            const orderId = req.params.orderId;
            const order = await orderData.findById(orderId).populate('products.product');

            res.render('userSide/invoice',{order})

        } catch (error) {
            const err = new Error(error)
            err.statusCode = 500
            err.error = 'Error in loading invoice'
            return next(err)
        }
    },

    wishlistPage : async (req, res, next) => {
        try {
            const email = req.session.user

            const user = await userData.findOne({email : email}).populate('wishlist')
            
            res.render('userSide/wishlist', {user})

        } catch (error) {
            const err = new Error(error)
            err.statusCode = 500
            err.error = 'Error in loading wishlist page'
            return next(err)
        }
    },

    removeFromWishlist : async (req, res, next) => {
        try {
            const productId = req.params.productId
            const index = req.params.index
            const email = req.session.user

            const user = await userData.findOne({email : email})
            
            user.wishlist.splice(index,1)
            await user.save()
            res.json({status : 'success'})

        } catch (error) {
            const err = new Error(error)
            err.statusCode = 500
            err.error = 'Error in loading wishlist page'
            return next(err)
        }
    }

}
