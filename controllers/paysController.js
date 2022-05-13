const router = require("express").Router();
const joi = require("@hapi/joi");
const jwt = require("jsonwebtoken");
//const {ajouterPaysValidation}= require("../functions & middlewares/validation");
const Pays = require("../model/Pays");

const { authorization } = require("../functions & middelwares/authorization");

const ajouterPaysValidation = (data) => {
  const schema = {
    paysRisque: joi.number().required(),
    pays: joi.string().required(),
  };
  return joi.validate(data, schema);
};

//**********Ajouter pays *******************************/
/**
 * @swagger
 * /api/admin/ajouterPays:
 *    post:
 *      tags:
 *      - "admin"
 *      summary: "Create country"
 *      description: "This can only be done by the token of the superadmin."
 *      operationId: "createCountry"
 *      produces:
 *      - "application/json"
 *      parameters:
 *      - in: "body"
 *        name: "body"
 *        description: "Created country"
 *        required: true
 *      responses:
 *       200:
 *         description: Created
 */

router.post(
  "/ajouterPays",
  /*  authorization(["ADMIN"]) ,*/ async (req, res) => {
    // validation de data

    const { error } = ajouterPaysValidation(req.body);
    if (error) return res.status(400).json(error.details[0].message);

    // creation de pays

    const pays = new Pays({
      pays: req.body.pays,
      paysRisque: req.body.paysRisque,
    });
    try {
      const savedPays = await pays.save();

      const result = {
        status: "added country.",
        id: pays._id,
        paysRisque: pays.paysRisque,
        pays: pays.pays,
      };

      res.json({ result });
    } catch (error) {
      res.status(400).json(error);
    }
  }
);

/******************************consulterPays******************************/
/**
 * @swagger
 * /api/admin/consulterPays:
 *    post:
 *      tags:
 *      - "admin"
 *      summary: "consulting countries"
 *      description: "This can only be done by the token of the admin."
 *      operationId: "conultedcountry"
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
router.post("/consulterPays", authorization(["ADMIN"]), async (req, res) => {
  //**let's validate the data before we make a pays**//
  const schema = joi.object({
    id: joi.string().required(),
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json(error.details[0].message);

  //**checking if the email exists**//.

  const pays = await Pays.findById(req.body.id);
  if (!pays) return res.status(400).json("Pays is not found");

  const result = {
    status: "Pays :",
    id: pays._id,
    paysRisque: pays.paysRisque,
    pays: pays.pays,
  };
  res.json({ result });
});

///////UPDATING COUNTRY///////////

/**
 * @swagger
 * /api/pays/updatePays:
 *    patch:
 *      tags:
 *      - "pays"
 *      summary: "update pays"
 *      description: "Updating pays."
 *      operationId: "updatePays"
 *      produces:
 *      - "application/json"
 *      parameters:
 *      - in: "body"
 *        name: "body"
 *        description: "update Pays"
 *        required: true
 *      responses:
 *       200:
 *         description: Created
 */
//********************Updatepays********************//
router.patch(
  "/updatePays",
  authorization(["ADMIN"]),
  async (req, res, next) => {
    try {
      const paysId = req.query.id;
      const pays = await Pays.findById(paysId);
      if (!pays) res.json("Pays is not found .");
      Object.assign(pays, req.body);
      pays.save();
      res.json({ data: pays });
    } catch (err) {
      res.status(400).json("Pays is not found .");
    }
  }
);

/**
 * @swagger
 * /api/admin/listingPays:
 *    get:
 *      tags:
 *      - "pays"
 *      summary: "Listing Pays"
 *      description: "Lister tous les pays"
 *      operationId: "listingPays"
 *      produces:
 *      - "application/json"
 *      responses:
 *       200:
 *         description: Created
 */
//********************listingPays********************//
router.get("/listingPays", authorization(["ADMIN"]), async (req, res, next) => {
  let pays;
  try {
    const { page = 1, limit = 2 } = req.query;
    pays = await Pays.find({}, "-password")
      .limit(limit * 1)
      .skip((page - 1) * limit);
  } catch (err) {
    res.status(400).json(err);
  }
  res.json({
    pays: pays.map((pays) => pays.toObject({ getters: true })),
  });
});
/**
 * @swagger
 * /api/admin/deletePays:
 *    post:
 *      tags:
 *      - "admin"
 *      summary: "deleting country"
 *      description: "This can only be done by the token of the admin."
 *      operationId: "deletePays"
 *      produces:
 *      - "application/json"
 *      parameters:
 *      - in: "body"
 *        name: "body"
 *        description: "DELETED COUNTRY"
 *        required: true
 *      responses:
 *       200:
 *         description: Created
 */
router.delete(
  "/deletePays",
  authorization(["ADMIN"]),
  async (req, res, next) => {
    const paysId = req.query.id;
    const pays = await Pays.findById(paysId);
    if (!pays) res.json("country is not found .");

    try {
      await pays.remove();
    } catch (err) {
      res.json("Something went wrong, could not delete country.", 500);
    }
    res.status(200).json({ message: "Deleted country." });
  }
);

module.exports = router;
