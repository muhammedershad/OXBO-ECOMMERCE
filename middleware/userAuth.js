const userData = require('../models/user');

module.exports = {
    auth : async (req,res,next) => {
        try {
            if(req.session.user){
                const user = await userData.findOne({email : req.session.user})
                if(!user)
                    return res.redirect('/login?message=user_not_found');
                else {
                    if(user.Blocked){
                        req.session.destroy();
                        return res.redirect('/login?message=user_blocked');
                    } else {
                        next();
                    }
                }
            } else {
                req.session.url = req.originalUrl
                return res.redirect('/login');
            }
        } catch (error) {
            console.log(error);
        }
    },

    logined : (req,res,next) => {
        try {
            if(req.session.user){
                return res.redirect('/account');
            } else {
                next();
            }
        } catch (error) {
            console.log(error);
        }
    }
}