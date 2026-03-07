const express = require("express");
const router = express.Router();

const { protect, isCentre } = require("../middleware/authmiddleware");
const { downloadPaper } = require("../controllers/centreController");

router.get("/download-paper", protect, isCentre, downloadPaper);
module.exports = router;
