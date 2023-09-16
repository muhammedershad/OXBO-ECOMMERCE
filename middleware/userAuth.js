module.exports = {
    auth : (req,res,next) => {
        try {
            if(req.session.user){
                next();
            } else {
                req.session.url = req.originalUrl
                res.redirect('/login');
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