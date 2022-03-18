const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  typeRech: {
    type: String,
    required: true,
  },
  cin: {
    type: String,
    
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  adminId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
  },
  listeCorr: [{
    type: String,
  }],
  historiqueRech: {
    type: String,
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model("Recherche", userSchema);
