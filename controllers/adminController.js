const router = require("express").Router();
const Admin = require("../model/Admin");
const User = require("../model/User");
const bcrypt = require("bcryptjs");
const joi = require("@hapi/joi");
const sendEmail = require("../functions & middelwares/sendEmail");
const sendFile = require("../functions & middelwares/upload");
const {
  registerValidationAdmin,
  loginValidation,
} = require("../functions & middelwares/validation");
const {
  generatetoken,
  expiredToken,
} = require("../functions & middelwares/generate & verifyToken");
const { authorization } = require("../functions & middelwares/authorization");
const jwt_decode = require("jwt-decode");

let Admin_tokenList = [];
/**
 * @swagger
 * /api/admin/register:
 *    post:
 *      tags:
 *      - "admin"
 *      summary: "Create admin"
 *      description: "This can only be done by the token of the sueper admin."
 *      operationId: "createAdmin"
 *      produces:
 *      - "application/json"
 *      parameters:
 *      - in: "body"
 *        name: "body"
 *        description: "Created admin object"
 *        required: true
 *   	  security:
 *	     - bearerAuth: []
 *      responses:
 *       200:
 *         description: Created
 *       400:
 *         description: Erreur
 */
/**********************************Register**********************************/
router.post("/register", authorization("SUPERADMIN"), async (req, res) => {
  //**let's validate the data before we make a admin**//
  const { error } = registerValidationAdmin(req.body);
  if (error) return res.status(400).json(error.details[0].message);
  //**checking if the admin is already in the database**//
  const emailExist = await Admin.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).json("Email already exists .");
  //**hash the passwords**//
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);
  //******************** create new admin********************//
  const admin = new Admin({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    permissions: req.body.permissions,
    telNumber: req.body.telNumber,
    password: hashedPassword,
  });
  try {
    const savedAdmin = await admin.save();
    let token = generatetoken(
      { _id: admin._id, permissions: admin.permissions },
      "200s"
    );
    let refresh = generatetoken(
      { _id: admin._id, permissions: admin.permissions },
      "200s"
    );
    Admin_tokenList[refresh] = {
      id: admin.id,
      token: token,
      refreshToken: refresh,
      email: admin.email,
      telNumber: admin.telNumber,
      firstName: admin.firstName,
      lastName: admin.lastName,
      permissions: admin.permissions,
    };
    const result = {
      status: "You've been registred ",
      AccessToken: token,
      RefreshToken: refresh,
      id: admin._id,
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      telNumber: admin.telNumber,
      permissions: admin.permissions,
      createdAt: admin.createdAt,
    };
    res.json({ result });
  } catch (err) {
    res.status(400).json(err);
  }
});
/**
 * @swagger
 * /api/admin/login:
 *    post:
 *      tags:
 *      - "admin"
 *      summary: "loging in  admin"
 *      description: "This can only be done by the token of the sueper admin."
 *      operationId: "logedAdmin"
 *      produces:
 *      - "application/json"
 *      parameters:
 *      - in: "body"
 *        name: "body"
 *        description: "loged admin object"
 *        required: true
 *      responses:
 *       200:
 *          description: "successful operation"
 *       400:
 *         description: Erreur
 */
//******************************Login******************************//
router.post("/login", async (req, res) => {
  //**let's validate the data before we make a admin**//
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).json(error.details[0].message);
  //**checking if the email exists**//
  const admin = await Admin.findOne({ email: req.body.email });
  if (!admin) return res.status(400).json("Email is not found");
  //**PASSWORD IS CORRECT**//
  const validPass = await bcrypt.compare(req.body.password, admin.password);
  if (!validPass) return res.status(400).json("Invalid password");
  //*** ASSIGN A TOKEN ***//
  let token = generatetoken(
    { _id: admin._id, permissions: admin.permissions },
    "200s"
  );
  let refresh = generatetoken(
    { _id: admin._id, permissions: admin.permissions },
    "200s"
  );
  Admin_tokenList[refresh] = {
    id: admin.id,
    token: token,
    refreshToken: refresh,
    email: admin.email,
    telNumber: admin.telNumber,
    firstName: admin.firstName,
    lastName: admin.lastName,
    permissions: admin.permissions,
  };
  const result = {
    status: "LOGGED IN SUCCCESS ",
    id: admin._id,
    AccessToken: token,
    RefreshToken: refresh,
    firstName: admin.firstName,
    lastName: admin.lastName,
    email: admin.email,
    telNumber: admin.telNumber,
    permissions: admin.permissions,
    createdAt: admin.createdAt,
  };
  res.json({ result });
});
/**
 * @swagger
 * /api/admin/updateAdmin:
 *    patch:
 *      tags:
 *      - "admin"
 *      summary: "update admin"
 *      description: "This can only be done by the token of the sueper admin."
 *      operationId: "updateAdmin"
 *      produces:
 *      - "application/json"
 *      parameters:
 *      - in: "body"
 *        name: "body"
 *        description: "update Admin"
 *        required: true
 *      responses:
 *       200:
 *         description: Created
 *       400:
 *         description: Erreur
 */
