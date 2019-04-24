const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  contact: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  img: String,
  description: String,
  menu: [{
    dish: String,
    price: String
  }],
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review'
    }
  ]
});

const Restaurant = mongoose.model('Restaurant', RestaurantSchema);

module.exports = Restaurant;
