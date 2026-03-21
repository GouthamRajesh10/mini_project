const mongoose = require("mongoose");

const centerPaperSchema = new mongoose.Schema({
  originalHash: {
    type: String,
    required: true,
  },
  centerId: {
    type: String,
    required: true,
  },
  watermarkedHash: {
    type: String,
    required: true,
    unique: true,
  },
  filePath: {
    type: String,
    required: true,
  },
  distributedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  distributedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("CenterPaper", centerPaperSchema);
