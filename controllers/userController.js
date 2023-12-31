const router = require("express").Router();
const User = require("../model/User");
const Produit = require("../model/Produit");
const Pays = require("../model/Pays");
const jwt_decode = require("jwt-decode");
const bcrypt = require("bcryptjs");
const sendFile = require("../functions & middelwares/upload");

const {
  registerValidationUser,
  loginValidation,
} = require("../functions & middelwares/validation");
const {
  generatetoken,
  expiredToken,
} = require("../functions & middelwares/generate & verifyToken");
const joi = require("@hapi/joi");
const sendEmail = require("../functions & middelwares/sendEmail");
const { authorization } = require("../functions & middelwares/authorization");
const Notification = require("../model/Notification");

let tokenList = [];
/**********************************Register**********************************/
/**
 * @swagger
 * /api/user/register:
 *    post:
 *      tags:
 *      - "user"
 *      summary: "Create user"
 *      description: "This can only be done by the token of the sueper user."
 *      operationId: "createUser"
 *      produces:
 *      - "application/json"
 *      parameters:
 *      - in: "body"
 *        name: "body"
 *        description: "Created user object"
 *        required: true
 *      responses:
 *       200:
 *         description: Created
 *       400:
 *         description: Erreur
 */
router.post("/register", authorization("ADMIN"), async (req, res) => {
  //**let's validate the data before we make a user**//
  const { error } = registerValidationUser(req.body);
  if (error) return res.status(400).json(error.details[0].message);
  //**checking if the user is already in the database**//
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).json("Email already exists .");

  //**checking if the cin is already in the database**//
  const cinExist = await User.findOne({ cin: req.body.cin });
  if (cinExist)
    return res.status(400).json("User with this cin already exists .");

  //**checking if the tel is already in the database**//
  const telNumberExist = await User.findOne({ telNumber: req.body.telNumber });
  if (telNumberExist)
    return res.status(400).json("User with this phone number already exists .");
  //**checking if the PRODUCT is already in the database**//
  const produit_idExist = await Produit.findById(req.body.produitId);
  if (!produit_idExist) return res.status(400).json("User must have a product");
  console.log(req.body.produitId);

  //**checking if the COUNTRY is already in the database**//
  const pays_idExist = await Pays.findById(req.body.paysId);
  console.log(pays_idExist);
  if (!pays_idExist)
    return res.status(400).json("User must belong to an existing country .");

  //**hash the passwords**//
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);
  //******************** create new user********************//
  const user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    paysId: req.body.paysId,
    produitId: req.body.produitId,

    adresse: req.body.adresse,
    birthDate: req.body.birthDate,
    cin: req.body.cin,
    telNumber: req.body.telNumber,
    email: req.body.email,
    permissions: req.body.permissions,
    postalCode: req.body.postalCode,

    city: req.body.city,
    gender: req.body.gender,
    password: hashedPassword,
  });
  try {
    let userRisque = 0;
    if (req.body.risk) {
      userRisque = await (
        (parseFloat(produit_idExist.risqueProd) +
          parseFloat(pays_idExist.paysRisque) +
          parseFloat(req.body.risk)) /
        3
      ).toFixed(2);
    } else {
      userRisque = await (
        (parseFloat(produit_idExist.risqueProd) +
          parseFloat(pays_idExist.paysRisque)) /
        2
      ).toFixed(2);
    }

    if (userRisque >= 80) {
      const notif = new Notification({
        title: `${user.firstName} ${user.lastName}`,
        description: `this new user has a high risk of ${userRisque} `,
      });
      try {
        const savedNotification = await notif.save();
      } catch (error) {
        res.status(400).json(error);
      }
    } else {
      const notif = new Notification({
        title: `${user.firstName} ${user.lastName}`,
        description: `this new user has a risk of ${userRisque} `,
      });
      try {
        const savedNotification = await notif.save();
      } catch (error) {
        res.status(400).json(error);
      }
    }

    let token = generatetoken(
      { _id: user._id, permissions: user.permissions },
      "200s"
    );
    let refresh = generatetoken(
      { _id: user._id, permissions: user.permissions },
      "200s"
    );

    user.userRisque = userRisque;
    user.allRisque = req.body.risk
      ? [produit_idExist.risqueProd, pays_idExist.paysRisque, req.body.risk]
      : [produit_idExist.risqueProd, pays_idExist.paysRisque];
    const savedUser = await user.save();
    /*  const countryName = pays_idExist.pays;
    const productName = produit_idExist.prodName; */
    console.log(produit_idExist);
    const result = {
      status: "You've been registred ",
      AccessToken: token,
      RefreshToken: refresh,
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      paysId: user.paysId,
      produitId: user.produitId,
      birthDate: user.birthDate,
      cin: user.cin,
      telNumber: user.telNumber,
      adresse: user.adresse,
      permissions: user.permissions,
      createdAt: user.createdAt,

      postalCode: req.body.postalCode,

      city: req.body.city,
      gender: req.body.gender,
    };

    res.json({ token, refresh, userRisque, result });
  } catch (err) {
    res.status(400).json(err);
  }
});
/**
 * @swagger
 * /api/user/login:
 *    post:
 *      tags:
 *      - "user"
 *      summary: "logging in  user"
 *      description: "This can only be done by the token of the sueper user."
 *      operationId: "loggedUser"
 *      produces:
 *      - "application/json"
 *      parameters:
 *      - in: "body"
 *        name: "body"
 *        description: "logged user object"
 *        required: true
 *      responses:
 *       200:
 *          description: "Successful operation"
 *       400:
 *         description: Erreur
 */
