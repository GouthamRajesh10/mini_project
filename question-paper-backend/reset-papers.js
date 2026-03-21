const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/exam_security';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB...");
    const result1 = await mongoose.connection.collection('questionpapers').deleteMany({});
    const result2 = await mongoose.connection.collection('centerpapers').deleteMany({});
    console.log(`Successfully cleared ${result1.deletedCount} original papers and ${result2.deletedCount} distributed papers!`);
    console.log("Your database is now properly synced with your fresh Hardhat node.");
    process.exit(0);
  })
  .catch(err => {
    console.error("Error clearing database:", err);
    process.exit(1);
  });
