const mongoose = require('mongoose')

const dishSchema = new mongoose.Schema({
  name: String,
  price: Number,
  img: String
});

module.exports = mongoose.model('Dish', dishSchema);
