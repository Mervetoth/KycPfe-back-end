const router = require("express").Router();
const Recherche = require("../model/Recherche");
const joi = require("@hapi/joi");
const Admin = require("../model/Admin");
const User = require("../model/User");
const jwt_decode = require("jwt-decode");
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
 *   	  security:
 *	     - bearerAuth: []
 *      responses:
 *       200:
 *         description: Created
 */

/**********************************ajouterRecherche**********************************/
router.post("/ajouterRecherche", authorization("ADMIN"), async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    res.status(400).json("Token is not found");
  } else {
    const decoded = jwt_decode(token);
    console.log("decoded");
    const admin = await Admin.findById(decoded._id, "-password");
    //**let's validate the data before we make a Recherche**//

    const { error } = ajouterRechercheValidation(req.body);
    if (error) return res.status(400).json(error.details[0].message);

    //**checking if the user is already in the database**//
    const user = await User.findOne({ cin: req.body.cin });
    if (!user)
      return res.status(400).json("User with this cin doesn't exists .");
////////////////////////////////////////////
    //******************** create new Search result ********************//
    const recherche = new Recherche({
      typeRech: req.body.typeRech,
      cin: req.body.cin,
      firstName: user.firstName,
      lastName: user.lastName,
      adminId: decoded._id,
      status: req.body.status,
      listeId: req.body.listeId,
      historiqueRech: req.body.historiqueRech,
      listeCorr: req.body.listeCorr,
    });
    try {
      await recherche.save();

      const result = {
        status: "Recherche bien effectué .",
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
    } catch (err) {
      res.status(400).json(err);
    }
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
