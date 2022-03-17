const router = require("express").Router();
const Recherche = require("../model/Recherche");
const joi = require("@hapi/joi");
const Admin = require("../model/Admin");
const ResultatCorr = require("../model/ResultatCorr");
const User = require("../model/User");
const jwt_decode = require("jwt-decode");
const fetch = require("node-fetch");
const { authorization } = require("../functions & middelwares/authorization");

const {
  ajouterRechercheValidation,
} = require("../functions & middelwares/validation");
/**
 * @swagger
 * /api/admin/ajouterRecherche:
 *    post:
 *      tags:
 *      - "Recherche"
 *      summary: "Create Search result "
 *      description: "Crating Search result "
 *      operationId: "createSearch result "
 *      produces:
 *      - "application/json"
 *      parameters:
 *      - in: "body"
 *        name: "body"
 *        description: "Created Search result  object"
 *        required: true
 *      security:
 *      - bearerAuth: []
 *      responses:
 *       200:
 *         description: Created
 */

/**********************************ajouterRecherche**********************************/
router.post("/rechercheLocal", authorization("ADMIN"), async (req, res) => {
  //**let's validate the data before we make a Recherche**//
  const schema = joi.object({
    cin: joi.string().required(),
    firstName: joi.string().required(),
    lastName: joi.string().required(),
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json(error.details[0].message);

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    res.status(400).json("Token is not found");
  } else {
    const decoded = jwt_decode(token);

    const admin = await Admin.findById(decoded._id, "-password");

    //**checking if the user is already in the database**//
    const user = await User.findOne({ cin: req.body.cin });
    if (!user) {
      var recherche = new Recherche({
        status: "Not found",
        typeRech: "Local",
        cin: req.body.cin,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        adminId: decoded._id,
      });
    } else {
      var recherche = new Recherche({
        status: "Found",
        typeRech: "Local",
        cin: req.body.cin,
        firstName: user.firstName,
        lastName: user.lastName,
        adminId: decoded._id,
      });
    }

    //******************** create new Search result ********************//

    try {
      await recherche.save();

      res.json({ recherche });
    } catch (err) {
      res.status(400).json(err);
    }
  }
});

/**********************************ajouterRecherche**********************************/
router.post("/rechercheOfac", authorization("ADMIN"), async (req, res) => {
  //**let's validate the data before we make a Recherche**//
  const schema = joi.object({
    firstName: joi.string().required(),
    country: joi.string(),
    lastName: joi.string().required(),
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json(error.details[0].message);

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    res.status(400).json("Token is not found");
  } else {
    const decoded = jwt_decode(token);

    const admin = await Admin.findById(decoded._id, "-password");

    (async () => {
      const rawResponse = await fetch("https://search.ofac-api.com/v3", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey: "abdfa087-4a94-440b-9893-8fd395f600da",
          cases: [{ name: req.body.firstName + " " + req.body.lastName }],
          source: ["SDN", "NONSDN", "DPL", "UN", "UK"],
        }),
      });

      const content = await rawResponse.json();
      verifyContent = JSON.stringify(content.matches).indexOf(",");

      var result = "";
      if (verifyContent === -1) {
        result = "Person is not found .";

        var recherche = new Recherche({
          status: "Not found",
          typeRech: "Individual",
          country: req.body.country,
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          adminId: decoded._id,
        });
      } else {
        result = "Person is found .";

        var recherche = new Recherche({
          status: "Found",
          typeRech: "Individual",
          country: req.body.country,
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          adminId: decoded._id,
        });

        var resultatCorr = new ResultatCorr({
          status: "Found",
          // userId: req.body.country,
          source:content.matches[req.body.firstName + " " + req.body.lastName][1].source,
          fullName:content.matches[req.body.firstName + " " + req.body.lastName][1].fullName,
          dob:content.matches[req.body.firstName + " " + req.body.lastName][1].dob,
          uid:content.matches[req.body.firstName + " " + req.body.lastName][1].addresses[0].uid,
          address1:content.matches[req.body.firstName + " " + req.body.lastName][1].addresses[0].address1,
          address2:content.matches[req.body.firstName + " " + req.body.lastName][1].addresses[0].address2,
          address3:content.matches[req.body.firstName + " " + req.body.lastName][1].addresses[0].address3,
          postalCode:content.matches[req.body.firstName + " " + req.body.lastName][1].addresses[0].postalCode,
          country:content.matches[req.body.firstName + " " + req.body.lastName][1].addresses[0].country,
          city:content.matches[req.body.firstName + " " + req.body.lastName][1].addresses[0].city,
          sdnType:content.matches[req.body.firstName+" "+req.body.lastName][1].sdnType,
          remarks:content.matches[req.body.firstName+" "+req.body.lastName][1].remarks,
          programs:content.matches[req.body.firstName+" "+req.body.lastName][1].programs,
          driversLicenses:content.matches[req.body.firstName+" "+req.body.lastName][1].driversLicenses,
          score:content.matches[req.body.firstName+" "+req.body.lastName][1].score,
          selectiodeRech:content.matches[req.body.firstName+" "+req.body.lastName][1].selectiodeRech,
          gender:content.matches[req.body.firstName+" "+req.body.lastName][1].gender,
          passports:content.matches[req.body.firstName+" "+req.body.lastName][1].passports,
          action:content.matches[req.body.firstName+" "+req.body.lastName][1].action,
/*           uid_a:content.matches[req.body.firstName + " " + req.body.lastName][1].akas[0].uid,
          score:content.matches[req.body.firstName + " " + req.body.lastName][1].akas[0].score,
          category:content.matches[req.body.firstName + " " + req.body.lastName][1].akas[0].category,
          lastName:content.matches[req.body.firstName + " " + req.body.lastName][1].akas[0].lastName,
          firstName:content.matches[req.body.firstName + " " + req.body.lastName][1].akas[0].firstName, */
        }) ;
      }
      console.log(
    content.matches[req.body.firstName + " " + req.body.lastName][1].akas[0]
      );
      //******************** create new Search result ********************//

      try {
        await recherche.save();
        //    await resultatCorr.save();

        res
          .status(200)
          .json({
            result,
            content:
              content.matches[req.body.firstName + " " + req.body.lastName],
          });
      } catch (err) {
        res.status(400).json(err);
      }
    })();
  }
});
/**
 * @swagger
 * /api/admin/getByIdRecherche:
 *    post:
 *      tags:
 *      - "Recherche"
 *      summary: "Consult Search result "
 *      description: "Consulting Search result "
 *      operationId: "getByIdRecherche"
 *      produces:
 *      - "application/json"
 *      parameters:
 *      - in: "body"
 *        name: "body"
 *        description: "Search Search result "
 *        required: true
 *   	  security:
 *	     - bearerAuth: []
 *      responses:
 *       200:
 *         description: Consulted
 */

