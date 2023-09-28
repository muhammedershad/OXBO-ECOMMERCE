module.exports = {
    404 : (req,res)=>{
        const user = {}
        res.render('404',{})
    },

    500 : (err,req,res,next) => {
        const user = {}
        console.log(err);
        res.render('500',{err, user})
    }
}