//******************************Login******************************//
router.post("/login", async (req, res) => {
  //**let's validate the data before we make a user**//
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).json(error.details[0].message);
  //**checking if the email exists**//
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).json("Email is not found");
  //**PASSWORD IS CORRECT**//
  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) return res.status(400).json("Invalid password");
  //*** ASSIGN A TOKEN ***//
  let token = generatetoken(
    { _id: user._id, permissions: user.permissions },
    "200s"
  );
  let refresh = generatetoken(
    { _id: user._id, permissions: user.permissions },
    "200s"
  );
  tokenList[refresh] = {
    token: token,
    refreshToken: refresh,
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    cin: user.cin,
    email: user.email,
    telNumber: user.telNumber,
    birthDate: user.birthDate,
    pays: user.pays,
    adresse: user.adresse,
    permissions: user.permissions,
    createdAt: user.createdAt,
    postalCode: user.postalCode,

    city: user.city,
    gender: user.gender,
  };
  const result = {
    status: "LOGGED IN SUCCCESS ",
    AccessToken: token,
    RefreshToken: refresh,
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    cin: user.cin,
    email: user.email,
    gender: user.gender,

    telNumber: user.telNumber,
    birthDate: user.birthDate,
    pays: user.pays,
    adresse: user.adresse,
    postalCode: user.postalCode,
    userRisque: user.userRisque,
    allRisque: user.allRisque,
    city: user.city,
    permissions: user.permissions,
    createdAt: user.createdAt,
  };
  /*   res.header("auth-token", token).json(result); */
  res.send(result);
});
/**
 * @swagger
 * /api/user/refresh:
 *    patch:
 *      tags:
 *      - "user"
 *      summary: "refresh user"
 *      description: "This can only be done by the token of the sueper user."
 *      operationId: "refresh user token"
 *      produces:
 *      - "application/json"
 *      parameters:
 *      - in: "body"
 *        name: "body"
 *        description: "refresh token"
 *        required: true
 *      responses:
 *       200:
 *         description:Refreshed
 *       400:
 *         description: Erreur
 */
