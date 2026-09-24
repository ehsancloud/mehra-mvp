const express = require("express");
const { body } = require("express-validator");
const validate = require("../middlewares/validate");
const { authLimiter } = require("../middlewares/security");
const { protect, authorize } = require("../middlewares/auth");
const { createNotification, getNotifications, getNotificationById, updateNotification, markNotificationAsRead, deleteNotification } = require("../controllers/notificationController");

const router = express.Router();

router.post(
    "/create",
    protect,
    authorize("supervisor" , "admin"),
    [
        body("type")
            .isIn(["project", "ticket", "wallet"]),
        body("title")
            .isString()
            .notEmpty(),

        body("text")
            .isString()
            .notEmpty(),
    ],
    validate,
    createNotification
);

router.get(
    "/",
    protect,
    getNotifications
);
router.get(
    "/:id",
    protect,
    getNotificationById
);


router.put(
    "/:id",
    protect,
    authorize("admin"),
    updateNotification
);

router.put(
    "/:id/read",
    protect,
    markNotificationAsRead
);
router.delete(
    "/:id",
    protect,
    authorize("admin"),
    deleteNotification
);


module.exports = router;