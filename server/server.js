const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db")
const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes")
const goalRoutes = require("./routes/goalRoutes");
const billRoutes = require("./routes/billRoutes");

dotenv.config({ path: "./.env" });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/bills", billRoutes);
app.use("/uploads", express.static("uploads"));

// Test Route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

const PORT = process.env.PORT || 5000;
connectDB()

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
