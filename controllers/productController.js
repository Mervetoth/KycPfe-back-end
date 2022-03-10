const router = require("express").Router();
const Produit = require("../model/Produit");
const joi = require("@hapi/joi");
const {
  ajouterProduitValidation,
} = require("../functions & middelwares/validation");
const { authorization } = require("../functions & middelwares/authorization");
/**
 * @swagger
 * /api/admin/ajouterProduit:
 *    post:
 *      tags:
 *      - "produit"
 *      summary: "Create product"
 *      description: "Crating product"
 *      operationId: "createproduct"
 *      produces:
 *      - "application/json"
 *      parameters:
 *      - in: "body"
 *        name: "body"
 *        description: "Created product object"
 *        required: true
 *   	  security:
 *	     - bearerAuth: []
 *      responses:
 *       200:
 *         description: Created
 */

/**********************************ajouterProduit**********************************/
router.post("/ajouterProduit", authorization(["ADMIN"]), async (req, res) => {
  //**let's validate the data before we make a produit**//

  const { error } = ajouterProduitValidation(req.body);
  if (error) return res.status(400).json(error.details[0].message);

  //******************** create new product********************//
  const produit = new Produit({
    risqueProd: req.body.risqueProd,
    prodName: req.body.prodName,
  });
  try {
    await produit.save();

    const result = {
      status: "Created product .",
      id: produit._id,
      risqueProd: produit.risqueProd,
      prodName: produit.prodName,
    };
    res.json({ result });
  } catch (err) {
    res.status(400).json(err);
  }
});
/**
 * @swagger
 * /api/admin/getByIdProduit:
 *    post:
 *      tags:
 *      - "produit"
 *      summary: "Consult product"
 *      description: "Consulting product"
 *      operationId: "getByIdProduit"
 *      produces:
 *      - "application/json"
 *      parameters:
 *      - in: "body"
 *        name: "body"
 *        description: "Search product"
 *        required: true
 *   	  security:
 *	     - bearerAuth: []
 *      responses:
 *       200:
 *         description: Consulted
 */

//******************************getByIdProduit******************************//
router.post("/getByIdProduit", authorization(["ADMIN"]), async (req, res) => {
  //**let's validate the data before we make a produit**//
  const schema = joi.object({
    id: joi.string().required(),
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json(error.details[0].message);

  //**checking if the product exists**//.

  const produit = await Produit.findById(req.body.id);
  if (produit) {
    const result = {
      status: "Product :",
      id: produit._id,
      risqueProd: produit.risqueProd,
      prodName: produit.prodName,
    };
    res.json({ result });
  } else {
    return res.status(400).json("Product is not found");
  }
});
/**
 * @swagger
 * /api/produit/updateProduit:
 *    patch:
 *      tags:
 *      - "produit"
 *      summary: "update produit"
 *      description: "Updating product."
 *      operationId: "updateProduit"
 *      produces:
 *      - "application/json"
 *      parameters:
 *      - in: "body"
 *        name: "body"
 *        description: "update Produit"
 *        required: true
 *      responses:
 *       200:
 *         description: Updated
 */
//********************UpdateAdmin********************//
router.patch(
  "/updateProduit",
  authorization(["ADMIN"]),
  async (req, res, next) => {
    try {
      const produitId = req.query.id;
      const produit = await Produit.findById(produitId);
      if (!produit) res.json("Product is not found .");
      Object.assign(produit, req.body);
      produit.save();
      res.json({ data: produit });
    } catch (err) {
      res.status(400).json("Product is not found .");
    }
  }
);

/**
 * @swagger
 * /api/admin/listingProduit:
 *    get:
 *      tags:
 *      - "produit"
 *      summary: "Listing Produit"
 *      description: "Lister tous les produits"
 *      operationId: "listingProduit"
 *      produces:
 *      - "application/json"
 *      responses:
 *       200:
 *         description: Listed
 */
//********************listingProduit********************//
router.get(
  "/listingProduit",
  authorization(["ADMIN"]),
  async (req, res, next) => {
    let produits;
    try {
      const { page = 1, limit = 2 } = req.query;
      produits = await Produit.find({}, "-password")
        .limit(limit * 1)
        .skip((page - 1) * limit);
    } catch (err) {
      res.status(400).json(err);
    }
    res.json({
      produits: produits.map((produit) => produit.toObject({ getters: true })),
    });
  }
);
/**
 * @swagger
 * /api/admin/deleteProduit:
 *    delete:
 *      tags:
 *      - "produit"
 *      summary: "Deleting Produit"
 *      description: "Suppromer un produit ."
 *      operationId: "deleteProduit"
 *      produces:
 *      - "application/json"
 *      responses:
 *       200:
 *         description: Deleted
 */
router.delete(
  "/deleteProduit",
  authorization(["ADMIN"]),
  async (req, res, next) => {
    const produitId = req.query.id;
    const produit = await Produit.findById(produitId);
    if (!produit) res.json("Product is not found .");

    try {
      await produit.remove();
    } catch (err) {
      res.json("Something went wrong, could not delete product.", 500);
    }
    res.status(200).json({ message: "Deleted product." });
  }
);
module.exports = router;
