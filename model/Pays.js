const mongoose = require("mongoose");
const paysSchema = new mongoose.Schema({
  pays: {
    type: String,
    required: true,
    min: 3,
  },
  paysRisque: {
    type: String,
    required: true,
    min: 3,
  },
  flag: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Pays", paysSchema);
