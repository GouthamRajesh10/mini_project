require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const adminPassword = await bcrypt.hash("admin123", 10);
  const centre1Password = await bcrypt.hash("centre1", 10);
  const centre2Password = await bcrypt.hash("centre2", 10);
  const centre3Password = await bcrypt.hash("centre3", 10);

  await User.create([
    {
      username: "admin",
      password: adminPassword,
      role: "Admin",
    },
    {
      username: "centre1",
      password: centre1Password,
      role: "User",
      centreId: "centre1",
    },
    {
      username: "centre2",
      password: centre2Password,
      role: "User",
      centreId: "centre2",
    },
    {
      username: "centre3",
      password: centre3Password,
      role: "User",
      centreId: "centre3",
    },
  ]);
  console.log("Users added successfully");
  process.exit(0);
})();
