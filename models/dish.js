const mongoose = require('mongoose')

const dishSchema = new mongoose.Schema({
  name: String,
  price: Number,
  img: String,
  from: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'restaurant'
    }
  }
});

module.exports = mongoose.model('Dish', dishSchema);