//********************Update********************//
router.post("/refresh", async (req, res, next) => {
  try {
    const { refrech } = req.body;
    if (refrech && tokenList[refrech].refreshToken === refrech) {
      const user = {
        id: tokenList[req.body.refrech].id,
        firstName: tokenList[req.body.refrech].firstName,
        lastName: tokenList[req.body.refrech].lastName,
        email: tokenList[req.body.refrech].email,
        cin: tokenList[req.body.refrech].cin,
        birthDate: tokenList[req.body.refrech].birthDate,
        adresse: tokenList[req.body.refrech].adresse,
        telNumber: tokenList[req.body.refrech].telNumber,
        pays: tokenList[req.body.refrech].pays,
        permissions: tokenList[req.body.refrech].permissions,

        city: tokenList[req.body.refrech].city,
        postalCode: tokenList[req.body.refrech].postalCode,

        gender: tokenList[req.body.refrech].gender,
      };
      let token = generatetoken(
        { _id: user._id, permissions: user.permissions },
        "200s"
      );
      let refresh = generatetoken(
        { _id: user._id, permissions: user.permissions },
        "200s"
      );
      const result = {
        "New AcessToken": token,
        "New RefreshToken": refresh,
      };
      /// update token ON
      tokenList[refrech].token = token;
      tokenList[refrech].refreshToken = refresh;
      tokenList[refresh] = {
        ...tokenList[refrech],
        token: token,
        refreshToken: refresh,
      };
      tokenList = tokenList.filter((token) => token !== refrech);
      res.status(200).json(result);
    } else {
      res.status(400).json("Invalid request");
    }
  } catch (err) {
    res.status(400).json(err);
  }
});
/**
 * @swagger
 * /api/user/updateUser:
 *    patch:
 *      tags:
 *      - "user"
 *      summary: "update User"
 *      description: "This will update user's account."
 *      operationId: "update user"
 *      produces:
 *      - "application/json"
 *      parameters:
 *      - in: "body"
 *        name: "body"
 *        description: "update user"
 *        required: true
 *      responses:
 *       200:
 *         description: Updated
 *       400:
 *         description: Erreur
 */
//********************UpdateUser********************//
router.patch("/updateUser", async (req, res, next) => {
  try {
    const user = await User.findById(req.query.id, "-password");
    //********************Upload********************
    /* var path = require("path");
    originPath = path.resolve(`uploads`);
    if (path.extname(req.file.originalname) === ".png" || ".jpg") {
      const filePath = originPath + `/${user.id}`;
      console.log(filePath);
      sendFile(req.file, filePath);
      user.avatar = filePath + `/${Date.now()}${req.file.originalname}`;
    } else {
      res.status(400).json("the extension must be png or jpg");
    } */
    Object.assign(user, req.body);
    user.save();
    res.json({ data: user });
  } catch (err) {
    res.status(400).json("id is not found");
  }
});
/**
 * @swagger
 * /api/user/logout:
 *    delete:
 *      tags:
 *      - "user"
 *      summary: "logout user"
 *      description: "This can only be done by the token of the sueper user."
 *      operationId: "logout User"
 *      produces:
 *      - "application/json"
 *      parameters:
 *      - in: "body"
 *        name: "body"
 *        description: "logout user "
 *        required: true
 *      responses:
 *       200:
 *         description: Logged out
 *       400:
 *         description: Erreur
 */
//********************LogOut********************//
router.delete("/logout", async (req, res) => {
  const RefreshToken = req.body.token;
  tokenList = tokenList.filter((token) => token !== refreshToken);
  res.status(200).json("You logged out successfully.");
});
/**
 * @swagger
 * /api/user/resetPassword:
 *    patch:
 *      tags:
 *      - "user"
 *      summary: "Reset users's password "
 *      description: "This will reset user's password ."
 *      operationId: "resetPassword"
 *      produces:
 *      - "application/json"
 *      parameters:
 *      - in: "body"
 *        name: "body"
 *        description: "Password is changed !"
 *        required: true
 *   	  security:
 *	     - bearerAuth: []
 *      responses:
 *       200:
 *         description: Successful operation
 *       400:
 *         description: Erreur
 */
//********************resetPassword********************//
router.patch("/resetPassword", async (req, res, next) => {
  const schema = joi.object({
    newPass: joi.string().required(),
    newPass2: joi.string().required(),
  });
  const { error } = schema.validate(req.body);
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    res.status(400).json("Token is not found !");
  } else {
    const decoded = jwt_decode(token);
    try {
      const user = await User.findById(decoded._id);
      //**PASSWORD IS CORRECT**//
      const validPass = await bcrypt.compare(req.body.password, user.password);
      if (!validPass) return res.status(400).json("Invalid password");
      if (req.body.newPass === req.body.newPass2) {
        //**hash the passwords**//
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.newPass, salt);
        user.password = hashedPassword;
        await user.save();
        //await token.delete();
        res.json({ data: user });
      } else {
        res.json("Try again");
      }
    } catch (err) {
      res.status(400).json("id is not found");
    }
  }
});

