const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  selectiodeRech: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },


});
module.exports = mongoose.model("ResultatCorr", userSchema);
