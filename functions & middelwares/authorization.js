const jwt_decode = require("jwt-decode");
const {generatetoken,expiredToken} = require("../functions & middelwares/generate & verifyToken");

//********************Authorization********************//
const authorization = (permissions) => {
    return (req, res, next) => {
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];
      if (!token) {
        res.status(401).json("Token is not found");
      } else {
        const decoded = jwt_decode(token);
        expiredToken(token);
        if (decoded.permissions.includes(permissions)) {
          next();
        } else {
          return res.status(403).json("You are not Authorized");
        }
      }
    };
  };
  module.exports.authorization=authorization;