//********************UpdateAdmin********************//
router.patch("/updateAdmin", async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    res.status(400).json("Token is not found !");
  } else {
    const decoded = jwt_decode(token);
    try {
      const admin = await Admin.findById(decoded._id, "-password");
      //********************Upload********************
      var path = require("path");
      originPath = path.resolve(`uploads`);
      if (path.extname(req.file.originalname) === ".png" || ".jpg") {
        const filePath = originPath + `/${decoded._id}`;
        sendFile(req.file, filePath);
        admin.avatar = filePath + `/${Date.now()}${req.file.originalname}`;
      } else {
        res.status(400).json("the extension must be png or jpg");
      }
      Object.assign(admin, req.body);
      admin.save();
      res.json({ data: admin });
    } catch (err) {
      res.status(400).json("id is not found");
    }
  }
});

/**
 * @swagger
 * /api/admin/refreshToken:
 *    patch:
 *      tags:
 *      - "admin"
 *      summary: "Update Token"
 *      description: "This can only be done by the token of the sueper admin."
 *      operationId: "UpdateToken"
 *      produces:
 *      - "application/json"
 *      parameters:
 *      - in: "body"
 *        name: "body"
 *        description: "Update Token "
 *        required: true
 *      responses:
 *       200:
 *         description: Created
 *       400:
 *         description: Erreur
 */
