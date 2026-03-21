const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { ethers } = require("ethers");
const { PDFDocument, rgb } = require("pdf-lib");
const QuestionPaper = require("../models/QuestionPaper");
const CenterPaper = require("../models/CenterPaper");
const provider = new ethers.JsonRpcProvider("http://localhost:8545");
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const abi = [
  "function storeOriginalPaper(string memory _originalHash) public",
  "function storeCenterPaper(string memory _originalHash, string memory _centerId, string memory _watermarkedHash) public",
  "function originalPapers(string memory) public view returns (string memory,uint256)",
  "function centerPapers(string memory _originalHash, string memory _centerId) public view returns (string memory, string memory, uint256)"
];
exports.uploadPaper = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No PDF file uploaded" });
    }

    const filePath = req.file.path;

    const fileBuffer = fs.readFileSync(filePath);
    const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

    const existingPaper = await QuestionPaper.findOne({ hash });
    if (existingPaper) {
      return res.status(400).json({ message: "This paper has already been uploaded." });
    }

    const signer = await provider.getSigner(0);
    const contract = new ethers.Contract(contractAddress, abi, signer);
    const tx = await contract.storeOriginalPaper(hash);
    await tx.wait();

    const paper = await QuestionPaper.create({
      fileName: req.file.filename,
      originalName: req.file.originalname,
      hash: hash,
      uploadedBy: req.user.userId,
    });
    res.json({
      message: "PDF uploaded successfully",
      fileName: req.file.filename,
      originalName: req.file.originalname,
      hash: hash,
    });
  } catch (error) {
    console.error("Error uploading paper:", error);
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
};

exports.distributePaper = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No PDF file uploaded" });
    }
    const centerId = req.body.centerId || req.body.selectedCenter;

    if (!centerId) {
      return res.status(400).json({ message: "Exam Center not specified" });
    }

    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);
    const originalHash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

    const pdfDoc = await PDFDocument.load(fileBuffer);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    
    const salt = crypto.randomBytes(4).toString('hex');
    const timestamp = new Date().toISOString();
    const watermarkText = `SIGNATURE: ${salt} | CENTER: ${centerId} | DATE: ${timestamp}`;

    const { width, height } = firstPage.getSize();
    firstPage.drawText(watermarkText, {
      x: 50,
      y: height - 50,
      size: 14,
      color: rgb(0.8, 0.1, 0.1),
    });

    const modifiedPdfBytes = await pdfDoc.save();
    const watermarkedHash = crypto.createHash("sha256").update(modifiedPdfBytes).digest("hex");

    const distFileName = `${Date.now()}-${req.file.originalname}`;
    const distPath = path.join(__dirname, "../uploads/distributed", distFileName);
    fs.writeFileSync(distPath, modifiedPdfBytes);

    const signer = await provider.getSigner(0);
    const contract = new ethers.Contract(contractAddress, abi, signer);
    
    const tx = await contract.storeCenterPaper(originalHash, centerId, watermarkedHash);
    await tx.wait();

    await CenterPaper.create({
      originalHash,
      centerId,
      watermarkedHash,
      filePath: distPath,
      distributedBy: req.user.userId,
    });

    res.json({
      message: "Paper successfully distributed and digitally signed.",
      watermarkedHash,
      centerId,
    });

  } catch (error) {
    console.error("Error distributing paper:", error);
    res.status(500).json({ message: "Distribution failed", error: error.message });
  }
};

exports.verifyHash = async (req, res) => {
  try {
    const { hash } = req.body;
    if (!hash) return res.status(400).json({ message: "Hash is required" });

    const signer = await provider.getSigner(0);
    const contract = new ethers.Contract(contractAddress, abi, signer);

    // 1. Verify if it's an Original Paper
    try {
      const origResult = await contract.originalPapers(hash);
      if (origResult && origResult[0] === hash) {
        return res.json({ valid: true, type: "Original Question Paper" });
      }
    } catch (e) {
      // Ignore execution revert and proceed to check distributed mappings
    }

    // 2. Lookup in MongoDB to find the required keys for the blockchain mapping
    const centerRecord = await CenterPaper.findOne({ watermarkedHash: hash });
    
    if (centerRecord) {
      // If we found a trace, strictly ask the BLOCKCHAIN if it's true (Source of Truth)
      const centerResult = await contract.centerPapers(centerRecord.originalHash, centerRecord.centerId);
      
      // ABI returns (string centerId, string watermarkedHash, uint256 timestamp)
      if (centerResult && centerResult[1] === hash) {
        return res.json({ valid: true, type: `Distributed Copy (${centerRecord.centerId})` });
      }
    }

    res.json({ valid: false, message: "This exact hash is not recorded on the blockchain." });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ message: "Verification failed", error: error.message });
  }
};
