const CenterPaper = require("../models/CenterPaper");
const QuestionPaper = require("../models/QuestionPaper");
const User = require("../models/User");
const path = require("path");

exports.getPapers = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const centerPapers = await CenterPaper.find({ centerId: user.centreId }).sort({ distributedAt: -1 }).lean();
    
    const formattedPapers = await Promise.all(centerPapers.map(async paper => {
      const parent = await QuestionPaper.findOne({ hash: paper.originalHash });
      return {
        ...paper,
        originalName: parent ? parent.originalName : path.basename(paper.filePath),
        uploadAt: paper.distributedAt
      };
    }));

    res.json(formattedPapers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching papers", error });
  }
};

exports.downloadPaper = async (req, res) => {
  try {
    const paper = await CenterPaper.findById(req.params.id);
    if (!paper) {
      return res.status(404).json({ message: "Paper not found" });
    }
    
    const user = await User.findById(req.user.userId);
    if (paper.centerId !== user.centreId) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    const parent = await QuestionPaper.findOne({ hash: paper.originalHash });
    const downloadName = parent ? `Signed_${parent.originalName}` : path.basename(paper.filePath);
    
    res.download(paper.filePath, downloadName);
  } catch (error) {
    res.status(500).json({ message: "Error downloading paper", error });
  }
};
