const bannerData = require('../models/banner');
const couponData = require('../models/coupon');
const categoryData = require('../models/category');
const { findOneAndUpdate } = require('../models/subcategory');
const productData = require('../models/product')

module.exports = {
    bannerPage : async (req, res, next) => {
        try {
            const category = await categoryData.find();
            const coupons = await couponData.find();
            const banners = await bannerData.find();

            res.render('adminSide/banner',{coupons,category,banners});
        } catch (error) {
            const err = new Error(error)
            err.statusCode = 500
            err.error = 'Error in Loading banner page'
            return next(err);
        }
    },

    addBanner : async (req, res, next) => {
        try {
            const {bannerTitle, bannerSubtitle, offerPercentage, bannerCategory} = req.body;
            const images = req.files.map(file => file.path);
            const image = images[0];

            const banner = new bannerData({
                title : bannerTitle,
                subtitle : bannerSubtitle,
                category : bannerCategory,
                image : image,
                active : true,
                offerPercentage : offerPercentage
            })
            await banner.save()

            const products = await productData.find({ category : bannerCategory})
            for (const product of products) {
                
                const discount = Math.floor((offerPercentage / 100) * product.MRP);
                const discountedPrice = product.MRP - discount;
              
                product.MRP = discountedPrice;
              
                // Save the updated product
                await product.save();
            }

            res.redirect('/admin/banner')

        } catch (error) {
            const err = new Error(error)
            err.statusCode = 500
            err.error = 'Error in posting new banner'
            return next(err);
        }
    },

    editBanner : async (req, res, next) => {
        try {
            const banner = await bannerData.findById(req.body.bannerId)

            if(req.files[0] !== undefined){
                const images = req.files.map(file => file.path);
                const image = images[0];
                banner.image = image
            }

            if(banner.category === req.body.bannerCategory && banner.offerPercentage !== req.body.offerPercentage){
                const products = await productData.find({ category : banner.category})
                for (const product of products) {
                    const discount = Math.ceil((banner.offerPercentage / 100) * product.MRP);
                    const actualPrice = product.MRP + discount;
                    const newDiscount = Math.floor((req.body.offerPercentage / 100) * actualPrice);
                    const discountedPrice = actualPrice - newDiscount;
                
                    product.MRP = discountedPrice;
                
                    // Save the updated product
                    await product.save();
                }
            } else if ( banner.category !== req.body.bannerCategory && banner.offerPercentage === req.body.offerPercentage ){
                const products = await productData.find({ category : banner.category})
                for (const product of products) {
                    const discount = Math.ceil((banner.offerPercentage / 100) * product.MRP);
                    const actualPrice = product.MRP + discount;
                
                    product.MRP = actualPrice;
                
                    await product.save();
                }

                const products2 = await productData.find({ category : req.body.bannerCategory})
                for (const product of products2) {
                    const discount = Math.floor((banner.offerPercentage / 100) * product.MRP);
                    const discountPrice = product.MRP - discount;
                
                    product.MRP = discountPrice;
                
                    await product.save();
                }
            } else if ( banner.category !== req.body.bannerCategory && banner.offerPercentage !== req.body.offerPercentage ){
                const products = await productData.find({ category : banner.category})
                for (const product of products) {
                    const discount = Math.ceil((banner.offerPercentage / 100) * product.MRP);
                    const actualPrice = product.MRP + discount;
                
                    product.MRP = actualPrice;
                
                    await product.save();
                }

                const products2 = await productData.find({ category : req.body.bannerCategory})
                for (const product of products2) {
                    const discount = Math.floor((req.body.offerPercentage / 100) * product.MRP);
                    const discountPrice = product.MRP - discount;
                
                    product.MRP = discountPrice;
                
                    await product.save();
                }
            }

            banner.title = req.body.bannerTitle
            banner.subtitle = req.body.bannerSubtitle
            banner.category = req.body.bannerCategory
            banner.offerPercentage = req.body.offerPercentage
            
            await banner.save()
            res.redirect('/admin/banner')
        } catch (error) {
            const err = new Error(error)
            err.statusCode = 500
            err.error = 'Error in editing banner'
            return next(err);
        }
    },

    deleteBanner : async (req, res, next) => {
        try {
            const bannerId = req.params.id
            const banner = await bannerData.findById(bannerId)

            const products = await productData.find({ category : banner.category})
            for (const product of products) {
                const discount = Math.ceil((banner.offerPercentage / 100) * product.MRP);
                const actualPrice = product.MRP + discount;
            
                product.MRP = actualPrice;
            
                // Save the updated product
                await product.save();
            }
            
            await bannerData.findOneAndDelete(bannerId)

            res.redirect('/admin/banner')
        } catch (error) {
            const err = new Error(error)
            err.statusCode = 500
            err.error = 'Error in deleting banner'
            return next(err);
        }
    },

    listBanner : async (req, res, next) => {
        try {
            const bannerId = req.params.id
            
            const banner = await bannerData.findOne({_id : bannerId})

            if(banner.active){
                await bannerData.findOneAndUpdate({_id : bannerId},{$set : {active : false}})

                const products = await productData.find({ category : banner.category})
                for (const product of products) {
                    const discount = Math.ceil((banner.offerPercentage / 100) * product.MRP);
                    const actualPrice = product.MRP + discount;
                
                    product.MRP = actualPrice;
                
                    await product.save();
                }
            } else {
                await bannerData.findOneAndUpdate({_id : bannerId},{$set : {active : true}})

                const products = await productData.find({ category : banner.category})
                for (const product of products) {
                    
                    const discount = Math.floor((banner.offerPercentage / 100) * product.MRP);
                    const discountedPrice = product.MRP - discount;
                
                    product.MRP = discountedPrice;
                
                    // Save the updated product
                    await product.save();
                }
            }

            res.redirect('/admin/banner')
        } catch (error) {
            const err = new Error(error)
            err.statusCode = 500
            err.error = 'Error in listing banner'
            return next(err);
        }
    }
}