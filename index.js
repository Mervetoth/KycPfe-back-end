const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
//********************import Routes********************//
const adminController = require("./controllers/adminController");
const userController = require("./controllers/userController.js");
const productController = require("./controllers/productController");
const rechercheController = require("./controllers/rechercheController");
const ResultatCorr = require("./controllers/ResultatCorrController");
const paysController = require("./controllers/paysController");
const notif = require("./controllers/notificationController");

const dotenv = require("dotenv");
const multer = require("multer");
const upload = multer();
app.use("uploads", express.static("uploads"));
app.use(express.urlencoded({ extended: true }));
app.use(upload.single("file"));
dotenv.config();
module.exports = upload;
//********************Middlewares********************//
app.use(bodyParser.json());
app.use(express.json());
//********************Connect to Db********************//
//mongoose.connect(process.env.DB_CONNECT, () => console.log("connected to db"));
var MongoClient = require("mongodb").MongoClient;
// Connect to the db
const url = "mongodb://127.0.0.1:27017/kycApp";
(async () => {
  try {
    await mongoose.connect(url, {});
    console.log(`MongoDB Connected: ${url}`);
  } catch (err) {
    console.error(err);
  }
})();
//********************Route Middlewares********************//
app.use("/api/user", userController);
app.use(
  "/api/admin",
  adminController,
  productController,
  rechercheController,
  notif,
  ResultatCorr,
  paysController
);
//********************Swagger********************//
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "KYC REST API",
      description:
        "A REST API built with Express and MongoDB. This documentation provides informations about all api's in this application  .",
    },
    securityDefinitions: {
      bearerAuth: {
        type: "apiKey",
        name: "Authorization",
        scheme: "bearer",
        in: "header",
      },
    },
  },
  apis: ["./controllers/*.js"],
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
//******************** Conn.avec le serveur ********************//
app.listen(3000, () => console.log("Server up and runnig"));
