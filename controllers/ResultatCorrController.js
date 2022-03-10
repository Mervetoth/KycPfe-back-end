const router = require("express").Router();
const ResultatCorr = require("../model/ResultatCorr");
const joi = require("@hapi/joi");
const {
  ajouerResultatCorrespondacesValidation,
} = require("../functions & middelwares/validation");
/**
 * @swagger
 * /api/admin/ajouterResultatCorrespondaces:
 *    post:
 *      tags:
 *      - "resultatCorr"
 *      summary: "Create Match Result "
 *      description: "Crating Match Result "
 *      operationId: "createresultatCorrespondaces"
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

/**********************************ajouterResultatCorrespondaces**********************************/
router.post("/ajouterResultatCorrespondaces", async (req, res) => {
  //**let's validate the data before we make a resultatCorr**//

  const { error } = ajouerResultatCorrespondacesValidation(req.body);
  if (error) return res.status(400).json(error.details[0].message);

  //******************** create new Match Result ********************//
  const resultatCorr = new ResultatCorr({
    userId: req.body.userId,
    prodName: req.body.prodName,
  });
  try {
    await resultatCorr.save();

    const user = await User.findById(req.body.userId);
    if (!user) return res.status(400).json("User is not found !");

    const result = {
      status: "Created Match Result  .",
      userId: resultatCorr.userId,
      selctionRecherche: resultatCorr.selctionRecherche,
    };
    res.json({ result });
  } catch (err) {
    res.status(400).json(err);
  }
});
/**
 * @swagger
 * /api/admin/getByIdResultatCorrespondaces:
 *    post:
 *      tags:
 *      - "resultatCorr"
 *      summary: "Consult Match Result "
 *      description: "Consulting Match Result "
 *      operationId: "getByIdResultatCorrespondaces"
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

//******************************getByIdResultatCorrespondaces******************************//
router.post("/getByIdResultatCorrespondaces", async (req, res) => {
  //**let's validate the data before we make a resultatCorr**//
  const schema = joi.object({
    id: joi.string().required(),
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json(error.details[0].message);

  //**checking if the email exists**//.

  const resultatCorr = await ResultatCorr.findById(req.body.id);
  if (!resultatCorr) return res.status(400).json("   Matches is not found");

  const result = {
    status: "Result Matches :",
    id: resultatCorr._id,
    userId: resultatCorr.userId,
    prodName: resultatCorr.prodName,
  };
  res.json({ result });
});
/**
 * @swagger
 * /api/resultatCorr/updateResultatCorrespondaces:
 *    patch:
 *      tags:
 *      - "resultatCorr"
 *      summary: "update resultatCorr"
 *      description: "Updating Match Result ."
 *      operationId: "updateResultatCorrespondaces"
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
router.patch("/updateResultatCorrespondaces", async (req, res, next) => {
  try {
    const resultatCorrespondacesId = req.query.id;
    const resultatCorr = await ResultatCorr.findById(resultatCorrespondacesId);
    if (!resultatCorr) res.json("Result Matches is not found .");
    Object.assign(resultatCorr, req.body);
    resultatCorr.save();
    res.json({ data: resultatCorr });
  } catch (err) {
    res.status(400).json("Result Matches is not found .");
  }
});

/**
 * @swagger
 * /api/admin/listingResultatCorrespondaces:
 *    get:
 *      tags:
 *      - "resultatCorr"
 *      summary: "Listing ResultatCorr"
 *      description: "Lister tous les resultatCorrespondacess"
 *      operationId: "listingResultatCorrespondaces"
 *      produces:
 *      - "application/json"
 *      responses:
 *       200:
 *         description: Listed
 */
//********************listingResultatCorrespondaces********************//
router.get("/listingResultatCorrespondaces", async (req, res, next) => {
  let resultatCorrespondacess;
  try {
    const { page = 1, limit = 2 } = req.query;
    resultatCorrespondacess = await ResultatCorr.find({}, "-password")
      .limit(limit * 1)
      .skip((page - 1) * limit);
  } catch (err) {
    res.status(400).json(err);
  }
  res.json({
    resultatCorrespondacess: resultatCorrespondacess.map((resultatCorr) =>
      resultatCorr.toObject({ getters: true })
    ),
  });
});
/**
 * @swagger
 * /api/admin/deleteResultatCorrespondaces:
 *    delete:
 *      tags:
 *      - "resultatCorr"
 *      summary: "Deleting ResultatCorr"
 *      description: "Suppromer un resultatCorr ."
 *      operationId: "deleteResultatCorrespondaces"
 *      produces:
 *      - "application/json"
 *      responses:
 *       200:
 *         description: Deleted
 */
router.delete("/deleteResultatCorrespondaces", async (req, res, next) => {
  const resultatCorrespondacesId = req.query.id;
  const resultatCorr = await ResultatCorr.findById(resultatCorrespondacesId);
  if (!resultatCorr) res.json("Result Matches is not found .");

  try {
    await resultatCorr.remove();
  } catch (err) {
    res.json("Something went wrong, could not delete Match Result .", 500);
  }
  res.status(200).json({ message: "Deleted Match Result ." });
});
module.exports = router;
