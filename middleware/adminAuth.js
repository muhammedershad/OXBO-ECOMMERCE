module.exports = {
    auth : (req,res,next) => {
        try {
            if(req.session.admin){
                next();
            } else {
                return res.redirect('/admin/login');
            }
        } catch (error) {
            console.log(error);
        }
    },

    logined : (req,res,next) => {
        try {
            if(req.session.admin){
                return res.redirect('/admin');
            } else {
                next();
            }
        } catch (error) {
           console.log(error); 
        }
    }
}