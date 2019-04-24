var mongoose = require("mongoose");

var reviewSchema = new mongoose.Schema({
    text: String,
    author: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
      },
      name: String
    }
});

module.exports = mongoose.model("Review", reviewSchema);
