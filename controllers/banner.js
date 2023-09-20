const bannerData = require('../models/banner');
const couponData = require('../models/coupon');
const categoryData = require('../models/category');

module.exports = {
    bannerPage : async (req,res,next) => {
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

    addBanner : async (req,res,next) => {
        try {
            const {bannerTitle, bannerSubtitle, bannerCategory} = req.body;
            const images = req.files.map(file => file.path);
            const image = images[0];

            const banner = new bannerData({
                title : bannerTitle,
                subtitle : bannerSubtitle,
                category : bannerCategory,
                image : image,
                active : true
            })
            await banner.save()
            res.redirect('/admin/banner')

        } catch (error) {
            const err = new Error(error)
            err.statusCode = 500
            err.error = 'Error in posting new banner'
            return next(err);
        }
    },

    editBanner : async (req,res,next) => {
        try {
            const banner = await bannerData.findById(req.body.bannerId)

            console.log(req.files);

            if(req.files[0] !== undefined){
                const images = req.files.map(file => file.path);
                const image = images[0];
                banner.image = image
            }

            banner.title = req.body.bannerTitle
            banner.subtitle = req.body.bannerSubtitle
            banner.category = req.body.bannerCategory
            
            await banner.save()
            res.redirect('/admin/banner')
        } catch (error) {
            const err = new Error(error)
            err.statusCode = 500
            err.error = 'Error in editing banner'
            return next(err);
        }
    },

    deleteBanner : async (req,res,next) => {
        try {
            const {bannerId} = req.params.id
            
            await bannerData.findOneAndDelete(bannerId)

            res.redirect('/admin/banner')
        } catch (error) {
            const err = new Error(error)
            err.statusCode = 500
            err.error = 'Error in deleting banner'
            return next(err);
        }
    },

    listBanner : async (req,res,next) => {
        try {
            const bannerId = req.params.id
            
            const banner = await bannerData.findOne({_id : bannerId})

            if(banner.active){
                await bannerData.findOneAndUpdate({_id : bannerId},{$set : {active : false}})
            } else {
                await bannerData.findOneAndUpdate({_id : bannerId},{$set : {active : true}})
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