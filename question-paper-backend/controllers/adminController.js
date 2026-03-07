const fs = require("fs");
const crypto = require("crypto");
const QuestionPaper = require("../models/QuestionPaper");
exports.uploadPaper = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No PDF file uploaded" });
    }

    const filePath = req.file.path;

    const fileBuffer = fs.readFileSync(filePath);
    const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

    const paper = await QuestionPaper.create({
      fileName: req.file.filename,
      originalName: req.file.originalname,
      hash: hash,
      uploadedBy: req.user.id,
    });
    res.json({
      message: "PDF uploaded successfully",
      fileName: req.file.filename,
      originalName: req.file.originalName,
      hash: hash,
    });
  } catch (error) {
    console.error("Error uploading paper:", error);
  }
};
