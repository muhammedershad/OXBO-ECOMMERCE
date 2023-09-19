module.exports = {
    404 : (req,res)=>{
        res.render('404')
    },

    500 : (err,req,res,next) => {
        console.log(err);
        res.render('500',{err})
    }
}