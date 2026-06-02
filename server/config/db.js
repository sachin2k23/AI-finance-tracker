const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      // ✅ How long to wait for Atlas to respond on cold start (ms)
      serverSelectionTimeoutMS: 10000,

      // ✅ Keep connections alive — reduces per-request reconnect overhead
      maxPoolSize: 10,
      minPoolSize: 2,

      // ✅ If a socket goes idle, close it after 45s
      socketTimeoutMS: 45000,
    });

    console.log("MongoDB connected ✅");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;