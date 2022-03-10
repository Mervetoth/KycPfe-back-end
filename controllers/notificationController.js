const router =require("express").Router();
const Notification = require("../model/Notification");
const joi = require("@hapi/joi");
const {ajouterNotifValidation}= require("../functions & middelwares/validation");
const { authorization } = require("../functions & middelwares/authorization");





//ADDING NOTIFICATION
router.post("/ajouterNotification",authorization(["ADMIN"]),async(req,res)=>{


// let's validate the notification before we make a notification 

const {error} = ajouterNotifValidation(req.body);
if (error) return res.status(400).json(error.details[0].message);


/// creation de nouveau notification

const notif = new Notification({

    title:req.body.title,
    description:req.body.description
  })

    try{
const savedNotification = await notif.save();

const result = {
    status:"added Notification.",
    id:notif._id,
    title:notif.title,
    description:notif.description,
};

res.json({result});

}catch(error){

res.status(400).json(error);

}

})




//listing notification


/**
 * @swagger
 * /api/admin/listingNotification:
 *    get:
 *      tags:
 *      - "notification"
 *      summary: "Listing Notification"
 *      description: "Lister tous les notifications"
 *      operationId: "listingNotification"
 *      produces:
 *      - "application/json"
 *      responses:
 *       200:
 *         description: Created
 */
//********************listingNotification********************//
router.get(
    "/listingNotification",
    authorization("SUPERADMIN"),
    async (req, res, next) => {
      let notification;
      try {
        const { page = 1, limit = 2 } = req.query;
        notification = await Notification.find({}, "-password")
          .limit(limit * 1)
          .skip((page - 1) * limit);
      } catch (err) {
        res.status(400).json(err);
      }
      res.json({
        notification: notification.map((notification) => notification.toObject({ getters: true })),
      });
    }
  );




  //******************************getByIdProduit******************************//
router.post("/getByIdNotification",authorization("ADMIN"), async (req, res) => {
    //**let's validate the data before we make a notification**//
    const schema = joi.object({
      id: joi.string().required(),
    });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json(error.details[0].message);
    
    //**checking if the product exists**//.
    
    const notification = await Notification.findById(req.body.id);
    if (notification) 
    {
    
    const result = {
      status: "NOTIFICATION :",
      id: notification._id,
      title: notification.title,
      description: notification.description,
    }; 
    res.json({ result });
    }
    else
    {
    return res.status(400).json("Notification dosen't exist")}
    
    });


module.exports = router;
