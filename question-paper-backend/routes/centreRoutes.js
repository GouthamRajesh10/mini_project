const express = require("express");
const router = express.Router();

const { protect, isCentre } = require("../middleware/authmiddleware");
const { getPapers, downloadPaper } = require("../controllers/centreController");

router.get("/papers", protect, isCentre, getPapers);
router.get("/download-paper/:id", protect, isCentre, downloadPaper);
module.exports = router;
