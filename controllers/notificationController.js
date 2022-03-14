const router = require("express").Router();
const Notification = require("../model/Notification");
const joi = require("@hapi/joi");
const {
  ajouterNotifValidation,
} = require("../functions & middelwares/validation");
const { authorization } = require("../functions & middelwares/authorization");

//ADDING NOTIFICATION
/**
 * @swagger
 * /api/admin/ajouterNotification:
 *    post:
 *      tags:
 *      - "admin"
 *      summary: "Create user"
 *      description: "This can only be done by the token of the sueper user."
 *      operationId: "ajouterNotification"
 *      produces:
 *      - "application/json"
 *      parameters:
 *      - in: "body"
 *        name: "body"
 *        description: "Created notification"
 *        required: true
 *      responses:
 *       200:
 *         description: Created
 *      responses:
 *       400:
 *         description: Could not create 
 */
router.post(
  "/ajouterNotification",
  authorization("ADMIN"),
  async (req, res) => {
    // let's validate the notification before we make a notification

    const { error } = ajouterNotifValidation(req.body);
    if (error) return res.status(400).json(error.details[0].message);

    /// creation de nouveau notification

    const notif = new Notification({
      title: req.body.title,
      description: req.body.description,
    });

    try {
      const savedNotification = await notif.save();

      const result = {
        status: "added Notification.",
        id: notif._id,
        title: notif.title,
        description: notif.description,
      };

      res.json({ result });
    } catch (error) {
      res.status(400).json(error);
    }
  }
);

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
 *      responses:
 *       400:
 *         description: could not create
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
      notification: notification.map((notification) =>
        notification.toObject({ getters: true })
      ),
    });
  }
);

//******************************getByIdProduit******************************//
/**
 * @swagger
 * /api/admin/getByIdNotification:
 *    post:
 *      tags:
 *      - "ADMIN"
 *      summary: "Get the notification by id"
 *      description: "This can only be done by the token of the admin."
 *      operationId: "getByIdNotification"
 *      produces:
 *      - "application/json"
 *      parameters:
 *      - in: "body"
 *        name: "body"
 *        description: "getting notification "
 *        required: true
 *      responses:
 *       200:
 *         description: Created
 */
router.post(
  "/getByIdNotification",
  authorization("ADMIN"),
  async (req, res) => {
    //**let's validate the data before we make a notification**//
    const schema = joi.object({
      id: joi.string().required(),
    });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json(error.details[0].message);

    //**checking if the product exists**//.

    const notification = await Notification.findById(req.body.id);
    if (notification) {
      const result = {
        status: "NOTIFICATION :",
        id: notification._id,
        title: notification.title,
        description: notification.description,
      };
      res.json({ result });
    } else {
      return res.status(400).json("Notification dosen't exist");
    }
  }
);
  /**
 * @swagger
 * /api/admin/deleteNotification:
 *    delete:
 *      tags:
 *      - "admin"
 *      summary: "Deleting notification"
 *      description: "This can only be done by the token of the admin."
 *      operationId: "deleteNotification"
 *      produces:
 *      - "application/json"
 *      parameters:
 *      - in: "body"
 *        name: "body"
 *        description: "deleted Notification"
 *        required: true
 *      responses:
 *       200:
 *         description: Created
 */
router.delete(
  "/deleteNotification",
  authorization("SUPERADMIN"),
  async (req, res, next) => {
    const notificationId = req.query.id;
    const notification = await Notification.findById(notificationId);
    if (!notification) res.status(400).json("Notification is not found .");

    try {
      await notification.remove();
    } catch (err) {
      res.json("Something went wrong, could not delete Notification.");
    }
    res.status(200).json({ message: "Deleted Notification." });
  }
);
module.exports = router;
