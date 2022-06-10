const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  typeRech: {
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
  listeCorr: [
    {
      type: String,
    },
  ],
  historiqueRech: {
    type: String,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  firstName: {
    type: String,
    required: true,
    min: 3,
    max: 255,
  },
  lastName: {
    type: String,
    required: true,
    min: 3,
    max: 255,
  },
  email: {
    type: String,

    min: 6,
    max: 255,
  },

  permissions: [
    {
      type: String,
    },
  ],

  birthDate: {
    type: String,

    min: 6,
  },

  cin: {
    type: String,

    min: 6,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  telNumber: {
    type: String,

    length: 8,
  },

  avatar: [
    {
      type: String,
    },
  ],

  ////////////////////////////
  adresse: {
    type: String,

    min: 6,
  },
  postalCode: {
    type: String,

    min: 6,
  },
  city: {
    type: String,

    min: 6,
  },
  pays: {
    type: String,
  },
  gender: {
    type: String,
  },
});
module.exports = mongoose.model("Recherche", userSchema);
