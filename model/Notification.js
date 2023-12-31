const mongoose = require("mongoose");
const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    min: 3,
  },
  description: {
    type: String,
    required: true,
    min: 3,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  /*   status: {
    type: String,
    required:true
  }, */
});

module.exports = mongoose.model("Notification", notificationSchema);
