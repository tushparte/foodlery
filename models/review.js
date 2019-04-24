var mongoose = require("mongoose");

var reviewSchema = new mongoose.Schema({
    text: String,
    author: String
});

module.exports = mongoose.model("Review", reviewSchema);
