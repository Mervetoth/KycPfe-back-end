const mongoose = require("mongoose");
const adminSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    min: 6,
    max: 255,
  },
  lastName: {
    type: String,
    required: true,
    min: 6,
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  telNumber: {
    type: String,
    required: true,
    length: 8,
  },
  gender: {
    type: String,
    required: true,
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
});
module.exports = mongoose.model("Admin", adminSchema);
