const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  placedby : {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  dishes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dish'
    }
  ],
  total: Number,
  address: String,
  orderedfrom : {
  id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant'
    }
  }
});

module.exports = mongoose.model('Order', orderSchema);
