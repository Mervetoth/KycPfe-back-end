const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  risqueProd: {
    type: Number,
    required: true,
  },
  prodName: {
    type: String,
    required: true,
  },
 
  createdAt: {
    type: Date,
    default: Date.now,
  },


});
module.exports = mongoose.model("Produit", userSchema);
