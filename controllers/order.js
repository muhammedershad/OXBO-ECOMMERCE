const orderData = require('../models/orders')

module.exports = {

    orderListPage: async (req, res, next) => {
        try {
          const { orderStatus } = req.query;
          let filter = { active: true };
          if (orderStatus) {
            filter.orderStatus = orderStatus;
          }
    
          const orders = await orderData
            .find(filter)
            .populate("products.product")
            .populate("user")
            .sort({ orderDate: -1 });
    
          res.render("adminSide/adminOrder", { orders, orderStatus });
        } catch (error) {
          const err = new Error(error)
          err.statusCode = 500
          err.error = 'An error occurred while loading the order management page'
          return next(err)
        }
    },


}