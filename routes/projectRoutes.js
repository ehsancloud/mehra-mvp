const express = require("express");
const { body } = require("express-validator");
const validate = require("../middlewares/validate");
const { authLimiter } = require("../middlewares/security");
const { protect, authorize } = require("../middlewares/auth");
const { getProjects, createProject , updateProject , getProjectById , deleteProject, assignFreelancer, addProjectReview, editProjectPrice, editRequestByEmployer, confirmResultResult } = require("../controllers/projectController");
const { getFinanceProjectByProjectId } = require("../controllers/financeProjectController");
const { createProposal, getProposalsForProject, readProposalById , getProposalStatusLabel, deleteProposal, reviewProposal, declareReadiness } = require("../controllers/proposalController");

const router = express.Router();

// check out and test all of these later
router.post("/" , protect , authorize("supervisor" , "admin") , [
    body("title").isString().trim().notEmpty(),
    body("description").isString().notEmpty(),
    body("priority").isString().notEmpty(),
    body("budget").notEmpty(),
    body("deadline").notEmpty()
  ],
  validate , createProject);
router.get("/" , protect , getProjects);
router.get("/:id" , protect , getProjectById);
router.put("/:id" , protect , authorize("supervisor" , "admin") , updateProject);
router.delete("/:id" , protect , authorize("admin") , deleteProject);
router.get("/:id/finance", protect , authorize("supervisor" , "admin") , getFinanceProjectByProjectId);

// Proposals 
router.post("/:id/proposals/create" , protect , authorize("freelancer" , "supervisor" , "admin") , createProposal);
router.get("/:id/proposals" , protect , authorize("freelancer" , "supervisor", "admin") , getProposalsForProject);
router.get("/:id/proposals/statusLabel" , protect , authorize("supervisor" , "admin"), getProposalStatusLabel);
router.get("/:id/proposals/:id2" , protect , authorize("freelancer" , "supervisor", "admin") , readProposalById);
router.delete("/:id/proposals/:id2" , protect , authorize("admin") , deleteProposal);
router.put("/:id/proposals/:id2" , protect , authorize("supervisor" , "admin") , reviewProposal);



// assign a freelancer
router.post("/:id/assign" , protect , authorize("supervisor" , "admin") , assignFreelancer);

//declareReadiness
router.post("/:id/apply" , protect , authorize("freelancer") , declareReadiness );

// add review 
router.post("/:id/reviews" , protect, authorize("employer" , "supervisor" , "admin") , [body("rating").exists().isInt({ min: 1, max: 5 }),
  body("comment").isString().trim().isLength({ max: 1000 })
] , validate , addProjectReview);

// edit project price
router.put("/:id/price" , protect ,authorize("supervisor" , "admin") , editProjectPrice);

// edit request by employer
router.post("/:id/submit/editRequest" , protect , authorize("employer" , "admin")  , editRequestByEmployer);
// confirm final result and end the project
router.post("/:id/confirmResult" , protect , authorize("employer" , "supervisor" , "admin") , confirmResultResult);


module.exports = router;