//******************************getByIdRecherche******************************//
router.post("/getByIdRecherche", async (req, res) => {
  //**let's validate the data before we make a Recherche**//
  const schema = joi.object({
    id: joi.string().required(),
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json(error.details[0].message);

  //**checking if the email exists**//.

  const recherche = await Recherche.findById(req.body.id);
  if (!recherche) return res.status(400).json("Search result is not found");

  const result = {
    status: "Resultat de recherche :",
    id: recherche._id,
    typeRech: recherche.typeRech,
    cin: recherche.cin,
    firstName: recherche.firstName,
    lastName: recherche.lastName,
    adminId: recherche.adminId,
    status: recherche.status,
    listeId: recherche.listeId,
    historiqueRech: recherche.historiqueRech,
    listeCorr: recherche.listeCorr,
  };
  res.json({ result });
});
/**
 * @swagger
 * /api/Recherche/updateRecherche:
 *    patch:
 *      tags:
 *      - "Recherche"
 *      summary: "update Recherche"
 *      description: "Updating Search result ."
 *      operationId: "updateRecherche"
 *      produces:
 *      - "application/json"
 *      parameters:
 *      - in: "body"
 *        name: "body"
 *        description: "update Recherche"
 *        required: true
 *      responses:
 *       200:
 *         description: Updated
 */
//********************UpdateAdmin********************//
router.patch("/updateRecherche", async (req, res, next) => {
  try {
    const rechercheId = req.query.id;
    const recherche = await Recherche.findById(rechercheId);
    if (!recherche) res.json("Search result is not found .");
    Object.assign(recherche, req.body);
    recherche.save();
    res.json({ data: recherche });
  } catch (err) {
    res.status(400).json("Search result is not found .");
  }
});

/**
 * @swagger
 * /api/admin/listingRecherche:
 *    get:
 *      tags:
 *      - "Recherche"
 *      summary: "Listing Recherche"
 *      description: "Lister tous les recherches"
 *      operationId: "listingRecherche"
 *      produces:
 *      - "application/json"
 *      responses:
 *       200:
 *         description: Listed
 */
//********************listingRecherche********************//
router.get("/listingRecherche", async (req, res, next) => {
  let recherches;
  try {
    const { page = 1, limit = 2 } = req.query;
    recherches = await Recherche.find({}, "-password")
      .limit(limit * 1)
      .skip((page - 1) * limit);
  } catch (err) {
    res.status(400).json(err);
  }
  res.json({
    recherches: recherches.map((Recherche) =>
      Recherche.toObject({ getters: true })
    ),
  });
});
/**
 * @swagger
 * /api/admin/deleteRecherche:
 *    delete:
 *      tags:
 *      - "Recherche"
 *      summary: "Deleting Recherche"
 *      description: "Suppromer un Recherche ."
 *      operationId: "deleteRecherche"
 *      produces:
 *      - "application/json"
 *      responses:
 *       200:
 *         description: Deleted
 */
router.delete("/deleteRecherche", async (req, res, next) => {
  const rechercheId = req.query.id;
  const recherche = await Recherche.findById(rechercheId);
  if (!recherche) res.json("Search result is not found .");

  try {
    await recherche.remove();
  } catch (err) {
    res.send("Something went wrong, could not delete Search result.");
  }
  res.status(200).json({ message: "Deleted Search result ." });
});
module.exports = router;
