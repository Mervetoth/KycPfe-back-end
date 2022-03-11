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

  //**checking if the tel is already in the database**//
  const pays_idExist = await Pays.findOne({ pays_id: req.body.pays_id });
  if (!pays_idExist)
    return res.status(400).json("User must belong to an existing country .");

  //**checking if the tel is already in the database**//
  const prod_idExist = await Produit.findOne({ prod_id: req.body.prod_id });
  if (!prod_idExist) return res.status(400).json("Product not found .");
  //**hash the passwords**//
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);
  //******************** create new user********************//
  const user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    pays_id: req.body.pays_id,
    prod_id: req.body.prod_id,
    adresse: req.body.adresse,
    birthDate: req.body.birthDate,
    cin: req.body.cin,
    telNumber: req.body.telNumber,
    email: req.body.email,
    permissions: req.body.permissions,
    password: hashedPassword,
  });
  try {
    const savedUser = await user.save();
    let token = generatetoken(
      { _id: user._id, permissions: user.permissions },
      "200s"
    );
    let refresh = generatetoken(
      { _id: user._id, permissions: user.permissions },
      "200s"
    );
    const result = {
      status: "You've been registred ",
      AccessToken: token,
      RefreshToken: refresh,
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      pays_id: user.pays_id,
      prod_id: user.prod_id,
      birthDate: user.birthDate,
      cin: user.cin,
      telNumber: user.telNumber,
      adresse: user.adresse,
      permissions: user.permissions,
      createdAt: user.createdAt,
    };
    res.json({ token, refresh, result });
    //    res.header("auth-token", token).json(token, refresh, result);
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
 *        default:
 *          description: "Successful operation"
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
    pays_id: user.pays_id,
    prod_id: user.prod_id,
    adresse: user.adresse,
    permissions: user.permissions,
    createdAt: user.createdAt,
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
    telNumber: user.telNumber,
    birthDate: user.birthDate,
    pays_id: user.pays_id,
    prod_id: user.prod_id,
    adresse: user.adresse,
    permissions: user.permissions,
    createdAt: user.createdAt,
  };
  res.header("auth-token", token).json(result);
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
        pays_id: tokenList[req.body.refrech].pays_id,
        prod_id: tokenList[req.body.refrech].prod_id,
        permissions: tokenList[req.body.refrech].permissions,
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
 */
//********************UpdateUser********************//
router.patch("/updateUser", async (req, res, next) => {
  try {
    const user = await User.findById(req.query.id, "-password");
    //********************Upload********************
    var path = require("path");
    originPath = path.resolve(`uploads`);
    if (path.extname(req.file.originalname) === ".png" || ".jpg") {
      const filePath = originPath + `/${user.id}`;
      console.log(filePath);
      sendFile(req.file, filePath);
      user.avatar = filePath + `/${Date.now()}${req.file.originalname}`;
    } else {
      res.status(400).json("the extension must be png or jpg");
    }
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
    const link = `${process.env.BASE_URL}/user/newPasswordReset?token=${token}`;
    await sendEmail(user.email, "Password reset", link);
    res.json("password reset link sent to your email account");
  } catch (error) {
    res.status(400);
    res.json("An error occured");
  }
});
//********************EXPORTS********************//
module.exports = router;
