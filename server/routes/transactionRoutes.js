const express = require("express");
const router = express.Router();

const {
  addTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
} = require("../controllers/transactionController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, addTransaction);
router.get("/", authMiddleware, getTransactions);
router.put("/:id", authMiddleware, updateTransaction);
router.delete("/:id", authMiddleware, deleteTransaction);

module.exports = router;
