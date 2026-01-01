require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// ==========================
// MIDDLEWARE
// ==========================
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.static("public"));

// ==========================
// TEST ROUTE
// ==========================
app.get("/", (req, res) => {
  res.send("🚀 Expensio Backend is running");
});

// ==========================
// DB CONNECTION
// ==========================
const connectDB = async () => {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Connection Failed");
    console.error(err.message);
    process.exit(1);
  }
};

connectDB();

// ==========================
// ROUTES
// ==========================
app.use("/api/auth", require("./routes/auth"));
app.use("/api/expense", require("./routes/expense"));

// ==========================
// SERVER START
// ==========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

