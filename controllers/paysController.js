const router = require("express").Router();
const joi = require("@hapi/joi");
const jwt = require("jsonwebtoken");
//const {ajouterPaysValidation}= require("../functions & middlewares/validation");
const Pays =require("../model/Pays");


const ajouterPaysValidation = (data) => {
    const schema = {
      paysRisque: joi.number().required(),
      pays: joi.string().required(),
    };
    return joi.validate(data, schema);
  };
  
  
//**********Ajouter pays *******************************/

router.post("/ajouterPays",async(req,res)=>{
console.log("nermineblabla")
// validation de data 

const {error} = ajouterPaysValidation(req.body);
if (error)return(400).send(error.details[0].message);

// creation de pays 

const pays = new Pays({
 
pays:req.body.pays,
paysRisque:req.body.paysRisque

});
try{
const savedPays = await pays.save();

const result = {
    status:"added country.",
    id:pays._id,
    paysRisque:pays.paysRisque,
    pays:pays.pays,
};

res.json({result});

}catch(error){

res.status(400).json(error);

}});


/******************************consulterPays******************************/
router.post("/consulterPays", async (req, res) => {
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
router.patch("/updatePays", async (req, res, next) => {
  
  try {
    const paysId = req.query.id;
    const pays = await Pays.findById(paysId);
    if (!pays)res.json("Pays is not found .")
    Object.assign(pays, req.body);
    pays.save();
    res.json({ data: pays });
  } catch (err) {
    res.status(400).json("Pays is not found .");
  }

});





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
router.get(
    "/listingPays",
    async (req, res, next) => {
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
    }
  );




  router.delete("/deletePays", async (req, res, next) => {
    const paysId = req.query.id;
    const pays = await Pays.findById(paysId);
    if (!pays)res.json("country is not found .")
  
  try {
    await pays.remove();
  } catch (err) {
    res.json(
      'Something went wrong, could not delete country.',
      500
    );
    
  }
  res.status(200).json({ message: 'Deleted country.' });
  
    });








module.exports=router;