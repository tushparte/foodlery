const mongoose = require('mongoose');

const ValetSchema = new mongoose.Schema({
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
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'order'
    }
  ]
});

const Valet = mongoose.model('Valet', ValetSchema);

module.exports = Valet;
