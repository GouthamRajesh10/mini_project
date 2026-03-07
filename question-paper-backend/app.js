require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");

connectDB();
const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/admin", adminRoutes);
app.get("/", (req, res) => {
  res.send("Question Paper Backend is Running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
