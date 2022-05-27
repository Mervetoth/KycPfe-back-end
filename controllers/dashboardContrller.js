const router = require("express").Router();
const User = require("../model/User");
const Produit = require("../model/Produit");
const Admin = require("../model/Admin");
const Pays = require("../model/Pays");
const Search = require("../model/Recherche");
const AfficheKyc = require("../model/AfficheKYC");
const jwt_decode = require("jwt-decode");
const bcrypt = require("bcryptjs");
const sendFile = require("../functions & middelwares/upload");
const { authorization } = require("../functions & middelwares/authorization");

router.get(
  "/dashboardContent",
  authorization("ADMIN"),
  async (req, res, next) => {
    let nbAdmins;
    let nbUsers;
    let nbProducts;
    let nbPays;
    let nbSearch;

    try {
      nbAdmins = await Admin.count();
      nbPays = await Pays.count();
      nbProducts = await Produit.count();
      nbSearch = await Search.count();
      nbUsers = await User.count();
      nbAffiche = await AfficheKyc.count();
    } catch (err) {}

    res.json({
      nbAdmins,
      nbPays,
      nbProducts,
      nbSearch,
      nbUsers,
      nbAffiche,
    });
  }
);

//********************EXPORTS********************//
module.exports = router;
