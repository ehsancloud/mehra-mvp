const express = require("express");
const { body } = require("express-validator");
const validate = require("../middlewares/validate");
const { protect, authorize } = require("../middlewares/auth");
const { createfinanceProject, getFinanceProjectById, getFinanceProjects , updateFinanceProject,
  deleteFinanceProject,
  deleteTransaction , readTransactions , createTransaction,releaseFinanceTransaction, 
  getFinanceStats} = require("../controllers/financeProjectController");
// finance/... /finance/transactions/{id}/release
const router = express.Router();
router.get("/stats" , protect , authorize("supervisor" , "admin") , getFinanceStats)
router.post("/" , protect , authorize("supervisor" , "admin") , createfinanceProject);
router.get("/:id" , protect , authorize("supervisor" , "admin"), getFinanceProjectById);
router.get("/" , protect , authorize("supervisor" , "admin") , getFinanceProjects);
router.put("/:id" , protect , authorize("supervisor" , "admin")  , updateFinanceProject);
router.delete("/:id" , protect , authorize("admin")  , deleteFinanceProject);

// transactions
router.post("/:id/transactions" , protect ,authorize("supervisor" , "admin") , createTransaction );
router.get("/:id/transactions" , protect ,authorize("supervisor" , "admin") , readTransactions );
router.delete("/:id/transactions/:id2" , protect ,authorize("supervisor" , "admin") , deleteTransaction );
router.post("/:id/transactions/:id2/release" , protect , authorize("supervisor" , "admin") , releaseFinanceTransaction);

module.exports = router;