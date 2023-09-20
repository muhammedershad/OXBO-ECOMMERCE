const users = require('../models/user');
const admin = require('../models/admin');
const bcrypt = require('bcrypt');
const { render } = require('ejs');
const category = require('../models/category');
const subcategoryData = require('../models/subcategory')
const productData = require('../models/product');
const multer = require('multer');
const uploadMiddleware= require('../middleware/multerSetup');
const orderData = require('../models/orders');
const product = require('../models/product');


module.exports = {

    dashPage : (req,res) => {
        res.render('adminDash')
    },

    usersPage : async (req,res) => {
        try {
            const user = await users.find()
            res.render('adminUsers',{users:user})
        } catch (error) {
            console.log(error);
        }
    },

    loginPage : async (req,res) => {
        try {
            const locals = {
                title : 'Admin Login',
                error:''
            }
            res.render('adminLogin',locals)
        } catch (error) {
            console.log(error);
        }
    },

    loginPost: async (req, res) => {
        try {
            const { email, password } = req.body;

            const existingAdmin = await admin.findOne({ email });

            if (!existingAdmin) {
                return res.render('adminLogin', { error: 'user_not_found' });
            }

            const isPasswordValid = await bcrypt.compare(password, existingAdmin.password);

            if (isPasswordValid) {
                req.session.admin = email;
                // console.log(req.session, 'adminlogin');
                res.cookie('name', 'express');

                return res.redirect('/admin');
            } else {
                return res.render('adminLogin', { error: 'incorrect_pass' });
            }
        } catch (error) {
            console.log(error);
            res.render('adminLogin', { error: 'user_not_found' });
        }
    },

    blockUser : async (req,res) => {
        const itemId = req.params.id; // Change 'id' to 'userId'
        // console.log(itemId);

        try {
            const user = await users.findById(itemId); // Change 'YourModel' to 'users'

            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            if(user.Blocked){
                await users.updateOne({_id:itemId},{$set:{Blocked:false}})
                user.Blocked=false
                console.log("jhsdjjgsfd");
            } else {
                await users.updateOne({_id:itemId},{$set:{Blocked:true}})
                user.Blocked=true
                console.log("BLOCKED");

            }

            res.status(200).json({ success: true, blockedStatus: user.Blocked });
        } catch (error) {
            console.error('Error toggling blocked status:', error);
            res.status(500).json({ success: false, message: 'Failed to toggle blocked status' });
        }
    },

    category : async (req,res) => {
        try {
            const categorylist = await category.find()
            res.render('adminCategory',{categorylist})
        } catch (error) {
            
        }
    },

    logout : async (req,res) => {
        try {
            req.session.destroy((err) => {
                if (err) {
                    console.log(err);
                }
                res.redirect('/admin/login');
            });
        } catch (error) {
            console.log(error);
        }
    },
    
    checkCategory: async (req, res) => {
        const { oneCategory } = req.query;
        
        try {
            const existingCategory = await category.findOne({ category: { $regex: new RegExp(oneCategory, 'i') } });

            res.json({ exists: !!existingCategory });
        } catch (error) {
            console.error('Error checking category:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    addCategory : async (req,res) => {
        try {
            const {categoryName,gender} = req.body;
            const newCategory = new category({
                gender : gender,
                category : categoryName,
                active : true,
                });

            await newCategory.save();
            console.log('category data saved');
            res.redirect('/admin/category');
        } catch (error) {
            console.log(error);
        }
    },

    listCategory : async (req,res) => {
        try {
            const categoryId = req.params.id;
            console.log(categoryId);
            const oneCategory = await category.findById(categoryId);

            if (!oneCategory) {
                return res.status(404).json({ success: false, message: 'category not found' });
            }

            if(oneCategory.active){
                await category.updateOne({_id:categoryId},{$set:{active:false}})
                oneCategory.active = false;
                console.log("unlisted");
            } else {
                await category.updateOne({_id:categoryId},{$set:{active:true}})
                oneCategory.active = true;
                console.log("listed");

            }

            res.status(200).json({ success: true, listedStatus: category.active });

        } catch (error) {
            console.log(error);
        }
    },

    updateCategory : async (req,res) => {
        try {
            const categoryId = req.params.id;
            console.log(categoryId);
            const {categoryName, gender} = req.body;

            const updatedCategory = await category.findByIdAndUpdate({_id:categoryId},{$set:{category:categoryName,gender:gender}});
    
            if (!updatedCategory) {
                return res.status(404).json({ success: false, message: 'Category not found' });
            }
            res.redirect('/admin/category')
        } catch (error) {
            console.log(error);
        }
    },

    addSubcategory: async (req, res) => {
        const categoryId = req.params.categoryId; // Get the category ID from the URL
        const { subcategoryName } = req.body; // Get subcategory name from the request body
        console.log(subcategoryName);
        try {
            // Find the category by ID
            const updatedCategory = await category.findByIdAndUpdate(
                categoryId,
                {
                    $push: {
                        subcategories: {
                            subcategory: subcategoryName,
                            active: true
                        }
                    }
                }
            );
    
            if (!updatedCategory) {
                return console.log('Failed in updating subcategory');
            }
    
            res.redirect('/admin/category');
        } catch (error) {
            console.error('Error adding subcategory:', error);
        }
    },

    listSubcategory: async (req, res) => {
        try {
            const categoryId = req.params.categoryId;
            const subcategoryName = req.params.subcategory;
    
            const oneCategory = await category.findById(categoryId);
            if (!oneCategory) {
                return res.status(404).json({ success: false, message: 'Category not found' });
            }
    
            const subcategoryObject = oneCategory.subcategories.find(subcategoryObj => subcategoryObj.subcategory === subcategoryName);
            if (!subcategoryObject) {
                return res.status(404).json({ success: false, message: 'Subcategory not found in the category' });
            }
    
            subcategoryObject.active = !subcategoryObject.active; // Toggle active state
    
            oneCategory.markModified('subcategories'); // Mark the subcategories array as modified
            await oneCategory.save();
    
            res.status(200).json({ success: true, updatedActiveState: subcategoryObject.active });
        } catch (error) {
            console.log(error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    },
    

    productPage : async (req,res) => {
        try {
            const productlist = await productData.find();
            res.render('adminProduct',{productlist});
        } catch (error) {
            console.log(error);
        }
    },

    productCategories : async(req,res) => {
        try {
            const gender = req.query.gender;
            const categories = await category.find({ gender: gender, active: true });
            res.json({ categories });
        } catch (error) {
            console.error('Error fetching categories:', error);
            res.status(500).json({ error: 'An error occurred while fetching categories' });
        }
    },

    productSubcategories: async (req, res) => {
        try {
            const categoryId = req.query.categoryId;
            // console.log(categoryId);
            const categoryData = await category.findById(categoryId);
            
            if (!categoryData) {
                return res.status(404).json({ success: false, message: 'Category not found' });
            }
            
            const subcategories = categoryData.subcategories.filter(subcategory => subcategory.active);
            // console.log(subcategories);
            res.json({ subcategories });
        } catch (error) {
            console.log(error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    },

    addProduct : async (req,res) => {
        try {
            // console.log(req.body);
            const {title, brand, gender, categoryId, description, subcategory, purchaseRate, paymentType, shippingCharge, MRP, discount, color, stockS, stockM, stockL, stockXL, stockXXL} = req.body;
            const images = req.files.map(file => file.path);
            const oneCategory = await category.findById(categoryId);
            const product = new productData({
                title: title,
                brand: brand,
                gender: gender,
                category : oneCategory.category,
                subcategory : subcategory,
                description : description,
                stock : { S : stockS,
                          M : stockM,
                          L : stockL,
                          XL : stockXL,
                          XXL : stockXXL
                        },
                image: images,
                purchaseRate: purchaseRate,
                paymentType: paymentType,
                shippingCharge: shippingCharge,
                MRP: MRP,
                discount: discount,
                color : color,
                active: true
            })
            await product.save();
            res.redirect('/admin/product');
        } catch (error) {
            console.log(error);
        }
    
    },

    editProduct : async (req,res) => {
        try {
            const {productId, title, brand, gender, categoryId, description, subcategory, purchaseRate, paymentType, shippingCharge, MRP, discount, color, stockS, stockM, stockL, stockXL, stockXXL} = req.body;
            const images = req.files.map(file => file.path);
            // console.log(images);
            // console.log(title, brand, gender, categoryId, description, subcategory, purchaseRate, paymentType, shippingCharge, MRP, discount, color, stockS, stockM, stockL, stockXL, stockXXL);
            const product = await productData.findById(productId)
            if(!product)
                return console.log('product not found');

            let oneCategory;
            console.log(categoryId);
            if (/[0-9]/.test(categoryId)) {
                // If categoryId includes a number, run the code
                oneCategory = await category.findById(categoryId);
                oneCategory = oneCategory.category
            } else {
                // If categoryId doesn't include a number, assign it to oneCategory
                oneCategory = categoryId;
            }

            if (images.length !== 0) {
                // Loop through each image in the 'images' array
                for (const imagePath of images) {
                    // Check if the image path is not in 'product.image'
                    if (!product.image.includes(imagePath)) {
                        // If not in 'product.image', push it to the array
                        product.image.push(imagePath);
                    }
                }
            }
            
            product.title = title
            product.brand = brand
            product.gender = gender
            product.category = oneCategory
            product.description = description
            product.subcategory = subcategory
            product.purchaseRate = purchaseRate
            product.paymentType = paymentType
            product.shippingCharge = shippingCharge
            product.MRP = MRP
            product.discount = discount
            product.color = color
            product.stock.S = stockS
            product.stock.M = stockM
            product.stock.L = stockL
            product.stock.XL = stockXL
            product.stock.XXL = stockXXL

            await product.save();
            
            res.redirect('/admin/product')

        } catch (error) {
            console.log(error);
        }
    },

    deleteimg: async (req, res) => {
        const { productId, index } = req.query;
        console.log(productId,index);
        try {
            const Product = await productData.findById(productId);
            
            if (!Product) {
                return res.status(404).json({ message: 'Product not found' });
            }
    
            // Check if the index is valid
            if (index >= 0 && index < Product.image.length) {
                Product.image.splice(index, 1);
                await Product.save();
                res.status(200).json({ message: 'Image deleted successfully', product: Product });
            } else {
                res.status(400).json({ message: 'Invalid index provided' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    listProduct: async (req,res) => {
        try {
            const productId = req.params.id;

            const product = await productData.findById(productId);

            if (!product) {
                return res.status(404).json({ success: false, message: 'product not found' });
            }

            if(product.active){
                await productData.updateOne({_id:productId},{$set:{active:false}})
                product.active = false;
            } else {
                await productData.updateOne({_id:productId},{$set:{active:true}})
                product.active = true;

            }

            res.status(200).json({ success: true, listedStatus: product.active });
        } catch (error) {
            console.log(error);
        }
    },

    orderListPage : async (req,res) => {
        try {
            const {orderStatus} = req.query
            let filter = {active:true}
            if(orderStatus){
                filter.orderStatus = orderStatus
            }

            const orders = await orderData.find(filter)
            .populate("products.product")
            .populate("user")
            .sort({ orderDate: -1 });

            console.log(orders);

            res.render('adminOrder',{orders,orderStatus})
        } catch (error) {
            console.log(error);
        }
    },

    updateStatus : async (req,res) => {
        try {
            const {orderId, status} = req.query;

            const order = await orderData.findById(orderId)
            const user = await users.findById(order.user)

            if((order.paymentMethod === 'onlinePayment' && status === 'Cancelled') || status === 'Returned'){
                user.wallet += order.total;
                order.refunded = true;
            }

            order.orderStatus = status
            order.changeDate = Date.now()

            await user.save();
            await order.save();
            res.redirect('/admin/orderList')

        } catch (error) {
            console.log(error);
        }
    },

    orderDetailsPage : async (req,res) => {
        try {
            const {orderId} = req.query
            
            const orders = await orderData.findById(orderId).populate("products.product")

            let subtotal = 0;
            for (let index = 0; index < orders.products.length; index++) {
                const product = orders.products[index].product;
                const quantity = orders.products[index].quantity;
                
                subtotal += product.MRP * quantity;
            }

            res.render('adminSide/orderDetails',{orders,subtotal})
        } catch (error) {
            console.log(error);
        }
    }

        
    

}