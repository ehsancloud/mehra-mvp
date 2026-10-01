const express = require("express");
const { body } = require("express-validator");
const validate = require("../middlewares/validate");
const { authLimiter } = require("../middlewares/security");
const { createTicket, getTickets, getTicketById, deleteTicket, updateTicket ,convertTicketToProject , getTicketMessages , verifyFreelancer} = require("../controllers/ticketController")
const { protect, authorize } = require("../middlewares/auth");
const { sendTicketMessage, deleteMessage , updateMessage } = require("../controllers/ticketMessageController");

const router = express.Router();


router.post("/" , protect, [
    body("title").isString().trim().notEmpty(),
    body("description").isString().notEmpty(),
    body("department").isString(),
    body("priority").isString().notEmpty(),
] , validate , createTicket)

router.get("/" , protect , getTickets);
router.get("/find/:id" , protect , getTicketById);
router.post("/:id/convert" , protect , authorize("supervisor" , "admin") , convertTicketToProject);
//check these two
router.delete("/:id" , protect, authorize("supervisor", "admin") , deleteTicket);
router.put("/:id" , protect, authorize("supervisor", "admin") , updateTicket);
//check these two then
router.get("/:id/messages" , protect , getTicketMessages);
router.post("/:id/messages", protect , sendTicketMessage);
router.delete("/:id/messages/:id2" , protect , authorize("admin") , deleteMessage);
router.put("/:id/messages/:id2" , protect , authorize("admin") , updateMessage);

// authenticate freelancer throw auth ticket
router.post("/:id/verifyFreelancer" , protect , authorize("supervisor" , "admin"), verifyFreelancer)
module.exports = router;