//********************UpdateToken********************//
router.post("/refreshToken", async (req, res, next) => {
  try {
    const { refrech } = req.body;
    if (refrech && Admin_tokenList[refrech].refreshToken === refrech) {
      const admin = {
        id: Admin_tokenList[req.body.refrech].id,
        email: Admin_tokenList[req.body.refrech].email,
        firstName: Admin_tokenList[req.body.refrech].firstName,
        lastName: Admin_tokenList[req.body.refrech].lastName,
        permissions: Admin_tokenList[req.body.refrech].permissions,
      };
      let token = generatetoken(
        { _id: admin._id, permissions: admin.permissions },
        "200s"
      );
      let refresh = generatetoken(
        { _id: admin._id, permissions: admin.permissions },
        "200s"
      );
      const result = {
        "New AcessToken": token,
        "New RefreshToken": refresh,
      };
      /// update token ON
      Admin_tokenList[refrech].token = token;
      Admin_tokenList[refrech].refreshToken = refresh;
      Admin_tokenList[refresh] = {
        ...Admin_tokenList[refrech],
        token: token,
        refreshToken: refresh,
      };
      Admin_tokenList = Admin_tokenList.filter((token) => token !== refrech);
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
 * /api/admin/ListingAdmin:
 *    get:
 *      tags:
 *      - "admin"
 *      summary: "Listing Admin"
 *      description: "This can only be done by the token of the admin or the super admin."
 *      operationId: "ListingAdmin"
 *      produces:
 *      - "application/json"
 *      responses:
 *       200:
 *         description: Created
 *       400:
 *         description: Erreur
 */
//********************ListingAdmin********************//
router.get(
  "/listingAdmin",
  authorization("SUPERADMIN"),
  async (req, res, next) => {
    let admins;
    try {
      const { page = 1, limit = 2 } = req.query;
      admins = await Admin.find({}, "-password")
        .limit(limit * 1)
        .skip((page - 1) * limit);
    } catch (err) {
      res.status(400).json(err);
    }
    res.json({
      admins: admins.map((admin) => admin.toObject({ getters: true })),
    });
  }
);
/**
 * @swagger
 * /api/admin/listingUser:
 *    get:
 *      tags:
 *      - "admin"
 *      summary: "listing User"
 *      description: "This can only be done by the token of the admin or the super admin."
 *      operationId: "listingUser"
 *      produces:
 *      - "application/json"
 *      responses:
 *       200:
 *         description: Created
 *       400:
 *         description: Erreur
 */
//********************ListingUser********************//
router.get("/listingUser", authorization("ADMIN"), async (req, res, next) => {
  let users;
  try {
    const { page = 1, limit = 2 } = req.query;
    users = await User.find({}, "-password")
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.status(403).json("There is no users !");

    const count = await User.count();
    const nbpage = Math.ceil(count / limit);
    res.json({
      users: users.map((user) => user.toObject({ getters: true })),
      count,
      nbpage,
    });
  } catch (err) {
    res.status(400).json(err);
  }
});
/**
 * @swagger
 * /api/admin/listingAll:
 *    get:
 *      tags:
 *      - "admin"
 *      summary: "listing All"
 *      description: "This can only be done by the token of the admin or the super admin."
 *      operationId: "listingAll"
 *      produces:
 *      - "application/json"
 *      responses:
 *       200:
 *         description: Created
 *       400:
 *         description: Erreur
 */
//********************ListingAll********************//
router.get(
  "/listingAll",
  authorization("SUPERADMIN"),
  async (req, res, next) => {
    let users;
    let admins;
    try {
      const { page = 1, limit = 2 } = req.query;
      admins = await Admin.find({}, "-password");
      users = await Admin.find({}, "-password")
        .limit(limit * 1)
        .skip((page - 1) * limit);
    } catch (err) {
      res.status(400).json(err);
    }
    admins: admins.map((admin) => admin.toObject({ getters: true }));
    users: users.map((user) => user.toObject({ getters: true }));
    let x = [admins, users];
    res.json(x);
  }
);
/**
 * @swagger
 * /api/admin/logout:
 *    delete:
 *      tags:
 *      - "admin"
 *      summary: "logout Admin"
 *      description: "This can only be done by the token of the admin or the super admin."
 *      operationId: "logout admin"
 *      produces:
 *      - "application/json"
 *      parameters:
 *      - in: "body"
 *        name: "body"
 *        description: "logout Admin"
 *        required: true
 *      responses:
 *       200:
 *         description: Logged OUt
 *       400:
 *         description: Erreur
 */
//********************LogOut********************//
router.delete("/logout", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    res.status(401).json("Token is not found");
  } else {
    Admin_tokenList = Admin_tokenList.filter((token) => token !== refreshToken);
    res.status(200).json("You logged out successfully.");
  }
});
/**
 * @swagger
 * /api/admin/resetPassword:
 *    patch:
 *      tags:
 *      - "admin"
 *      summary: "Reset admin's password "
 *      description: "This will reset admin's password ."
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
  if (error) return res.status(400).json(error.details[0].message);

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    res.status(400).json("Token is not found !");
  } else {
    const decoded = jwt_decode(token);
    try {
      const admin = await Admin.findById(decoded._id);
      //**PASSWORD IS CORRECT**//
      const validPass = await bcrypt.compare(req.body.password, admin.password);
      if (!validPass) return res.status(400).json("Invalid password");
      if (req.body.newPass === req.body.newPass2) {
        //**hash the passwords**//
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.newPass, salt);
        admin.password = hashedPassword;
        await admin.save();
        //await token.delete();
        res.json({ data: admin });
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
 * /api/admin/newPasswordReset:
 *    post:
 *      tags:
 *      - "admin"
 *      summary: "Reset admin's password "
 *      description: "This will reset forgotten admin's password ."
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
      const admin = await Admin.findById(decoded._id);
      //**PASSWORD IS CORRECT**//
      if (admin.tokenMail === token) {
        if (req.body.password === req.body.confirmPassword) {
          //**hash the passwords**//
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(req.body.password, salt);
          admin.password = hashedPassword;
          admin.tokenMail = "";
          await admin.save();
          ///////////////////////////////
          let token = generatetoken(
            { _id: admin._id, permissions: admin.permissions },
            "200s"
          );
          let refresh = generatetoken(
            { _id: admin._id, permissions: admin.permissions },
            "200s"
          );
          const result = {
            "New AcessToken": token,
            "New RefreshToken": refresh,
          };
          res.json({ data: admin, result });
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
 * /api/admin/sendMail:
 *    post:
 *      tags:
 *      - "admin"
 *      summary: "Send email ."
 *      description: "This will send email ."
 *      operationId: "sendMail"
 *      produces:
 *      - "application/json"
 *      parameters:
 *      - in: "body"
 *        name: "body"
 *        description: " Sent Email !"
 *        required: true
 *   	  security:
 *	     - bearerAuth: []
 *      responses:
 *       200:
 *         description: Successful operation
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
    ////:nhawem aal email mt3 el admin
    const admin = await Admin.findOne({ email: req.body.email });
    if (!admin)
      return res.status(400).json("admin with given email doesn't exist");
    ////:nasna3 el token
    let token = generatetoken({ _id: admin._id }, "200s");
    admin.tokenMail = token;
    await admin.save();
    const link = `${process.env.BASE_URL}/admin/newPasswordReset?token=${token}`;
    await sendEmail(admin.email, "Password reset", link);
    res.json("password reset link sent to your email account");
  } catch (error) {
    res.status(400);
    res.json("An error occured");
  }
});
/**
 * @swagger
 * /api/admin/deleteAdmin:
 *    delete:
 *      tags:
 *      - "admin"
 *      summary: "Delete Admin's account ."
 *      description: "This will delete Admin's account  ."
 *      operationId: "createAdmin"
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
router.delete(
  "/deleteAdmin",
  authorization("SUPERADMIN"),
  async (req, res, next) => {
    const adminId = req.query.id;
    const admin = await Admin.findById(adminId);
    if (!admin) res.status(400).json("admin is not found .");

    try {
      await admin.remove();
    } catch (err) {
      res.json("Something went wrong, could not delete Admin.");
    }
    res.status(200).json({ message: "Deleted Admin." });
  }
);
/**
 * @swagger
 * /api/admin/deleteUser:
 *    delete:
 *      tags:
 *      - "admin"
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
router.delete("/deleteUser", authorization("ADMIN"), async (req, res, next) => {
  const userId = req.query.id;
  const user = await User.findById(userId);
  if (!user) res.status(400).json("user is not found .");

  try {
    await user.remove();
  } catch (err) {
    res.json("Something went wrong, could not delete user.");
  }
  res.status(200).json({ message: "Deleted user." });
});

//********************EXPORTS********************//
module.exports = router;
module.exports.authorization = authorization;