/**
 * @swagger
 * /api/user/newPasswordReset:
 *    post:
 *      tags:
 *      - "user"
 *      summary: "Reset user's password "
 *      description: "This will reset forgotten user's password ."
 *      operationId: "newPasswordReset"
 *      produces:
 *      - "application/json"
 *      parameters:
 *      - in: "body"
 *        name: "body"
 *        description: "New password saved !"
 *        required: true
 *   	  security:
 *	     - bearerAuth: []
 *      responses:
 *       200:
 *         description: Successful operation
 *       400:
 *         description: Erreur
 */
//********************newPasswordReset********************//
router.post("/newPasswordReset", async (req, res) => {
  /////////////validator///////////
  const schema = joi.object({
    token: joi.string().required(),
    password: joi.string().required(),
    confirmPassword: joi.string().required(),
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json(error.details[0].message);
  const token = req.body.token;
  if (!token) {
    res.status(400).json("Token is not found !");
  } else {
    const decoded = jwt_decode(token);
    expiredToken(token);
    try {
      const user = await User.findById(decoded._id);
      //**PASSWORD IS CORRECT**//
      if (user.tokenMail === token) {
        if (req.body.password === req.body.confirmPassword) {
          //**hash the passwords**//
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(req.body.password, salt);
          user.password = hashedPassword;
          user.tokenMail = "";
          await user.save();
          ///////////////////////////////
          let token = generatetoken(
            { _id: user._id, permissions: user.permissions },
            "200s"
          );
          let refresh = generatetoken(
            { _id: user._id, permissions: user.permissions },
            "200s"
          );
          const result = {
            "New AcessToken": token,
            "New RefreshToken": refresh,
          };
          res.json({ data: user, result });
        } else {
          res.status(400).json("Invalid passsword try again");
        }
      } else {
        res.status(400).json("Invalid token or expired");
      }
    } catch (err) {
      res.status(400).json(err);
    }
  }
});

/**
 * @swagger
 * /api/user/deleteUser:
 *    delete:
 *      tags:
 *      - "user"
 *      summary: "Delete user's account ."
 *      description: "This will delete user's account  ."
 *      operationId: "deleteUser"
 *      produces:
 *      - "application/json"
 *      parameters:
 *      - in: "body"
 *        name: "body"
 *        description: " Account deleted !"
 *        required: true
 *   	  security:
 *	     - bearerAuth: []
 *      responses:
 *       200:
 *         description: Deleted
 *       400:
 *         description: Erreur
 */
//********************sendMail********************//
router.post("/sendMail", async (req, res) => {
  try {
    /////////////validator///////////
    const schema = joi.object({ email: joi.string().email().required() });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json(error.details[0].message);
    ////:nhawem aal email mt3 el user
    const user = await User.findOne({ email: req.body.email });
    if (!user)
      return res.status(400).json("user with given email doesn't exist");
    ////:nasna3 el token
    let token = generatetoken({ _id: user._id }, "200s");
    user.tokenMail = token;
    await user.save();
    const link = `${process.env.RESET_URL}?token=${token}`;
    await sendEmail(user.email, "Password reset", link);
    res.json("password reset link sent to your email account");
  } catch (error) {
    res.status(400);
    res.json("An error occured");
  }
});

//********************getByIdUser********************//

router.post("/getByIdUser", authorization("ADMIN"), async (req, res) => {
  //**let's validate the data before we make a user**//
  const schema = joi.object({
    id: joi.string().required(),
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json(error.details[0].message);

  //**checking if the product exists**//.

  const user = await User.findById(req.body.id);
  if (user) {
    const result = {
      status: "User ",
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      cin: user.cin,
      email: user.email,
      gender: user.gender,

      telNumber: user.telNumber,
      birthDate: user.birthDate,
      pays: user.pays,
      adresse: user.adresse,
      postalCode: user.postalCode,

      city: user.city,
      permissions: user.permissions,
      createdAt: user.createdAt,
    };
    res.send({ result });
  } else {
    return res.status(400).json("User is not found");
  }
});
//********************EXPORTS********************//
module.exports = router;
