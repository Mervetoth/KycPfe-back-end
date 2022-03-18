const mongoose = require("mongoose");
const resultatCorrSchema = new mongoose.Schema({
  userId: {
    type: String,
  },
  status: {
    type: Number,
  },
  fullName: {
    type: String,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  addresses: [
    {
      uid: {
        type: Number,
      },
      city: {
        type: String,
      },
      country: {
        type: String,
      },
      address1: {
        type: String,
      },
      address2: {
        type: String,
      },
      address3: {
        type: String,
      },
      postalCode: {
        type: Number,
      },
    },
  ],
  sdnType: {
    type: String,
  },
  programs: [
    {
      type: String,
    },
  ],
  driversLicenses: [
    {
      type: String,
    },
  ],

  score: {
    type: String,
  },
  akas: [
    {
      uid:  String ,
      score: String ,
      category: String ,
      lastName:  String ,
      firstName:  String ,
    },
  ],
  dob: {
    type: String,
  },
  selectiodeRech: {
    type: String,
  },
  ////////////////////////////////
  gender: {
    type: String,
  },
  remarks: {
    type: String,
  },
  passports: [
    {
      passport: {
        type: String,
      },
      passportCountry: {
        type: String,
      },
    },
  ],
  action: {
    type: String,
  },

  ///////////////////////////////////////
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ResultatCorr", resultatCorrSchema);
