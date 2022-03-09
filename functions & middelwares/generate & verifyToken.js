const jwt = require("jsonwebtoken");
const moment = require("moment");
const jwt_decode = require("jwt-decode");
//********************Generate Token********************//
const generatetoken = (data, exp) => {
  return jwt.sign(data, process.env.TOKEN_SECRET, { expiresIn: exp });
};
//********************Expired token********************//
const expiredToken = (token) => {
  try {
    const decoded = jwt_decode(token);
    timeNow = new Date();
    console.log(moment.unix(decoded.exp).toDate());
    if (moment.unix(decoded.exp).toDate() < timeNow) {
      return res.status(403).json("expired token");
    }
  } catch (error) {
    console.log(error, "expiredToken error");
  }
};
module.exports = function (req, res, next) {
  const token = req.header("auth-token");
  if (!token) return res.status(401).json("acces denied");
  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json("invalid token");
  }
};
module.exports.generatetoken = generatetoken;
module.exports.expiredToken = expiredToken;
