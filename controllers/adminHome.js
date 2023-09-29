const users = require("../models/user");
const admin = require("../models/admin");
const bcrypt = require("bcrypt");
const { render } = require("ejs");
const category = require("../models/category");
const subcategoryData = require("../models/subcategory");
const productData = require("../models/product");
const multer = require("multer");
const uploadMiddleware = require("../middleware/multerSetup");
const orderData = require("../models/orders");
const product = require("../models/product");
const { Parser } = require("json2csv");
const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

module.exports = {
  dashPage: async (req, res, next) => {
    try {
      const pipeline1 = [
        {
          $match: {
            active: true,
          },
        },
        {
          $group: {
            _id: null,
            totalOrders1: { $sum: 1 },
          },
        },
      ];

      const result1 = await orderData.aggregate(pipeline1);
      const totalOrders1 = result1[0] ? result1[0].totalOrders1 : 0;

      const pipeline = [
        {
          $match: {
            active: true,
            orderStatus: {
              $nin: ["Cancelled", "Returned"],
            },
          },
        },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: "$total" },
            products: { $push: "$products" },
          },
        },
        {
          $unwind: "$products",
        },
        {
          $unwind: "$products",
        },
        {
          $lookup: {
            from: "products",
            localField: "products.product",
            foreignField: "_id",
            as: "productInfo",
          },
        },
        {
          $unwind: "$productInfo",
        },
        {
          $project: {
            _id: 0,
            totalOrders: 1,
            totalRevenue: 1,
            totalPurchaseAmount: {
              $sum: {
                $multiply: ["$products.quantity", "$productInfo.purchaseRate"],
              },
            },
          },
        },
        {
          $group: {
            _id: null,
            totalOrders: { $first: "$totalOrders" },
            totalRevenue: { $first: "$totalRevenue" },
            totalPurchaseAmount: { $sum: "$totalPurchaseAmount" },
          },
        },
        {
          $project: {
            _id: 0,
            totalOrders: 1,
            totalRevenue: 1,
            totalPurchaseAmount: 1,
            profit: { $subtract: ["$totalRevenue", "$totalPurchaseAmount"] },
          },
        },
      ];

      const result = await orderData.aggregate(pipeline);

      const { totalOrders, totalRevenue, totalPurchaseAmount, profit } =
        result[0] || {
          totalOrders: 0,
          totalRevenue: 0,
          totalPurchaseAmount: 0,
          profit: 0,
        };

      const targetYear = 2023;

      const pipeline3 = [
        {
          $match: {
            active: true,
            orderDate: {
              $gte: new Date(`${targetYear}-01-01`),
              $lt: new Date(`${targetYear + 1}-01-01`),
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m",
                date: "$orderDate",
              },
            },
            totalOrders: { $sum: 1 },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ];

      const monthlyOrderData = await orderData.aggregate(pipeline3);

      function fillMissingMonths(monthlyOrderData) {
        const resultArray = [];
        const monthsMap = new Map();

        for (const monthData of monthlyOrderData) {
          monthsMap.set(monthData._id, monthData.totalOrders);
        }

        for (let month = 1; month <= 12; month++) {
          const monthKey = `2023-${month.toString().padStart(2, "0")}`;
          const orders = monthsMap.get(monthKey) || 0;
          resultArray.push(orders);
        }

        return resultArray;
      }

      const monthlyOrdersArray = fillMissingMonths(monthlyOrderData);

      const categorySales = await orderData
        .aggregate([
          {
            $match: { active: true }, // Filter active orders
          },
          {
            $unwind: "$products", // Split the products array into separate documents
          },
          {
            $lookup: {
              from: "products", // The name of your products collection
              localField: "products.product",
              foreignField: "_id",
              as: "productInfo",
            },
          },
          {
            $unwind: "$productInfo", // Unwind the productInfo array
          },
          {
            $group: {
              _id: "$productInfo.category", // Group by category
              totalQuantitySold: { $sum: "$products.quantity" }, // Sum the quantity for each category
            },
          },
          {
            $project: {
              _id: 0, // Exclude the _id field
              category: "$_id", // Rename _id to category
              totalQuantitySold: 1, // Include the totalQuantitySold field
            },
          },
        ])
        .exec();

      const categories = categorySales.map((item) => item.category);
      const quantities = categorySales.map((item) => item.totalQuantitySold);


      const currentYear = 2023

      const pipeline4 = [
        {
          $match: {
            active: true,
            orderStatus: {
              $nin: ["Cancelled", "Returned"],
            },
            createdAt: {
              $gte: new Date(currentYear, 0, 1), // Start of the current year
              $lt: new Date(currentYear + 1, 0, 1), // Start of the next year
            },
          },
        },
        {
          $group: {
            _id: {
              month: { $month: "$createdAt" },
            },
            totalRevenue: { $sum: "$total" },
          },
        },
        {
          $sort: {
            "_id.month": 1,
          },
        },
        {
          $project: {
            _id: 0,
            month: "$_id.month",
            totalRevenue: 1,
          },
        },
      ];
      
      const revenuePerMonth = await orderData.aggregate(pipeline4);

      const data = {
        totalOrders1,
        totalRevenue,
        totalPurchaseAmount,
        profit,
        monthlyOrdersArray,
        categories,
        quantities,
      };

      res.render("adminDash", { data });
    } catch (error) {
      const err = new Error(error);
      err.statusCode = 500;
      err.error = "Error in loading admin dash";
      return next(err);
    }
  },

  totalOders: async (req, res, next) => {
    try {
      const { totalOrderFromDate, totalOrderToDate } = req.query;

      const fromDate = new Date(totalOrderFromDate);
      const toDate = new Date(totalOrderToDate);

      const pipeline = [
        {
          $match: {
            active: true,
            orderDate: {
              $gte: fromDate,
              $lte: toDate,
            },
          },
        },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
          },
        },
      ];

      const result = await orderData.aggregate(pipeline);
      const totalOrders = result[0] ? result[0].totalOrders : 0;

      res.json({ totalOrders });
    } catch (error) {
      const err = new Error(error);
      err.statusCode = 500;
      err.error = "Error in getting total orders";
      return next(err);
    }
  },

  totalRevenue: async (req, res, next) => {
    try {
      const { totalRevenueFromDate, totalRevenueToDate } = req.query;

      const fromDate = new Date(totalRevenueFromDate);
      const toDate = new Date(totalRevenueToDate);

      const pipeline = [
        {
          $match: {
            active: true,
            orderStatus: {
              $nin: ["Cancelled", "Returned"],
            },
            orderDate: {
              $gte: fromDate,
              $lte: toDate,
            },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$total" },
          },
        },
      ];

      const result = await orderData.aggregate(pipeline);
      const totalRevenue = result[0] ? result[0].totalRevenue : 0;

      res.json({ totalRevenue });
    } catch (error) {
      const err = new Error(error);
      err.statusCode = 500;
      err.error = "Error in getting total revenue";
      return next(err);
    }
  },

  profit: async (req, res, next) => {
    try {
      console.log(req.query);
      const { profitFromDate, profitToDate } = req.query;

      const fromDate = new Date(profitFromDate);
      const toDate = new Date(profitToDate);

      const pipeline = [
        {
          $match: {
            active: true,
            orderDate: {
              $gte: fromDate,
              $lte: toDate,
            },
            orderStatus: {
              $nin: ["Cancelled", "Returned"],
            },
          },
        },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: "$total" },
            products: { $push: "$products" },
          },
        },
        {
          $unwind: "$products",
        },
        {
          $unwind: "$products",
        },
        {
          $lookup: {
            from: "products",
            localField: "products.product",
            foreignField: "_id",
            as: "productInfo",
          },
        },
        {
          $unwind: "$productInfo",
        },
        {
          $project: {
            _id: 0,
            totalOrders: 1,
            totalRevenue: 1,
            totalPurchaseAmount: {
              $sum: {
                $multiply: ["$products.quantity", "$productInfo.purchaseRate"],
              },
            },
          },
        },
        {
          $group: {
            _id: null,
            totalOrders: { $first: "$totalOrders" },
            totalRevenue: { $first: "$totalRevenue" },
            totalPurchaseAmount: { $sum: "$totalPurchaseAmount" },
          },
        },
        {
          $project: {
            _id: 0,
            totalOrders: 1,
            totalRevenue: 1,
            totalPurchaseAmount: 1,
            profit: { $subtract: ["$totalRevenue", "$totalPurchaseAmount"] },
          },
        },
      ];

      const result = await orderData.aggregate(pipeline);

      const { totalOrders, totalRevenue, totalPurchaseAmount, profit } =
        result[0] || {
          totalOrders: 0,
          totalRevenue: 0,
          totalPurchaseAmount: 0,
          profit: 0,
        };
      console.log(profit);

      res.json({ profit });
    } catch (error) {
      const err = new Error(error);
      err.statusCode = 500;
      err.error = "Error in getting profit";
      return next(err);
    }
  },

  orderPerMonth: async (req, res, next) => {
    try {
      console.log(req.query.selectedYear);
      const targetYear = req.query.selectedYear;

      const pipeline3 = [
        {
          $match: {
            active: true,
            orderDate: {
              $gte: new Date(`${targetYear}-01-01`),
              $lt: new Date(`${targetYear + 1}-01-01`),
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m",
                date: "$orderDate",
              },
            },
            totalOrders: { $sum: 1 },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ];

      const monthlyOrderData = await orderData.aggregate(pipeline3);

      function fillMissingMonths(monthlyOrderData) {
        const resultArray = [];
        const monthsMap = new Map();

        for (const monthData of monthlyOrderData) {
          monthsMap.set(monthData._id, monthData.totalOrders);
        }

        for (let month = 1; month <= 12; month++) {
          const monthKey = `2023-${month.toString().padStart(2, "0")}`;
          const orders = monthsMap.get(monthKey) || 0;
          resultArray.push(orders);
        }

        return resultArray;
      }

      const monthlyOrdersArray = fillMissingMonths(monthlyOrderData);
      console.log(monthlyOrdersArray);

      res.json({ monthlyOrdersArray });
    } catch (error) {
      const err = new Error(error);
      err.statusCode = 500;
      err.error = "Error in getting profit";
      return next(err);
    }
  },

  usersPage: async (req, res, next) => {
    try {
      const user = await users.find();
      res.render("adminUsers", { users: user });

    } catch (error) {
      const err = new Error(error);
      err.statusCode = 500;
      err.error = "Error in loading user management page.";
      return next(err);
    }
  },

  loginPage: async (req, res, next) => {
    try {
      let user
      const locals = {
        title: "Admin Login",
        error: "",
        user
      };
      res.render("adminLogin", locals);

    } catch (error) {
      const err = new Error(error)
      err.statusCode = 500
      err.error = 'Error in loading admin loging page.'
      return next(err)
    }
  },

  loginPost: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const existingAdmin = await admin.findOne({ email });

      if (!existingAdmin) {
        return res.render("adminLogin", { error: "user_not_found" });
      }

      const isPasswordValid = await bcrypt.compare(
        password,
        existingAdmin.password
      );

      if (isPasswordValid) {
        req.session.admin = email;
        // console.log(req.session, 'adminlogin');
        res.cookie("name", "express");

        return res.redirect("/admin");
      } else {
        return res.render("adminLogin", { error: "incorrect_pass" });
      }

    } catch (error) {
      res.render("adminLogin", { error: "user_not_found" })
      const err = new Error(error)
      err.statusCode = 500
      err.error = 'Error in loading loging page.'
      return next(err)
    }
  },

  blockUser : async (req, res, next) => {
    const itemId = req.params.id; // Change 'id' to 'userId'
    // console.log(itemId);

    try {
      const user = await users.findById(itemId); // Change 'YourModel' to 'users'

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      if (user.Blocked) {
        await users.updateOne({ _id: itemId }, { $set: { Blocked: false } });
        user.Blocked = false;
        console.log("jhsdjjgsfd");
      } else {
        await users.updateOne({ _id: itemId }, { $set: { Blocked: true } });
        user.Blocked = true;
        console.log("BLOCKED");
      }

      res.status(200).json({ success: true, blockedStatus: user.Blocked });
    } catch (error) {
      console.error("Error toggling blocked status:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to toggle blocked status" });
    }
  },

  category: async (req, res, next) => {
    try {
      const categorylist = await category.find();
      res.render("adminCategory", { categorylist });

    } catch (error) {
      const err = new Error(error)
      err.statusCode = 500
      err.error = 'Error in loading category management page.'
      return next(err)
    }
  },

  logout: async (req, res, next) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.log(err);
        }
        res.redirect("/admin/login");
      });
    } catch (error) {
      const err = new Error(error)
      err.statusCode = 500
      err.error = 'Error in logging out user.'
      return next(err)
    }
  },

  checkCategory: async (req, res, next) => {
    const { oneCategory } = req.query;

    try {
      const existingCategory = await category.findOne({
        category: { $regex: new RegExp(oneCategory, "i") },
      });

      res.json({ exists: !!existingCategory });
    } catch (error) {
      console.error("Error checking category:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  addCategory: async (req, res, next) => {
    try {
      const { categoryName, gender } = req.body;
      const newCategory = new category({
        gender: gender,
        category: categoryName,
        active: true,
      });

      await newCategory.save();
      console.log("category data saved");
      res.redirect("/admin/category");

    } catch (error) {
      const err = new Error(error)
      err.statusCode = 500
      err.error = 'Error in adding new category.'
      return next(err)
    }
  },

  listCategory: async (req, res, next) => {
    try {
      const categoryId = req.params.id;
      console.log(categoryId);
      const oneCategory = await category.findById(categoryId);

      if (!oneCategory) {
        return res
          .status(404)
          .json({ success: false, message: "category not found" });
      }

      if (oneCategory.active) {
        await category.updateOne(
          { _id: categoryId },
          { $set: { active: false } }
        );
        oneCategory.active = false;
        console.log("unlisted");
      } else {
        await category.updateOne(
          { _id: categoryId },
          { $set: { active: true } }
        );
        oneCategory.active = true;
        console.log("listed");
      }

      res.status(200).json({ success: true, listedStatus: category.active });

    } catch (error) {
      const err = new Error(error)
      err.statusCode = 500
      err.error = 'Error in changing the status of the category.'
      return next(err)
    }
  },

  updateCategory: async (req, res, next) => {
    try {
      const categoryId = req.params.id;
      console.log(categoryId);
      const { categoryName, gender } = req.body;

      const updatedCategory = await category.findByIdAndUpdate(
        { _id: categoryId },
        { $set: { category: categoryName, gender: gender } }
      );

      if (!updatedCategory) {
        return res
          .status(404)
          .json({ success: false, message: "Category not found" });
      }
      res.redirect("/admin/category");

    } catch (error) {
      const err = new Error(error)
      err.statusCode = 500
      err.error = 'Error in updating the details of the category.'
      return next(err)
    }
  },

  addSubcategory: async (req, res, next) => {
    const categoryId = req.params.categoryId; 
    const { subcategoryName } = req.body; 
    console.log(subcategoryName);
    try {
      
      const updatedCategory = await category.findByIdAndUpdate(categoryId, {
        $push: {
          subcategories: {
            subcategory: subcategoryName,
            active: true,
          },
        },
      });

      if (!updatedCategory) {
        return console.log("Failed in updating subcategory");
      }

      res.redirect("/admin/category");

    } catch (error) {
      const err = new Error(error)
      err.statusCode = 500
      err.error = 'Error in adding subcategory.'
      return next(err)
    }
  },

  listSubcategory: async (req, res, next) => {
    try {
      const categoryId = req.params.categoryId;
      const subcategoryName = req.params.subcategory;

      const oneCategory = await category.findById(categoryId);
      if (!oneCategory) {
        return res
          .status(404)
          .json({ success: false, message: "Category not found" });
      }

      const subcategoryObject = oneCategory.subcategories.find(
        (subcategoryObj) => subcategoryObj.subcategory === subcategoryName
      );
      if (!subcategoryObject) {
        return res.status(404).json({
          success: false,
          message: "Subcategory not found in the category",
        });
      }

      subcategoryObject.active = !subcategoryObject.active; // Toggle active state

      oneCategory.markModified("subcategories"); // Mark the subcategories array as modified
      await oneCategory.save();

      res
        .status(200)
        .json({ success: true, updatedActiveState: subcategoryObject.active });

    } catch (error) {
      const err = new Error(error)
      err.statusCode = 500
      err.error = 'Error in updating the status of the subcategory.'
      return next(err)
    }
  },

  productPage: async (req, res, next) => {
    try {
      const productlist = await productData.find();
      res.render("adminProduct", { productlist });

    } catch (error) {
      const err = new Error(error)
      err.statusCode = 500
      err.error = 'Error in loading product management page.'
      return next(err)
    }
  },

  productCategories: async (req, res, next) => {
    try {
      const gender = req.query.gender;
      const categories = await category.find({ gender: gender, active: true });
      res.json({ categories });

    } catch (error) {
      const err = new Error(error)
      err.statusCode = 500
      err.error = 'An error occurred while fetching categories'
      return next(err)
    }
  },

  productSubcategories: async (req, res, next) => {
    try {
      const categoryId = req.query.categoryId;
      // console.log(categoryId);
      const categoryData = await category.findById(categoryId);

      if (!categoryData) {
        return res
          .status(404)
          .json({ success: false, message: "Category not found" });
      }

      const subcategories = categoryData.subcategories.filter(
        (subcategory) => subcategory.active
      );
      // console.log(subcategories);
      res.json({ subcategories });

    } catch (error) {
      const err = new Error(error)
      err.statusCode = 500
      err.error = 'An error occurred while fetching subcategories'
      return next(err)
    }
  },

  addProduct: async (req, res, next) => {
    try {
      // console.log(req.body);
      const {
        title,
        brand,
        gender,
        categoryId,
        description,
        subcategory,
        purchaseRate,
        paymentType,
        shippingCharge,
        MRP,
        discount,
        color,
        stockS,
        stockM,
        stockL,
        stockXL,
        stockXXL,
      } = req.body;
      const images = req.files.map((file) => file.path);
      const oneCategory = await category.findById(categoryId);
      const product = new productData({
        title: title,
        brand: brand,
        gender: gender,
        category: oneCategory.category,
        subcategory: subcategory,
        description: description,
        stock: { S: stockS, M: stockM, L: stockL, XL: stockXL, XXL: stockXXL },
        image: images,
        purchaseRate: purchaseRate,
        paymentType: paymentType,
        shippingCharge: shippingCharge,
        MRP: MRP,
        discount: discount,
        color: color,
        active: true,
      });
      await product.save();
      res.redirect("/admin/product");

    } catch (error) {
      const err = new Error(error)
      err.statusCode = 500
      err.error = 'An error occurred while adding new product'
      return next(err)
    }
  },

  editProduct: async (req, res, next) => {
    try {
      const {
        productId,
        title,
        brand,
        gender,
        categoryId,
        description,
        subcategory,
        purchaseRate,
        paymentType,
        shippingCharge,
        MRP,
        discount,
        color,
        stockS,
        stockM,
        stockL,
        stockXL,
        stockXXL,
      } = req.body;
      const images = req.files.map((file) => file.path);
      // console.log(images);
      // console.log(title, brand, gender, categoryId, description, subcategory, purchaseRate, paymentType, shippingCharge, MRP, discount, color, stockS, stockM, stockL, stockXL, stockXXL);
      const product = await productData.findById(productId);
      if (!product) return console.log("product not found");

      let oneCategory;
      console.log(categoryId);
      if (/[0-9]/.test(categoryId)) {
        // If categoryId includes a number, run the code
        oneCategory = await category.findById(categoryId);
        oneCategory = oneCategory.category;
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

      product.title = title;
      product.brand = brand;
      product.gender = gender;
      product.category = oneCategory;
      product.description = description;
      product.subcategory = subcategory;
      product.purchaseRate = purchaseRate;
      product.paymentType = paymentType;
      product.shippingCharge = shippingCharge;
      product.MRP = MRP;
      product.discount = discount;
      product.color = color;
      product.stock.S = stockS;
      product.stock.M = stockM;
      product.stock.L = stockL;
      product.stock.XL = stockXL;
      product.stock.XXL = stockXXL;

      await product.save();

      res.redirect("/admin/product");
    } catch (error) {
      const err = new Error(error)
      err.statusCode = 500
      err.error = 'An error occurred while editing the product details'
      return next(err)
    }
  },

  deleteimg: async (req, res, next) => {
    const { productId, index } = req.query;
    console.log(productId, index);
    try {
      const Product = await productData.findById(productId);

      if (!Product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Check if the index is valid
      if (index >= 0 && index < Product.image.length) {
        Product.image.splice(index, 1);
        await Product.save();
        res
          .status(200)
          .json({ message: "Image deleted successfully", product: Product });
      } else {
        res.status(400).json({ message: "Invalid index provided" });
      }
    } catch (error) {
      const err = new Error(error)
      err.statusCode = 500
      err.error = 'An error occurred while deleting the image'
      return next(err)
    }
  },

  listProduct: async (req, res, next) => {
    try {
      const productId = req.params.id;

      const product = await productData.findById(productId);

      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "product not found" });
      }

      if (product.active) {
        await productData.updateOne(
          { _id: productId },
          { $set: { active: false } }
        );
        product.active = false;
      } else {
        await productData.updateOne(
          { _id: productId },
          { $set: { active: true } }
        );
        product.active = true;
      }

      res.status(200).json({ success: true, listedStatus: product.active });
    } catch (error) {
      const err = new Error(error)
      err.statusCode = 500
      err.error = 'An error occurred while updating the product status'
      return next(err)
    }
  },

  updateStatus: async (req, res, next) => {
    try {
      const { orderId, status } = req.query;

      const order = await orderData.findById(orderId)
      const user = await users.findById(order.user);

      if (
        (order.paymentMethod === "onlinePayment" && status === "Cancelled") || status === "Returned") {
        user.wallet += order.total;
        order.refunded = true;
      }

      if (status === "Cancelled" || status === "Returned") {
       
        const updateStockPromises = order.products.map(async (cartItem) => {
          const product = await productData.findById(cartItem.product._id);
      
          if (product) {
            
            product.stock[cartItem.size] += cartItem.quantity;
      
            return product.save();
          }
        });
      
        // Wait for all promises to complete
        await Promise.all(updateStockPromises);
      }

      order.orderStatus = status;
      order.changeDate = Date.now();

      await user.save();
      await order.save();
      res.redirect("/admin/orderList");

    } catch (error) {
      const err = new Error(error)
      err.statusCode = 500
      err.error = 'An error occurred while updating the order status'
      return next(err)
    }
  },

  downloadSalesReport: async (req, res, next) => {
    try {
      const { orderStatus, fromDate, toDate } = req.query;

      // Create a filter based on query parameters
      const filter = { active: true };

      if (orderStatus !== "") {
        filter.orderStatus = orderStatus;
      }

      // Use the filter to fetch data from your database (orderData)
      // Replace this with your actual data retrieval code
      const orders = await orderData.find(filter);

      // Convert the data to CSV format
      const file = [];
      orders.forEach((order) => {
        const row = {
          date: order.orderDate,
          order_id: order._id,
          consumer: order.address.name,
          payment: order.paymentMethod,
          amount: order.total,
        };
        file.push(row);
      });

      const json2csvParser = new Parser();
      const csv = json2csvParser.parse(file);

      res.attachment(`report-${Date.now()}.csv`);
      res.status(200).send(csv);

    } catch (error) {
      const err = new Error(error);
      err.statusCode = 500;
      err.error = "Error in downloading sales report";
      return next(err);
    }
  },

  orderDetailsPage: async (req, res, next) => {
    try {
      const { orderId } = req.query;

      const orders = await orderData
        .findById(orderId)
        .populate("products.product");

      let subtotal = 0;
      for (let index = 0; index < orders.products.length; index++) {
        const product = orders.products[index].product;
        const quantity = orders.products[index].quantity;

        subtotal += product.MRP * quantity;
      }

      res.render("adminSide/orderDetails", { orders, subtotal });
    } catch (error) {
      const err = new Error(error)
      err.statusCode = 500
      err.error = 'An error occurred while loading the order details page'
      return next(err)
    }
  },
};
