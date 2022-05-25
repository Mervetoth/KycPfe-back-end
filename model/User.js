const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
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
    required: true,
    min: 6,
    max: 255,
  },
  password: {
    type: String,
    required: true,
    min: 6,
    max: 1024,
  },
  permissions: [
    {
      type: String,
      required: true,
    },
  ],

  birthDate: {
    type: String,
    required: true,
    min: 6,
  },

  cin: {
    type: String,
    required: true,
    min: 6,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  telNumber: {
    type: String,
    required: true,
    length: 8,
  },
  tokenMail: {
    type: String,
    required: false,
  },
  avatar: [
    {
      type: String,
    },
  ],

  ////////////////////////////
  adresse: {
    type: String,
    required: true,
    min: 6,
  },
  postalCode: {
    type: String,
    required: true,
    min: 6,
  },
  city: {
    type: String,
    required: true,
    min: 6,
  },
  pays: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
});
module.exports = mongoose.model("User", userSchema);
