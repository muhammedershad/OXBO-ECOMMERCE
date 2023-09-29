module.exports = {
    404 : (req,res)=>{
        let user
        return res.render('404',{user})
    },

    500 : (err,req,res,next) => {
        let user
        console.log(err);
        return res.render('500',{err, user})
    }
}