const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  placedby : {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  dishes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'dish'
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
