const userData = require('../models/user');
const productData = require('../models/product');
const couponData = require('../models/coupon');

module.exports = {
    couponPage : async (req, res, next) => {
        try {
            const coupons = await couponData.find();
            // console.log(coupons);
            res.render('adminSide/coupon',{coupons})

        } catch (error) {
            const err = new Error(error)
            err.statusCode = 500
            err.error = 'An error occurred while loading coupon management page'
            return next(err)
        }
    },

    Addcoupon : async (req, res, next) => {
        try {
            const { couponCode, couponAmount, couponType, expiryDate, couponMinPurchase, couponMaxRedimableAmount } = req.body;

            const newCoupon = new couponData({
                code: couponCode.toUpperCase(), 
                amount: couponAmount,
                type: couponType,
                minPurchaseAmount: couponMinPurchase,
                createdAt: Date.now(),
                expiresAt: expiryDate, 
                active: true,
                maxRedimableAmount: couponMaxRedimableAmount
            });

            await newCoupon.save();
            res.redirect('/admin/coupon')

        } catch (error) {
            const err = new Error(error)
            err.statusCode = 500
            err.error = 'An error occurred while adding new coupon'
            return next(err)
        }
    },

    editCoupon : async (req, res, next) => {
        try {
            const {couponId, couponCode, couponAmount, couponMinPurchase, couponType, expiryDate, couponMaxRedimableAmount} = req.body

            const coupon = await couponData.findById(couponId)
            coupon.code = couponCode.toUpperCase()
            coupon.amount = couponAmount
            coupon.type = couponType
            coupon.minPurchaseAmount = couponMinPurchase
            coupon.expiresAt = expiryDate,
            coupon.maxRedimableAmount = couponMaxRedimableAmount

            await coupon.save();
            res.redirect('/admin/coupon')

        } catch (error) {
            const err = new Error(error)
            err.statusCode = 500
            err.error = 'An error occurred while editing coupon details'
            return next(err)
        }
    },

    listCoupon : async (req, res, next) => {
        try {
            const couponId = req.params.id;
            console.log(couponId);
            const coupon = await couponData.findById(couponId);

            if (!coupon) {
                return res.status(404).json({ success: false, message: 'category not found' });
            }

            if(coupon.active){
                await couponData.updateOne({_id:couponId},{$set:{active:false}})
                coupon.active = false;
                console.log("unlisted");
            } else {
                await couponData.updateOne({_id:couponId},{$set:{active:true}})
                coupon.active = true;
                console.log("listed");

            }
            res.status(200).json({ success: true, listedStatus: coupon.active });
        } catch (error) {
            const err = new Error(error)
            err.statusCode = 500
            err.error = 'An error occurred while updating status of the coupon'
            return next(err)
        }
    },

    verifyCoupon : async (req, res, next) => {
        try {
            const {couponCode,subTotal} = req.query

            const subTotalWithoutSymbol = subTotal.replace("₹", "");
            const subTotalNum = parseFloat(subTotalWithoutSymbol);

            const coupon = await couponData.findOne({code:couponCode.toUpperCase() , active : true , expiresAt: { $gt: Date.now() } });

            if(!!!coupon){
                res.json({ exists: !!coupon });
            } else {
                const minPurchaseAmount = coupon.minPurchaseAmount;
                let amount;

                if (subTotalNum < minPurchaseAmount) {

                    res.json({ exists: false, error: `Only valid for purchase of ₹${minPurchaseAmount} or above` });
                } else {
                    if(coupon.type === 'amount'){
                        amount = coupon.amount
                    } else {
                        amount = Math.floor(((subTotalNum*(coupon.amount))/100))
                        if(amount > coupon.maxRedimableAmount){
                            amount =  coupon.maxRedimableAmount
                        }
                    }
                    req.session.coupon = amount
                    res.json({ exists: true, amount : amount });
                }
            }

        } catch (error) {
            const err = new Error(error)
            err.statusCode = 500
            err.error = 'An error occurred while verifying the coupon'
            return next(err)
        }
    }

}