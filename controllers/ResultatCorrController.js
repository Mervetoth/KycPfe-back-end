const router = require("express").Router();
const ResultatCorr = require("../model/ResultatCorr");
const joi = require("@hapi/joi");
const {
  ajouerProduitValidation,
} = require("../functions & middelwares/validation");
/**
 * @swagger
 * /api/admin/ajouterProduit:
 *    post:
 *      tags:
 *      - "resultatCorr"
 *      summary: "Create Match Result "
 *      description: "Crating Match Result "
 *      operationId: "createproduct"
 *      produces:
 *      - "application/json"
 *      parameters:
 *      - in: "body"
 *        name: "body"
 *        description: "Created Match Result  object"
 *        required: true
 *   	  security:
 *	     - bearerAuth: []
 *      responses:
 *       200:
 *         description: Created
 */

/**********************************ajouterProduit**********************************/
router.post("/ajouterProduit", async (req, res) => {
  //**let's validate the data before we make a resultatCorr**//

  const { error } = ajouerProduitValidation(req.body);
  if (error) return res.status(400).json(error.details[0].message);


  //******************** create new Match Result ********************//
  const resultatCorr = new ResultatCorr({
    userId: req.body.userId,
    prodName: req.body.prodName,
  });
  try {
    await resultatCorr.save();

    const result = {
      status: "Created Match Result  .",
      id: resultatCorr._id,
      userId: resultatCorr.userId,
      prodName: resultatCorr.prodName,
    };
    res.json({ result });
  } catch (err) {
    res.status(400).json(err);
  }
});
/**
 * @swagger
 * /api/admin/consulterProduit:
 *    post:
 *      tags:
 *      - "resultatCorr"
 *      summary: "Consult Match Result "
 *      description: "Consulting Match Result "
 *      operationId: "consulterProduit"
 *      produces:
 *      - "application/json"
 *      parameters:
 *      - in: "body"
 *        name: "body"
 *        description: "Search Match Result "
 *        required: true
 *   	  security:
 *	     - bearerAuth: []
 *      responses:
 *       200:
 *         description: Consulted
 */

//******************************consulterProduit******************************//
router.post("/consulterProduit", async (req, res) => {
  //**let's validate the data before we make a resultatCorr**//
  const schema = joi.object({
    id: joi.string().required(),
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json(error.details[0].message);

  //**checking if the email exists**//.

  const resultatCorr = await ResultatCorr.findById(req.body.id);
  if (!resultatCorr) return res.status(400).json("Product is not found");

  const result = {
    status: "Product :",
    id: resultatCorr._id,
    userId: resultatCorr.userId,
    prodName: resultatCorr.prodName,
  };
  res.json({ result });
});
/**
 * @swagger
 * /api/resultatCorr/updateProduit:
 *    patch:
 *      tags:
 *      - "resultatCorr"
 *      summary: "update resultatCorr"
 *      description: "Updating Match Result ."
 *      operationId: "updateProduit"
 *      produces:
 *      - "application/json"
 *      parameters:
 *      - in: "body"
 *        name: "body"
 *        description: "update ResultatCorr"
 *        required: true
 *      responses:
 *       200:
 *         description: Updated
 */
//********************UpdateAdmin********************//
router.patch("/updateProduit", async (req, res, next) => {
  try {
    const produitId = req.query.id;
    const resultatCorr = await ResultatCorr.findById(produitId);
    if (!resultatCorr) res.json("Product is not found .");
    Object.assign(resultatCorr, req.body);
    resultatCorr.save();
    res.json({ data: resultatCorr });
  } catch (err) {
    res.status(400).json("Product is not found .");
  }
});

/**
 * @swagger
 * /api/admin/listingProduit:
 *    get:
 *      tags:
 *      - "resultatCorr"
 *      summary: "Listing ResultatCorr"
 *      description: "Lister tous les produits"
 *      operationId: "listingProduit"
 *      produces:
 *      - "application/json"
 *      responses:
 *       200:
 *         description: Listed
 */
//********************listingProduit********************//
router.get("/listingProduit", async (req, res, next) => {
  let produits;
  try {
    const { page = 1, limit = 2 } = req.query;
    produits = await ResultatCorr.find({}, "-password")
      .limit(limit * 1)
      .skip((page - 1) * limit);
  } catch (err) {
    res.status(400).json(err);
  }
  res.json({
    produits: produits.map((resultatCorr) => resultatCorr.toObject({ getters: true })),
  });
});
/**
 * @swagger
 * /api/admin/deleteProduit:
 *    delete:
 *      tags:
 *      - "resultatCorr"
 *      summary: "Deleting ResultatCorr"
 *      description: "Suppromer un resultatCorr ."
 *      operationId: "deleteProduit"
 *      produces:
 *      - "application/json"
 *      responses:
 *       200:
 *         description: Deleted
 */
router.delete("/deleteProduit", async (req, res, next) => {
  const produitId = req.query.id;
  const resultatCorr = await ResultatCorr.findById(produitId);
  if (!resultatCorr) res.json("Product is not found .");

  try {
    await resultatCorr.remove();
  } catch (err) {
    res.json(
      "Something went wrong, could not delete Match Result .",
      500
    );
   
  }
  res.status(200).json({ message: "Deleted Match Result ." });
});
module.exports = router;
