const fs = require("fs");
const crypto = require("crypto");
const { ethers } = require("ethers");
const QuestionPaper = require("../models/QuestionPaper");
const provider = new ethers.JsonRpcProvider("http://localhost:8545");
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const abi = [
  "function storeOriginalPaper(string memory _originalHash) public",
  "function originalPapers(string memory) public view returns (string memory,uint256)",
];
exports.uploadPaper = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No PDF file uploaded" });
    }

    const filePath = req.file.path;

    const fileBuffer = fs.readFileSync(filePath);
    const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");
    const signer = await provider.getSigner(0);
    const contract = new ethers.Contract(contractAddress, abi, signer);
    const tx = await contract.storeOriginalPaper(hash);
    await tx.wait();

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
