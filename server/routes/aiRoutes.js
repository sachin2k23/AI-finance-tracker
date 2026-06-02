const express = require("express");
const { getAIInsights } = require("../controllers/aiController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Protected — user must be logged in to get AI insights
router.post("/insights", authMiddleware, getAIInsights);

module.exports = router;