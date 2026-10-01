const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const Notification = require("../models/Notifications");

const createNotification = asyncHandler(async (req, res) => {

    const notification = await Notification.create({
        ...req.body,
        userId: req.body.userId,
    });

    res.status(201).json({
        message: "Notification created successfully.",
        notification,
    });
});
const getNotifications = asyncHandler(async (req, res) => {

    const notifications = await Notification
        .find({
            userId: req.user._id,
            isRead: false
        })
        .sort({
            createdAt: -1,
        });

    res.status(200).json({
        count: notifications.length,
        notifications,
    });
});

const getNotificationById = asyncHandler(async (req, res) => {

    const notification = await Notification.findById(
        req.params.id
    );

    if (!notification) {
        throw new ApiError(
            404,
            "Notification not found."
        );
    }

    // User can only see their own notification
    if (
        req.user.role !== "admin" &&
        !notification.userId.equals(req.user._id)
    ) {
        throw new ApiError(
            403,
            "You can't access this notification."
        );
    }

    res.status(200).json(notification);
});

// only admin
const updateNotification = asyncHandler(async (req, res) => {

    const notification = await Notification.findById(
        req.params.id
    );

    if (!notification) {
        throw new ApiError(
            404,
            "Notification not found."
        );
    }

    const updatedNotification =
        await Notification.findByIdAndUpdate(
            req.params.id,
            {
                $set: req.body,
            },
            {
                new: true
            }
        );

    res.status(200).json({
        message: "Notification updated successfully.",
        notification: updatedNotification,
    });
});

// only admin
const deleteNotification = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(
        req.params.id
    );

    if (!notification) {
        throw new ApiError(
            404,
            "Notification not found."
        );
    }
    await notification.deleteOne();
    res.status(200).json({
        message: "Notification deleted successfully.",
    });
});


const markNotificationAsRead = asyncHandler(async (req, res) => {

    const notification = await Notification.findById(
        req.params.id
    );

    if (!notification) {
        throw new ApiError(
            404,
            "Notification not found."
        );
    }

    if (!notification.userId.equals(req.user._id)) {
        throw new ApiError(
            403,
            "You can't access this notification."
        );
    }

    notification.isRead = true;

    await notification.save();

    res.status(200).json({
        message: "Notification marked as read.",
        notification,
    });
});

module.exports = { createNotification , getNotificationById , getNotifications , updateNotification , deleteNotification , markNotificationAsRead};
