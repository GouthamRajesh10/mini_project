const mongoose = require("mongoose");

const questionPaperSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  hash: {
    type: String,
    required: true,
    unique: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
  },
  uploadAt: {
    type: Date,
    default: Date.now,
  },
  blockchainTxiId: {
    type: String,
    default: null,
  },
});
module.exports = mongoose.model("QuestionPaper", questionPaperSchema);
