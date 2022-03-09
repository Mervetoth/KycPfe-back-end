const router =require("express").Router();
const Notification = require("../model/Notification");
const joi = require("@hapi/joi");
const {ajouterNotifValidation}= require("../functions & middlewares/validation");




//ADDING NOTIFICATION
router.post("/ajouterNotification",async(req,res)=>{


// let's validate the produit before we make a notification 

const {error} = ajouterNotifValidation(req.body);
if (error) return res.status(400).json(error.details[0].message);


/// creation de nouveau notification

const notif = new Notification({})

















});










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

